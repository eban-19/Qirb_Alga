import { useState, useEffect, useRef } from 'react';
import { Star, MessageSquare, Edit2, Trash2, Reply, Loader2, TrendingUp, Users, BarChart3, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import apiService from '@/services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface OwnerReviewsSectionProps {
  pensionId: number | string;
}

export default function OwnerReviewsSection({ pensionId }: OwnerReviewsSectionProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({
    trend: [],
    csat: 0,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  // Reply modal state
  const [replyModal, setReplyModal] = useState<{ open: boolean; review: any | null }>({ open: false, review: null });
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchReviews = async () => {
    if (!pensionId) return;
    setLoading(true);
    try {
      const res = await apiService.getPensionReviews(pensionId, {
        page,
        limit,
        approved_only: false // Owners see all reviews for their pension
      });
      if (res.success) {
        setReviews(res.data.items || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching owner reviews:', err);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!pensionId) return;
    setAnalyticsLoading(true);
    try {
      const res = await apiService.getPensionReviewAnalytics(pensionId);
      if (res.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [pensionId, page]);

  useEffect(() => {
    fetchAnalytics();
  }, [pensionId]);

  const openReplyModal = (review: any) => {
    setReplyModal({ open: true, review });
    setReplyText(review.owner_reply || '');
  };

  const handleSubmitReply = async () => {
    if (!replyModal.review) return;
    setSubmittingReply(true);
    try {
      const res = await apiService.submitOwnerReply(replyModal.review.review_id, replyText.trim() || null);
      if (res.success) {
        toast.success(replyText.trim() ? 'Reply posted successfully' : 'Reply removed');
        setReplyModal({ open: false, review: null });
        fetchReviews();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const parseImages = (imagesJson: any): string[] => {
    if (!imagesJson) return [];
    try { return typeof imagesJson === 'string' ? JSON.parse(imagesJson) : imagesJson; } catch { return []; }
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return `http://localhost:3006${url}`;
    return `http://localhost:3006/uploads/${url}`;
  };

  const avgRating = analytics.trend.length > 0
    ? (analytics.trend.reduce((sum: number, t: any) => sum + t.averageRating, 0) / analytics.trend.length).toFixed(1)
    : '—';

  return (
    <div className="space-y-8">
      {/* Analytics Overview Cards */}
      <div className="grid sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Star className="w-5 h-5 text-primary fill-primary/30" />
            </div>
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Avg Rating</span>
          </div>
          <p className="text-4xl font-black text-foreground">{avgRating}</p>
          <p className="text-sm text-muted-foreground font-medium mt-1">out of 5 stars</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Reviews</span>
          </div>
          <p className="text-4xl font-black text-foreground">{analytics.totalReviews}</p>
          <p className="text-sm text-muted-foreground font-medium mt-1">verified guests</p>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Satisfaction</span>
          </div>
          <p className="text-4xl font-black text-foreground">{analytics.csat}%</p>
          <p className="text-sm text-muted-foreground font-medium mt-1">4-5 star ratings</p>
        </div>
      </div>

      {/* Rating Trend Chart */}
      <div className="p-6 rounded-3xl bg-card border border-border shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Rating Trend Over Time</h3>
        </div>
        {analyticsLoading ? (
          <div className="flex items-center justify-center h-44">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : analytics.trend.length === 0 ? (
          <div className="flex items-center justify-center h-44 text-muted-foreground font-medium">
            Not enough data yet to display trends.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={analytics.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                labelStyle={{ fontWeight: 'bold', color: 'hsl(var(--foreground))' }}
                formatter={(val: any) => [`${val} ★`, 'Average Rating']}
              />
              <Line type="monotone" dataKey="averageRating" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 5, fill: 'hsl(var(--primary))' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Reviews Feed */}
      <div className="space-y-5">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Guest Reviews ({analytics.totalReviews})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-muted/30 border border-border/40">
            <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-bold text-foreground mb-1">No reviews yet</p>
            <p className="text-muted-foreground text-sm">Guest reviews will appear here once customers review your pension.</p>
          </div>
        ) : (
          <>
            {reviews.map((review) => {
              const images = parseImages(review.images);
              return (
                <div key={review.review_id} className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-primary/10">
                        <AvatarFallback className="bg-primary/5 text-primary font-bold">
                          {review.full_name?.charAt(0).toUpperCase() || 'G'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-foreground text-sm">{review.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-4 h-4 fill-current ${s <= review.rating ? 'text-yellow-500' : 'text-muted-foreground/25'}`} />
                        ))}
                      </div>
                      {!review.is_approved && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-bold">
                          Pending Approval
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-foreground leading-relaxed text-sm whitespace-pre-line">{review.comment}</p>
                  )}

                  {/* Images */}
                  {images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {images.map((img, i) => (
                        <img
                          key={i}
                          src={getImageUrl(img)}
                          alt={`Review image ${i + 1}`}
                          className="w-14 h-14 rounded-xl object-cover border border-border/60"
                        />
                      ))}
                    </div>
                  )}

                  {/* Owner Reply */}
                  {review.owner_reply && (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-1">
                      <p className="text-xs font-bold text-primary flex items-center gap-1">
                        <Reply className="w-3.5 h-3.5" /> Your Response
                      </p>
                      <p className="text-sm text-foreground font-medium">{review.owner_reply}</p>
                    </div>
                  )}

                  {/* Reply Button */}
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openReplyModal(review)}
                      className="rounded-xl text-xs font-bold h-9 border-border gap-1.5 hover:bg-primary/5 hover:border-primary/30"
                    >
                      <Reply className="w-3.5 h-3.5 text-primary" />
                      {review.owner_reply ? 'Edit Reply' : 'Reply to Review'}
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="rounded-xl">Previous</Button>
                <span className="text-sm font-bold text-muted-foreground">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="rounded-xl">Next</Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reply Modal */}
      <Dialog open={replyModal.open} onOpenChange={(open) => !open && setReplyModal({ open: false, review: null })}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-border shadow-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-black text-foreground flex items-center gap-2">
              <Reply className="w-5 h-5 text-primary" />
              {replyModal.review?.owner_reply ? 'Edit Your Reply' : 'Reply to Review'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {replyModal.review && (
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-3.5 h-3.5 fill-current ${s <= replyModal.review?.rating ? 'text-yellow-500' : 'text-muted-foreground/25'}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic leading-relaxed">
                  "{replyModal.review?.comment}"
                </p>
                <p className="text-xs font-bold text-muted-foreground">— {replyModal.review?.full_name}</p>
              </div>
            )}

            <Textarea
              placeholder="Write a thoughtful, professional reply to this review..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="min-h-[120px] rounded-2xl border border-border p-4 bg-muted/20 focus:ring-2 focus:ring-primary focus-visible:ring-primary font-medium text-sm"
            />
            {replyModal.review?.owner_reply && (
              <button
                type="button"
                onClick={() => setReplyText('')}
                className="text-xs text-destructive font-bold hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Remove reply
              </button>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" disabled={submittingReply} onClick={() => setReplyModal({ open: false, review: null })} className="rounded-xl font-bold border border-border">Cancel</Button>
            <Button onClick={handleSubmitReply} disabled={submittingReply} className="rounded-xl bg-primary hover:bg-primary/95 font-bold flex items-center gap-1.5">
              {submittingReply && <Loader2 className="w-4 h-4 animate-spin" />}
              <Send className="w-4 h-4" />
              {replyText.trim() ? 'Post Reply' : 'Remove Reply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
