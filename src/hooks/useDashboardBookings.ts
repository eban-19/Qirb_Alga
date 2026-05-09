import { useState } from "react";
import { AdminBooking } from "@/types/admin";

export const useDashboardBookings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Multi-step booking form state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    // Step 1: Guest Information
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    guestAddress: "",
    
    // Step 2: Property & Dates
    propertyName: "",
    checkIn: "",
    checkOut: "",
    roomType: "",
    
    // Step 3: Payment & Additional Info
    totalPrice: 0,
    specialRequests: "",
    paymentMethod: "",
    
    // Summary
    status: "pending" as const,
    paymentStatus: "pending" as const
  });

  // Mock booking data
  const bookings: AdminBooking[] = [
    {
      id: "BK001",
      propertyName: "Sunshine Pension",
      guestName: "Abebe Kebede",
      guestEmail: "abebe@email.com",
      guestPhone: "+251 911 234 567",
      checkIn: "2024-03-25",
      checkOut: "2024-03-28",
      totalPrice: 10500,
      status: "confirmed",
      paymentStatus: "paid",
      ownerName: "Sunshine Hospitality",
      createdAt: "2024-03-20"
    },
    {
      id: "BK002",
      propertyName: "Abyssinia Guest House",
      guestName: "Tigist Haile",
      guestEmail: "tigist@email.com",
      guestPhone: "+251 922 345 678",
      checkIn: "2024-03-26",
      checkOut: "2024-03-30",
      totalPrice: 14000,
      status: "pending",
      paymentStatus: "pending",
      ownerName: "Abyssinia Family",
      createdAt: "2024-03-21"
    }
  ];

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.guestEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewBooking = (bookingId: string) => {
    console.log('View booking:', bookingId);
  };

  const handleEditBooking = (bookingId: string) => {
    console.log('Edit booking:', bookingId);
  };

  const handleDeleteBooking = (bookingId: string) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      console.log('Delete booking:', bookingId);
    }
  };

  const handleStatusChange = (booking: AdminBooking, newStatus: string) => {
    console.log('Change status:', booking.id, 'to', newStatus);
  };

  const handleCreateBooking = () => {
    setShowBookingModal(true);
    setCurrentStep(1);
    setBookingData({
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      guestAddress: "",
      propertyName: "",
      checkIn: "",
      checkOut: "",
      roomType: "",
      totalPrice: 0,
      specialRequests: "",
      paymentMethod: "",
      status: "pending",
      paymentStatus: "pending"
    });
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBookingSubmit = () => {
    console.log('Creating booking:', bookingData);
    // Here you would normally call your API to create the booking
    setShowBookingModal(false);
    // Show success message
    alert('Booking created successfully!');
  };

  const updateBookingData = (field: string, value: any) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return bookingData.guestName && bookingData.guestEmail && bookingData.guestPhone;
      case 2:
        return bookingData.propertyName && bookingData.checkIn && bookingData.checkOut;
      case 3:
        return bookingData.paymentMethod;
      case 4:
        return true; // Summary step is always valid
      default:
        return false;
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    showBookingModal,
    setShowBookingModal,
    currentStep,
    bookingData,
    filteredBookings,
    handleViewBooking,
    handleEditBooking,
    handleDeleteBooking,
    handleStatusChange,
    handleCreateBooking,
    handleNextStep,
    handlePrevStep,
    handleBookingSubmit,
    updateBookingData,
    isStepValid
  };
};
