import { useState, useEffect } from 'react';
import { Star, MessageSquare, AlertTriangle, CheckCircle2, X, Loader2, ChevronLeft, ChevronRight, Image as ImageIcon, ChevronDown, ChevronUp, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import apiService from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface PensionReviewsProps {
  pensionId: number;
}

export default function PensionReviews({ pensionId }: PensionReviewsProps) {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  // Loading & Pagination
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(12);

  // Filters & Sorting
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
  const [onlyPhotos, setOnlyPhotos] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // UI State
  const [showDistribution, setShowDistribution] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Report Modal
  const [reportingReview, setReportingReview] = useState<any | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchReviewsData = async () => {
    setLoading(true);
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        apiService.getPensionReviews(pensionId, {
          page,
          limit,
          rating: selectedRating,
          has_images: onlyPhotos,
          sort_by: sortBy
        }),
        apiService.getPensionReviewStats(pensionId)
      ]);

      if (reviewsRes.success) {
        setReviews(reviewsRes.data.items);
        setTotalPages(reviewsRes.data.pagination.totalPages);
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error fetching pension reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsData();
  }, [pensionId, page, selectedRating, onlyPhotos, sortBy]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleReportClick = (review: any) => {
    setReportingReview(review);
    setReportReason('');
    setSubmittingReport(false);
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim()) {
      toast.error('Please specify a reason for reporting');
      return;
    }
    setSubmittingReport(true);
    try {
      const res = await apiService.reportReview(reportingReview.review_id, reportReason);
      if (res.success) {
        toast.success('Review reported. Thank you for helping keep our platform safe.');
        setReportingReview(null);
      }
    } catch (error: any) {
      console.error('Report review error:', error);
      toast.error(error.message || 'Failed to report review');
    } finally {
      setSubmittingReport(false);
    }
  };

  const parseImages = (imagesJson: any): string[] => {
    if (!imagesJson) return [];
    try {
      return typeof imagesJson === 'string' ? JSON.parse(imagesJson) : imagesJson;
    } catch {
      return [];
    }
  };

  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return `http://localhost:3006${url}`;
    return `http://localhost:3006/uploads/${url}`;
  };

  const ratingLabel = (r: number) => ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][r] || '';

  return (
    <div className="space-y-8 pt-12 border-t border-border" id="reviews-section">

      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-heading font-bold text-foreground">Guest Reviews &amp; Ratings</h2>
        <div className="h-1 w-20 bg-primary rounded-full" />
      </div>

      {/* ─── CLICKABLE OVERALL RATING CARD & COLLAPSIBLE DISTRIBUTION ─── */}
      <div className="flex flex-row md:flex-row items-center justify-center gap-6 w-full ">
        {/* ─── RATING DISTRIBUTION (collapsible on the LEFT of the card) ─── */}
        {showDistribution && (
          <div className="w-full md:w-[450px] p-6 rounded-3xl bg-gradient-to-br from-card to-muted/20 border border-border/60 shadow-md space-y-4 animate-in slide-in-from-left-2 duration-300">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Rating Breakdown</h3>
            <div className="flex flex-col gap-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution?.[rating] || 0;
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                return (
                  <button
                    key={rating}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRating(rating === selectedRating ? undefined : rating);
                      setPage(1);
                    }}
                    className={`flex items-center gap-4 text-sm font-semibold rounded-2xl px-3 py-2 transition-all hover:bg-muted/40 ${selectedRating === rating ? 'bg-primary/5 ring-1 ring-primary/20' : ''}`}
                  >
                    <span className="w-14 text-right flex items-center justify-end gap-1 font-bold text-foreground shrink-0">
                      {rating} <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-muted/80 overflow-hidden border border-border/10 shadow-inner">
                      <div
                        style={{ width: `${percentage}%` }}
                        className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500 ease-out"
                      />
                    </div>
                    <span className="w-8 text-right text-muted-foreground font-bold shrink-0">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── THE CARD (on the right when distribution is open, centered when closed) ─── */}
        <button
          type="button"
          onClick={() => setShowDistribution((prev) => !prev)}
          className="group flex justify-center focus:outline-none w-full md:w-1/2"
          aria-expanded={showDistribution}
        >
          <div className="w-full h-[260px] md:h-[340px] flex flex-col items-center justify-center p-6 md:p-10 rounded-3xl bg-gradient-to-br from-card via-card to-primary/[0.04] border border-border/80 shadow-md hover:shadow-xl transition-all duration-300 group-hover:border-primary/20 gap-6">
            {/* Big Score */}
            <div className="flex flex-col items-center justify-center w-56 h-36 rounded-full border border-primary/10 bg-primary/5">
              <span className="text-5xl font-black text-foreground tracking-tighter leading-none">
                {stats.averageRating ? stats.averageRating.toFixed(1) : '—'}
              </span>
              <div className="flex items-center p-3 gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-6 h-6 fill-current transition-colors ${s <= Math.round(stats.averageRating || 0)
                      ? 'text-yellow-500 drop-shadow-[0_0_4px_rgba(234,179,8,0.5)]'
                      : 'text-muted-foreground/20'
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Stars + Count in column */}
            <div className="text-center space-y-2 flex flex-col items-center">
              {/* <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-6 h-6 fill-current transition-colors ${s <= Math.round(stats.averageRating || 0)
                      ? 'text-yellow-500 drop-shadow-[0_0_4px_rgba(234,179,8,0.5)]'
                      : 'text-muted-foreground/20'
                      }`}
                  />
                ))}
              </div> */}
              <p className="text-sm font-semibold text-muted-foreground">
                Based on <span className="font-black text-foreground">{stats.totalReviews}</span>{' '}
                verified {stats.totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Expand chevron without text */}
            <div className="text-muted-foreground transition-transform group-hover:scale-110">
              {showDistribution ? <ChevronsLeft className="w-6 h-6" /> : <ChevronsRight className="w-6 h-6" />}
            </div>
          </div>
        </button>
      </div>

      {/* ─── FILTERS ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-muted/20 border border-border/40">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => { setSelectedRating(undefined); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${selectedRating === undefined
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-card text-muted-foreground hover:bg-muted border border-border/50'
              }`}
          >
            All
          </button>
          {[5, 4, 3, 2, 1].map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => { setSelectedRating(s === selectedRating ? undefined : s); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-1 ${selectedRating === s
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card text-muted-foreground hover:bg-muted border border-border/50'
                }`}
            >
              {s} <Star className="w-3.5 h-3.5 fill-current text-yellow-500" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
            <input
              type="checkbox"
              checked={onlyPhotos}
              onChange={(e) => { setOnlyPhotos(e.target.checked); setPage(1); }}
              className="accent-primary w-4 h-4 rounded"
            />
            With Photos
          </label>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="bg-card text-sm font-bold text-muted-foreground border border-border/50 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="newest">Newest</option>
            <option value="highest_rating">Highest Rating</option>
            <option value="lowest_rating">Lowest Rating</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* ─── MINI REVIEW CARDS GRID ─── */}
      <div className={`relative min-h-[200px] transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {reviews.length === 0 && !loading ? (
          <div className="text-center py-16 rounded-3xl bg-card border border-border/60">
            <MessageSquare className="w-12 h-12 text-muted-foreground/25 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-1">No Reviews Found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto text-sm">
              {selectedRating || onlyPhotos
                ? 'No reviews match your current filters. Try clearing some filters.'
                : 'Nobody has reviewed this pension yet. Reviews appear after a completed stay.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {reviews.map((review) => {
              const imgs = parseImages(review.images);
              const hasImages = imgs.length > 0;

              return (
                <button
                  key={review.review_id}
                  type="button"
                  onClick={() => setSelectedReview(review)}
                  className="group h-23 text-left p-5 rounded-2xl bg-card border border-border/70 hover:border-primary/25 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-row justify-between relative overflow-hidden"
                >
                  {/* Top highlight strip */}
                  {/* <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/50 to-blue-500/50 opacity-0 group-hover:opacity-100 transition-opacity" /> */}

                  {/* Stars */}
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 fill-current ${s <= review.rating ? 'text-yellow-500' : 'text-muted-foreground/20'}`}
                        />
                      ))}
                    </div>
                    {hasImages && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                        <ImageIcon className="w-3 h-3" /> {imgs.length}
                      </span>
                    )}
                  </div>

                  {/* Verified badge + date */}
                  <div className="flex  items-center gap-5">
                    <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 border-emerald-500/20 bg-emerald-50 flex items-center gap-1 py-0.5 px-2 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Verified Stay
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {review.created_at ? new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                    </span>
                  </div>

                  {/* Comment preview */}
                  {/* {review.comment && (
                    <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3 font-medium">
                      {review.comment}
                    </p>
                  )} */}

                  {/* Image strip preview */}
                  {/* {hasImages && (
                    <div className="flex gap-1.5 mt-1">
                      {imgs.slice(0, 3).map((img, i) => (
                        <div key={i} className="w-12 h-12 rounded-lg overflow-hidden border border-border/50 shrink-0">
                          <img src={getFullImageUrl(img)} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {imgs.length > 3 && (
                        <div className="w-12 h-12 rounded-lg bg-muted/60 border border-border/50 flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                          +{imgs.length - 3}
                        </div>
                      )}
                    </div>
                  )} */}

                  {/* Tap to read CTA */}
                  <p className="text-[10px] font-bold text-primary/60 group-hover:text-primary transition-colors uppercase tracking-wider">
                    Detail Review →
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-8">
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              className="rounded-xl border border-border shadow-sm hover:bg-muted/80 disabled:opacity-40 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-sm font-bold text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="rounded-xl border border-border shadow-sm hover:bg-muted/80 disabled:opacity-40 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {/* ─── REVIEW DETAIL MODAL ─── */}
      <Dialog open={!!selectedReview} onOpenChange={(open) => !open && setSelectedReview(null)}>
        <DialogContent className="sm:max-w-lg rounded-3xl border border-border shadow-2xl bg-card p-0 overflow-hidden">
          {selectedReview && (() => {
            const imgs = parseImages(selectedReview.images);
            return (
              <>
                {/* Header gradient bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-primary via-blue-500 to-primary/60" />

                <div className="p-7 space-y-5">
                  <DialogHeader>
                    <div className="flex items-center justify-between">
                      <DialogTitle className="text-lg font-heading font-black text-foreground flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        Verified Guest Review
                      </DialogTitle>
                      <span className="text-xs text-muted-foreground font-semibold">
                        {selectedReview.created_at ? new Date(selectedReview.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                      </span>
                    </div>
                  </DialogHeader>

                  {/* Stars + Label */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-6 h-6 fill-current ${s <= selectedReview.rating
                            ? 'text-yellow-500 drop-shadow-[0_0_4px_rgba(234,179,8,0.4)]'
                            : 'text-muted-foreground/20'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-primary">{ratingLabel(selectedReview.rating)}</span>
                  </div>

                  {/* Comment */}
                  {selectedReview.comment && (
                    <p className="text-foreground leading-relaxed text-[15px] font-medium whitespace-pre-line">
                      {selectedReview.comment}
                    </p>
                  )}

                  {/* Images */}
                  {imgs.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Photos</p>
                      <div className="flex flex-wrap gap-2.5">
                        {imgs.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setLightboxImage(getFullImageUrl(img))}
                            className="w-20 h-20 rounded-2xl overflow-hidden border border-border/80 hover:scale-105 transition-transform shadow-sm group relative"
                          >
                            <img src={getFullImageUrl(img)} alt={`Review photo ${i + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">View</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Host Reply */}
                  {selectedReview.owner_reply && (
                    <div className="p-4 rounded-2xl bg-primary/[0.04] border border-primary/10 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wide">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Host Response
                        {selectedReview.owner_reply_at && (
                          <span className="ml-auto text-muted-foreground font-semibold normal-case tracking-normal">
                            {new Date(selectedReview.owner_reply_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground font-medium leading-relaxed">{selectedReview.owner_reply}</p>
                    </div>
                  )}

                  {/* Report + Close */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    {isAuthenticated ? (
                      <button
                        type="button"
                        onClick={() => { setSelectedReview(null); handleReportClick(selectedReview); }}
                        className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/50 hover:text-yellow-600 transition-colors px-3 py-1.5 rounded-full hover:bg-yellow-50 border border-transparent hover:border-yellow-200"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Report
                      </button>
                    ) : <span />}
                    <Button
                      type="button"
                      onClick={() => setSelectedReview(null)}
                      className="rounded-xl h-9 px-5 font-bold"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ─── LIGHTBOX ─── */}
      <Dialog open={!!lightboxImage} onOpenChange={(open) => !open && setLightboxImage(null)}>
        <DialogContent className="max-w-4xl p-1 bg-black/90 border-none sm:rounded-3xl overflow-hidden flex items-center justify-center min-h-[300px]">
          {lightboxImage && (
            <div className="relative w-full max-h-[85vh] flex items-center justify-center">
              <img src={lightboxImage} alt="Full size" className="max-w-full max-h-[80vh] object-contain rounded-2xl" />
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white rounded-full p-2.5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── REPORT MODAL ─── */}
      <Dialog open={!!reportingReview} onOpenChange={(open) => !open && setReportingReview(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-border shadow-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-black text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Report Review
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Please describe why you believe this review violates community guidelines (e.g. spam, fake review, abusive language).
            </p>
            <Textarea
              placeholder="Describe the issue..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="min-h-[100px] rounded-2xl border border-border p-4 bg-muted/20 focus:ring-2 focus:ring-primary focus-visible:ring-primary font-medium"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" disabled={submittingReport} onClick={() => setReportingReview(null)} className="rounded-xl font-bold">
              Cancel
            </Button>
            <Button onClick={handleSubmitReport} disabled={submittingReport} className="rounded-xl bg-yellow-600 hover:bg-yellow-700 text-white font-bold flex items-center gap-1.5">
              {submittingReport && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
