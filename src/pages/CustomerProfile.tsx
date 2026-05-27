import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, MapPin, Package, CreditCard, ChevronRight, Clock, Map,
  Printer, X, CheckCircle2, Download, Home, Star, Camera, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

const CustomerProfile = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const navigate = useNavigate();

  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [modalRating, setModalRating] = useState(5);
  const [modalComment, setModalComment] = useState('');
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBookings = async () => {
    try {
      const response = await apiService.getCustomerBookings();
      if (response.success && response.data) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch customer bookings:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

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
    if (!selectedBookingForReview) return;
    
    try {
      if (selectedBookingForReview.review) {
        const res = await apiService.updateReview(selectedBookingForReview.review.review_id, {
          rating: modalRating,
          comment: modalComment,
          images: modalImages
        });
        if (res.success) {
          toast.success('Review updated successfully.');
          setShowReviewModal(false);
          fetchBookings();
        }
      } else {
        const res = await apiService.submitReview(selectedBookingForReview.room.pension_id, modalRating, modalComment, modalImages);
        if (res.success) {
          toast.success('Review submitted successfully.');
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
    setSelectedBookingForReview(booking);
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'completed': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  if (loading || isDataLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full"></div>
            <p className="text-muted-foreground font-medium">Loading your profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 container mx-auto px-4 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-3xl font-black text-primary border border-primary/20">
                {user?.full_name?.charAt(0) || 'G'}
              </div>
              <div>
                <h1 className="text-3xl font-bold font-heading">{user?.full_name}</h1>
                <p className="text-muted-foreground">{user?.phone || user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="rounded-full px-3 py-1 bg-primary/5 text-primary border-primary/10">Member</Badge>
                  <span className="text-xs text-muted-foreground">Joined {user?.created_at ? format(new Date(user.created_at), 'MMM yyyy') : 'Recently'}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" className="rounded-xl px-6 h-12 border-slate-200 hover:bg-slate-50 gap-2" onClick={() => navigate('/')}>
              Book Another Stay <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Booking History */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-heading flex items-center gap-3">
                <Clock className="w-6 h-6 text-primary" />
                My Booking History
              </h2>
              <span className="text-sm font-medium text-muted-foreground">{bookings.length} Bookings</span>
            </div>

            {bookings.length === 0 ? (
              <Card className="rounded-[2.5rem] border-dashed border-2 p-20 text-center space-y-6 bg-white/50">
                <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <Calendar className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">No bookings found</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">You haven't made any bookings yet. Start exploring our beautiful pensions today!</p>
                </div>
                <Button className="rounded-xl h-12 px-8" onClick={() => navigate('/')}>
                  Explore Pensions
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6">
                {bookings.map((booking) => (
                  <div 
                    key={booking.booking_id}
                    className="group bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-500 hover:border-primary/20"
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="w-full md:w-64 h-48 md:h-auto relative overflow-hidden">
                        <img 
                          src={booking.room?.pension?.image_url ? `http://localhost:3006${booking.room.pension.image_url}` : '/src/assets/room-1.png'} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          alt="" 
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className={`rounded-full px-4 py-1.5 font-bold shadow-lg ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-grow p-8 space-y-6">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{booking.room?.pension?.name}</h3>
                            <div className="flex items-center gap-2 text-muted-foreground mt-1">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span className="text-sm">{booking.room?.pension?.city}, {booking.room?.pension?.region}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Total Paid</p>
                            <p className="text-2xl font-black text-slate-900">ETB {parseFloat(booking.total_price).toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Check-in
                            </p>
                            <p className="font-bold text-sm">{format(new Date(booking.check_in_date), 'MMM dd, yyyy')}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Check-out
                            </p>
                            <p className="font-bold text-sm">{format(new Date(booking.check_out_date), 'MMM dd, yyyy')}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1">
                              <Package className="w-3 h-3" /> Package
                            </p>
                            <p className="font-bold text-sm">{booking.room?.package?.name || 'Standard'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1">
                              <CreditCard className="w-3 h-3" /> Booking ID
                            </p>
                            <p className="font-mono font-bold text-xs">#{booking.booking_id}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-2">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 gap-2 font-bold px-5"
                            onClick={() => {
                              const lat = booking.room?.pension?.latitude;
                              const lng = booking.room?.pension?.longitude;
                              if (lat && lng) {
                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                              } else {
                                toast.error("Location coordinates not available");
                              }
                            }}
                          >
                            <Map className="w-4 h-4" /> Get Directions
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl border-slate-200 text-slate-600 font-bold px-5"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setIsReceiptOpen(true);
                            }}
                          >
                            View Receipt
                          </Button>
                          {booking.status?.toLowerCase() === 'completed' && (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-bold px-5"
                                onClick={() => openReviewModal(booking)}
                              >
                                <Star className="w-4 h-4" />
                                {booking.review ? 'Edit Review' : 'Write Review'}
                              </Button>
                              {booking.review && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="rounded-xl border-destructive/20 text-destructive hover:bg-destructive/5 gap-2 font-bold px-5"
                                  onClick={() => handleDeleteReview(booking.review.review_id)}
                                >
                                  <X className="w-4 h-4" />
                                  Delete Review
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />

      {/* Receipt Modal */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none">
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * {
                visibility: hidden;
              }
              .receipt-to-print, .receipt-to-print * {
                visibility: visible;
              }
              .receipt-to-print {
                position: fixed;
                left: 0;
                top: 0;
                width: 100% !important;
                margin: 0 !important;
                padding: 40px !important;
                background: white !important;
                z-index: 9999;
              }
              .no-print {
                display: none !important;
              }
            }
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}} />
          
          {selectedBooking && (
            <div className="receipt-to-print hide-scrollbar mx-auto w-full p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[90vh]">
              <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner no-print">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              
              <div className="space-y-1">
                <h1 className="text-3xl font-heading font-bold text-slate-900">Booking Confirmed!</h1>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-primary">
                    {selectedBooking.room?.pension?.name}
                  </p>
                  <p className="text-slate-500 text-lg">
                    Your reservation is confirmed. <span className="font-semibold text-slate-900">Room {selectedBooking.room_number || 'Assigned'}</span>.
                  </p>
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-white to-slate-50 rounded-3xl border border-primary/20 text-left space-y-4 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700 no-print"></div>
                
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Booking Receipt</span>
                  <span className="text-[10px] font-mono text-primary font-bold">#{selectedBooking.payment?.reference || selectedBooking.booking_id}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Pension</span>
                    <span className="text-sm font-semibold text-slate-900">{selectedBooking.room?.pension?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Guest</span>
                    <span className="text-sm font-semibold text-slate-900">{user?.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Room</span>
                    <span className="text-sm font-semibold text-slate-900">Room {selectedBooking.room_number || 'Assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Status</span>
                    <span className="text-xs font-bold uppercase px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Paid</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200">
                    <span className="text-sm font-bold text-slate-900">Total Paid</span>
                    <span className="text-lg font-black text-primary">ETB {parseFloat(selectedBooking.total_price).toLocaleString()}</span>
                  </div>
                </div>

                {selectedBooking.pass_code && (
                  <div className="mt-6 p-4 bg-primary text-primary-foreground rounded-2xl text-center space-y-1 shadow-lg shadow-primary/20">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-80">Digital Access Key</p>
                    <p className="text-3xl font-mono font-black tracking-[0.3em]">{selectedBooking.pass_code}</p>
                  </div>
                )}

                <p className="text-[10px] text-center text-slate-400 mt-4 italic">
                  * Please show this digital slip or the passcode upon arrival for verification at {selectedBooking.room?.pension?.name}.
                </p>
              </div>

              <div className="flex gap-3 no-print pt-2">
                <Button variant="outline" className="flex-1 rounded-xl h-12 gap-2 border-slate-200" onClick={() => window.print()}>
                  <Printer className="w-4 h-4" /> Print Slip
                </Button>
                <Button className="flex-1 rounded-xl h-12 shadow-lg shadow-primary/20" onClick={() => setIsReceiptOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Write/Edit Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-border shadow-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-black text-foreground flex items-center gap-2">
              <Star className="w-5 h-5 text-primary fill-primary/20" />
              {selectedBookingForReview?.review ? 'Edit Review' : 'Write a Review'}
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
    </div>
  );
};

export default CustomerProfile;
