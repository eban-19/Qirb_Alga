import { useState, useEffect } from 'react';
import { Star, CheckCircle2, XCircle, AlertTriangle, Eye, Loader2, MessageSquare, Flag, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import apiService from '@/services/api';

export function AdminReviewsModerationTab() {
  const [activeView, setActiveView] = useState<'pending' | 'reported'>('pending');

  // Pending Reviews State
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [pendingTotal, setPendingTotal] = useState(0);

  // Reported Reviews State
  const [reportedReviews, setReportedReviews] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsTotalPages, setReportsTotalPages] = useState(1);
  const [reportsTotal, setReportsTotal] = useState(0);

  // Reject Modal State
  const [rejectModal, setRejectModal] = useState<{ open: boolean; reviewId: number | null }>({ open: false, reviewId: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  const fetchPending = async () => {
    setPendingLoading(true);
    try {
      const res = await apiService.getAdminPendingReviews(pendingPage, 10);
      if (res.success) {
        setPendingReviews(res.data?.items || []);
        setPendingTotalPages(res.data?.pagination?.totalPages || 1);
        setPendingTotal(res.data?.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Fetch pending reviews error:', err);
      toast.error('Failed to load pending reviews');
    } finally {
      setPendingLoading(false);
    }
  };

  const fetchReported = async () => {
    setReportsLoading(true);
    try {
      const res = await apiService.getAdminReportedReviews(reportsPage, 10);
      if (res.success) {
        setReportedReviews(res.data?.items || []);
        setReportsTotalPages(res.data?.pagination?.totalPages || 1);
        setReportsTotal(res.data?.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Fetch reported reviews error:', err);
      toast.error('Failed to load reported reviews');
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, [pendingPage]);
  useEffect(() => { fetchReported(); }, [reportsPage]);

  const handleApprove = async (reviewId: number) => {
    try {
      const res = await apiService.approveReview(reviewId);
      if (res.success) {
        toast.success('Review approved and published');
        fetchPending();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve review');
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    if (!rejectModal.reviewId) return;
    setSubmittingReject(true);
    try {
      const res = await apiService.rejectReview(rejectModal.reviewId, rejectionReason);
      if (res.success) {
        toast.success('Review rejected');
        setRejectModal({ open: false, reviewId: null });
        setRejectionReason('');
        fetchPending();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject review');
    } finally {
      setSubmittingReject(false);
    }
  };

  const handleResolveReport = async (reportId: number, status: 'Resolved' | 'Dismissed', hideReview?: boolean) => {
    try {
      const res = await apiService.resolveReport(reportId, status, hideReview);
      if (res.success) {
        toast.success(`Report ${status.toLowerCase()}`);
        fetchReported();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update report');
    }
  };

  const parseImages = (v: any): string[] => {
    if (!v) return [];
    try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return []; }
  };

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center gap-1 bg-muted/40 p-1.5 rounded-2xl border border-border/50 w-fit">
        <button
          onClick={() => setActiveView('pending')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeView === 'pending'
              ? 'bg-card text-foreground shadow border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Pending Approval
          {pendingTotal > 0 && (
            <span className="bg-amber-500 text-white text-xs font-black rounded-full min-w-5 h-5 flex items-center justify-center px-1.5">
              {pendingTotal}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveView('reported')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeView === 'reported'
              ? 'bg-card text-foreground shadow border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Flag className="w-4 h-4" />
          Reported Reviews
          {reportsTotal > 0 && (
            <span className="bg-destructive text-destructive-foreground text-xs font-black rounded-full min-w-5 h-5 flex items-center justify-center px-1.5">
              {reportsTotal}
            </span>
          )}
        </button>
      </div>

      {/* PENDING REVIEWS VIEW */}
      {activeView === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Pending Reviews ({pendingTotal})</h3>
            <Button variant="outline" size="sm" onClick={fetchPending} className="rounded-xl gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </div>

          {pendingLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : pendingReviews.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-card border border-border/60">
              <CheckCircle2 className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground mb-1">All Clear!</h3>
              <p className="text-muted-foreground text-sm">No reviews are currently pending approval.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReviews.map((review) => {
                const images = parseImages(review.images);
                return (
                  <div key={review.review_id} className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm space-y-4">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-border">
                          <AvatarFallback className="bg-primary/5 text-primary font-bold">
                            {review.reviewer_name?.charAt(0).toUpperCase() || 'G'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-foreground text-sm">{review.reviewer_name}</p>
                          <p className="text-xs text-muted-foreground">{review.reviewer_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`w-4 h-4 fill-current ${s <= review.rating ? 'text-yellow-500' : 'text-muted-foreground/25'}`} />
                          ))}
                        </div>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-bold">
                          Pending
                        </Badge>
                      </div>
                    </div>

                    {/* Pension info */}
                    <div className="px-3 py-2 bg-muted/40 rounded-xl text-xs font-bold text-muted-foreground">
                      Pension: <span className="text-foreground font-bold">{review.pension_name}</span>
                      {review.pension_address && <span className="font-normal"> — {review.pension_address}</span>}
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
                            src={img.startsWith('http') ? img : `http://localhost:3006${img}`}
                            alt={`Review image ${i + 1}`}
                            className="w-14 h-14 rounded-xl object-cover border border-border/60"
                          />
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Submitted {review.created_at ? new Date(review.created_at).toLocaleString() : ''}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2 border-t border-border/50">
                      <Button
                        onClick={() => handleApprove(review.review_id)}
                        className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve & Publish
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => { setRejectModal({ open: true, reviewId: review.review_id }); setRejectionReason(''); }}
                        className="flex-1 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/5 font-bold h-10 gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                );
              })}

              {/* Pending Pagination */}
              {pendingTotalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                  <Button variant="outline" size="sm" disabled={pendingPage === 1} onClick={() => setPendingPage(p => p - 1)} className="rounded-xl gap-1"><ChevronLeft className="w-4 h-4" /> Prev</Button>
                  <span className="text-sm font-bold text-muted-foreground">{pendingPage} / {pendingTotalPages}</span>
                  <Button variant="outline" size="sm" disabled={pendingPage === pendingTotalPages} onClick={() => setPendingPage(p => p + 1)} className="rounded-xl gap-1">Next <ChevronRight className="w-4 h-4" /></Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* REPORTED REVIEWS VIEW */}
      {activeView === 'reported' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Reported Reviews ({reportsTotal})</h3>
            <Button variant="outline" size="sm" onClick={fetchReported} className="rounded-xl gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </div>

          {reportsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : reportedReviews.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-card border border-border/60">
              <Flag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground mb-1">No Reports</h3>
              <p className="text-muted-foreground text-sm">No reviews have been reported at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reportedReviews.map((report) => (
                <div key={report.report_id} className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm space-y-4">
                  {/* Reporter Info */}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          Reported by: {report.user?.full_name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {report.created_at ? new Date(report.created_at).toLocaleString() : ''}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        report.status === 'Pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 text-xs font-bold'
                          : report.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold'
                          : 'bg-muted text-muted-foreground border-border text-xs font-bold'
                      }
                    >
                      {report.status}
                    </Badge>
                  </div>

                  {/* Report Reason */}
                  <div className="px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <p className="text-xs font-bold text-amber-700 mb-1">Reason for Report:</p>
                    <p className="text-sm text-amber-800 font-medium">{report.reason}</p>
                  </div>

                  {/* The Reported Review */}
                  {report.review && (
                    <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Reported Review</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3.5 h-3.5 fill-current ${s <= report.review.rating ? 'text-yellow-500' : 'text-muted-foreground/25'}`} />
                        ))}
                        <span className="text-xs text-muted-foreground ml-2">by {report.review.customer?.full_name}</span>
                        <span className="text-xs text-muted-foreground ml-2">@ {report.review.pension?.name}</span>
                      </div>
                      {report.review.comment && (
                        <p className="text-sm text-foreground leading-relaxed italic">&ldquo;{report.review.comment}&rdquo;</p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {report.status === 'Pending' && (
                    <div className="flex flex-wrap gap-3 pt-2 border-t border-border/50">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolveReport(report.report_id, 'Dismissed')}
                        className="rounded-xl font-bold gap-1.5 hover:bg-muted/80"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Dismiss Report
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleResolveReport(report.report_id, 'Resolved', true)}
                        className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Hide Review & Resolve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolveReport(report.report_id, 'Resolved', false)}
                        className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Resolve (Keep Review)
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {/* Reports Pagination */}
              {reportsTotalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                  <Button variant="outline" size="sm" disabled={reportsPage === 1} onClick={() => setReportsPage(p => p - 1)} className="rounded-xl gap-1"><ChevronLeft className="w-4 h-4" /> Prev</Button>
                  <span className="text-sm font-bold text-muted-foreground">{reportsPage} / {reportsTotalPages}</span>
                  <Button variant="outline" size="sm" disabled={reportsPage === reportsTotalPages} onClick={() => setReportsPage(p => p + 1)} className="rounded-xl gap-1">Next <ChevronRight className="w-4 h-4" /></Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reject Modal */}
      <Dialog open={rejectModal.open} onOpenChange={(open) => !open && setRejectModal({ open: false, reviewId: null })}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-border shadow-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-black text-foreground flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              Reject Review
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Please provide a clear reason for rejecting this review. This reason will be logged internally.
            </p>
            <Textarea
              placeholder="Enter rejection reason (e.g., 'Contains offensive language', 'Fake review detected')..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px] rounded-2xl border border-border p-4 bg-muted/20 focus:ring-2 focus:ring-primary focus-visible:ring-primary font-medium text-sm"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" disabled={submittingReject} onClick={() => setRejectModal({ open: false, reviewId: null })} className="rounded-xl font-bold">Cancel</Button>
            <Button onClick={handleRejectSubmit} disabled={submittingReject} className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold flex items-center gap-1.5">
              {submittingReject && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
