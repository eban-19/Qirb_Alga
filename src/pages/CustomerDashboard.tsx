import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/use-language";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, User, History, Download, MapPin, Receipt, ShieldCheck, Loader2, Star, Camera, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import apiService from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const CustomerDashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [isPrinting, setIsPrinting] = useState(false);

  // Write/Edit Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [modalRating, setModalRating] = useState(5);
  const [modalComment, setModalComment] = useState('');
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await apiService.getCustomerBookings();
      if (res.success) {
        setBookings(res.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Could not load your bookings");
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchBookings();
    }
  }, [isAuthenticated, user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingImages(true);
    const uploadedUrls: string[] = [...modalImages];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await apiService.uploadImage(file);
        if (res.success && res.data?.url) {
          uploadedUrls.push(res.data.url);
        }
      }
      setModalImages(uploadedUrls);
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload some images');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeModalImage = (indexToRemove: number) => {
    setModalImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmitReview = async () => {
    if (modalRating < 1 || modalRating > 5) {
      toast.error('Please select a rating between 1 and 5 stars');
      return;
    }
    if (!selectedBooking) return;
    
    try {
      if (selectedBooking.review) {
        const res = await apiService.updateReview(selectedBooking.review.review_id, {
          rating: modalRating,
          comment: modalComment,
          images: modalImages
        });
        if (res.success) {
          toast.success('Review updated successfully and is pending approval.');
          setShowReviewModal(false);
          fetchBookings();
        }
      } else {
        const res = await apiService.submitReview(
          selectedBooking.room.pension_id,
          modalRating,
          modalComment,
          modalImages,
          selectedBooking.booking_id
        );
        if (res.success) {
          toast.success('Review submitted successfully and is pending approval.');
          setShowReviewModal(false);
          fetchBookings();
        }
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
    }
  };

  const openReviewModal = (booking: any) => {
    setSelectedBooking(booking);
    if (booking.review) {
      setModalRating(booking.review.rating);
      setModalComment(booking.review.comment || '');
      let imgs: string[] = [];
      if (booking.review.images) {
        try {
          imgs = typeof booking.review.images === 'string' ? JSON.parse(booking.review.images) : booking.review.images;
        } catch {
          imgs = [];
        }
      }
      setModalImages(imgs);
    } else {
      setModalRating(5);
      setModalComment('');
      setModalImages([]);
    }
    setShowReviewModal(true);
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await apiService.deleteReview(reviewId);
      if (res.success) {
        toast.success('Review deleted successfully');
        fetchBookings();
      }
    } catch (error) {
      console.error('Delete review error:', error);
      toast.error('Failed to delete review');
    }
  };

  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return `http://localhost:3006${url}`;
    return `http://localhost:3006/uploads/${url}`;
  };

  const handlePrintReceipt = (booking: any) => {
    setIsPrinting(true);
    // Simple way to trigger print of a specific section or just window.print
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'confirmed': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      case 'completed': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'PAID': return 'text-green-600 bg-green-50 border-green-200';
      case 'PENDING': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'FAILED': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const now = new Date();
  const upcomingBookings = bookings.filter(b => new Date(b.check_out_date) >= now && b.status !== 'Cancelled');
  const pastBookings = bookings.filter(b => new Date(b.check_out_date) < now || b.status === 'Cancelled');
  
  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  if (loading) {
    return <div className="min-h-screen bg-background flex flex-col items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated || user?.role?.toLowerCase() !== 'customer') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="text-xl">Please login to view your dashboard.</p>
        <Button onClick={() => window.location.href = '/login'} className="mt-4">Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-32 container mx-auto px-4 lg:px-8 max-w-6xl no-print">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-heading font-bold mb-2">My Dashboard</h1>
            <p className="text-muted-foreground text-lg">Manage your bookings and view your history.</p>
          </div>
          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/20">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-bold">{user.full_name}</p>
              <p className="text-sm text-muted-foreground">{user.phone}</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-6 border-b border-border pb-1">
            <button 
              onClick={() => setActiveTab('upcoming')}
              className={`pb-3 text-lg font-bold transition-all relative ${activeTab === 'upcoming' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Upcoming
              {activeTab === 'upcoming' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`pb-3 text-lg font-bold transition-all relative ${activeTab === 'history' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              History
              {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
            </button>
          </div>
          
          {loadingBookings ? (
            <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              Loading your bookings...
            </div>
          ) : displayedBookings.length === 0 ? (
            <div className="text-center py-16 bg-card border border-dashed border-border rounded-3xl">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">No {activeTab} Bookings</h3>
              <p className="text-muted-foreground mb-6">
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming reservations." 
                  : "Your booking history is empty."}
              </p>
              {activeTab === 'upcoming' && <Button onClick={() => window.location.href = '/'}>Explore Pensions</Button>}
            </div>
          ) : (
            <div className="grid gap-6">
              {displayedBookings.map((booking) => (
                <div key={booking.booking_id} className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPaymentStatusColor(booking.payment?.status || 'PENDING')}`}>
                              {booking.payment?.status || 'UNPAID'}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">#{booking.booking_id}</span>
                          </div>
                          <h3 className="text-2xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                            {booking.room?.pension?.name || "Pension"}
                          </h3>
                          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            <span>{booking.room?.pension?.address || "Location not specified"}</span>
                          </div>
                        </div>
                        <div className="text-right bg-primary/5 p-3 rounded-2xl border border-primary/10">
                          <p className="text-2xl font-black text-primary leading-none mb-1">ETB {parseFloat(booking.total_price).toLocaleString()}</p>
                          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Total Price</p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-border/50">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <Calendar className="w-5 h-5 shrink-0" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {format(new Date(booking.check_in_date), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">Check-in Date</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                            <Calendar className="w-5 h-5 shrink-0" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {format(new Date(booking.check_out_date), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">Check-out Date</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                            <ShieldCheck className="w-5 h-5 shrink-0" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {booking.pass_code ? (
                                <span className="font-mono tracking-widest text-primary">{booking.pass_code}</span>
                              ) : 'Waiting...'}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">Access Code</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex lg:flex-col justify-end gap-3 border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6 shrink-0">
                      {booking.status === 'Completed' && (
                        <>
                          <Button 
                            className="flex-1 lg:flex-none justify-center gap-2 font-bold h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={() => openReviewModal(booking)}
                          >
                            <Star className="w-4 h-4" /> 
                            {booking.review ? 'Edit Review' : 'Write Review'}
                          </Button>
                          {booking.review && (
                            <Button 
                              variant="outline"
                              className="flex-1 lg:flex-none justify-center gap-2 font-bold h-12 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5"
                              onClick={() => handleDeleteReview(booking.review.review_id)}
                            >
                              <X className="w-4 h-4" /> 
                              Delete Review
                            </Button>
                          )}
                        </>
                      )}
                      <Button 
                        variant="outline" 
                        className="flex-1 lg:flex-none justify-center gap-2 font-bold h-12 rounded-xl"
                        onClick={() => handlePrintReceipt(booking)}
                      >
                        <Receipt className="w-4 h-4" /> 
                        Receipt
                      </Button>
                      <Button 
                        variant="secondary" 
                        className="flex-1 lg:flex-none justify-center gap-2 font-bold h-12 rounded-xl"
                        onClick={() => window.location.href = `/room/${booking.room_id}`}
                      >
                        <History className="w-4 h-4" /> 
                        View Room
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Write/Edit Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-border shadow-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-black text-foreground flex items-center gap-2">
              <Star className="w-5 h-5 text-primary fill-primary/20" />
              {selectedBooking?.review ? 'Edit Review' : 'Write a Review'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="text-center space-y-2">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Overall Service Rating</p>
              <div className="flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setModalRating(s)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        s <= modalRating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-muted-foreground/25 fill-transparent'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Your Feedback</label>
              <Textarea
                placeholder="Share details of your stay... (cleanliness, service, etc.)"
                value={modalComment}
                onChange={(e) => setModalComment(e.target.value)}
                className="min-h-[120px] rounded-2xl border border-border p-4 bg-muted/20 focus:ring-2 focus:ring-primary focus-visible:ring-primary font-medium text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider block">Add Photos</label>
              <div className="flex flex-wrap gap-2">
                {modalImages.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border">
                    <img src={getFullImageUrl(img)} alt="Review attachment" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeModalImage(idx)}
                      className="absolute top-1 right-1 p-0.5 bg-background/80 hover:bg-background rounded-full border border-border"
                    >
                      <X className="w-3 h-3 text-destructive" />
                    </button>
                  </div>
                ))}
                
                {modalImages.length < 5 && (
                  <button
                    type="button"
                    disabled={uploadingImages}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-1 hover:bg-muted/30 transition-colors"
                  >
                    {uploadingImages ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Camera className="w-5 h-5 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground">Upload</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                multiple
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowReviewModal(false)} className="rounded-xl font-bold border border-border">Cancel</Button>
            <Button onClick={handleSubmitReview} className="rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold">
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer className="no-print" />
      
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .container { max-width: 100% !important; width: 100% !important; margin: 0 !important; padding: 20px !important; }
        }
      `}</style>
    </div>
  );
};

export default CustomerDashboard;
