import apiService from "@/services/api";
import { toast } from "sonner";

export const useAdminHandlers = (ui: any) => {

  // CRUD Handlers for Owners
  const handleOwnerAction = async (action: string, ownerId: string, owner?: any) => {
    switch (action) {
      case "create":
        const newOwner = { ...owner, id: `OWN${Date.now()}`, registrationDate: new Date().toISOString().split('T')[0] };
        ui.setOwners((prev: any) => [...prev, newOwner]);
        console.log("Created owner:", newOwner);
        break;

      case "update":
        ui.setOwners((prev: any) => prev.map((o: any) => o.id === ownerId ? { ...owner, id: ownerId } : o));
        console.log("Updated owner:", ownerId);
        break;

      case "delete":
        try {
          const response = await apiService.deleteOwner(ownerId);
          if (response.success) {
            ui.setOwners((prev: any) => prev.filter((o: any) => o.id !== ownerId));
            toast.success("Owner deleted successfully");
            console.log("✅ Owner deleted successfully:", ownerId);
          } else {
            toast.error(response.message || "Failed to delete owner");
            console.error("❌ Failed to delete owner:", response.message);
          }
        } catch (error: any) {
          toast.error(error.message || "Error deleting owner");
          console.error("❌ Error deleting owner:", error);
        }
        break;

      case "view":
        // Show owner business details in modal with fresh data
        try {
          console.log("👁️ Fetching detailed owner information for:", ownerId);
          const response = await apiService.getOwnerDetails(ownerId);
          
          if (response.success && response.data) {
            console.log("✅ Owner details fetched:", response.data);
            ui.setSelectedOwner(response.data);
            ui.setShowOwnerDetails(true);
          } else {
            console.error("❌ Failed to fetch owner details:", response.message);
            // Fallback to existing data
            const fallbackOwner = ui.owners.find((o: any) => o.id === ownerId);
            if (fallbackOwner) {
              ui.setSelectedOwner(fallbackOwner);
              ui.setShowOwnerDetails(true);
            }
          }
        } catch (error) {
          console.error("❌ Error fetching owner details:", error);
          // Fallback to existing data
          const fallbackOwner = ui.owners.find((o: any) => o.id === ownerId);
          if (fallbackOwner) {
            ui.setSelectedOwner(fallbackOwner);
            ui.setShowOwnerDetails(true);
          }
        }
        break;

      case "verify":
      case "approve":
        // Call API to approve owner
        try {
          const response = await apiService.approveOwner(ownerId);
          if (response.success) {
            ui.setOwners((prev: any) => prev.map((o: any) => o.id === ownerId ? { ...o, status: "verified" as const, documentStatus: "approved" as const } : o));
            toast.success("Owner approved successfully");
            console.log("✅ Owner approved successfully:", ownerId);
          } else {
            toast.error(response.message || "Failed to approve owner");
            console.error("❌ Failed to approve owner:", response.message);
          }
        } catch (error: any) {
          toast.error(error.message || "Error approving owner");
          console.error("❌ Error approving owner:", error);
        }
        break;

      case "reject":
        // Call API to reject owner
        try {
          const response = await apiService.rejectOwner(ownerId);
          if (response.success) {
            ui.setOwners((prev: any) => prev.map((o: any) => o.id === ownerId ? { ...o, status: "rejected" as const, documentStatus: "rejected" as const } : o));
            toast.success("Owner rejected successfully");
            console.log("✅ Owner rejected successfully:", ownerId);
          } else {
            toast.error(response.message || "Failed to reject owner");
            console.error("❌ Failed to reject owner:", response.message);
          }
        } catch (error: any) {
          toast.error(error.message || "Error rejecting owner");
          console.error("❌ Error rejecting owner:", error);
        }
        break;

      default:
        console.log(`Admin action: ${action} for owner ${ownerId}`);
    }
  };

  // CRUD Handlers for Properties
  const handlePropertyAction = (action: string, propertyId: string, property?: any) => {
    switch (action) {
      case "create":
        const newProperty = { ...property, id: `PROP${Date.now()}` };
        ui.setProperties((prev: any) => [...prev, newProperty]);
        console.log("Created property:", newProperty);
        break;

      case "update":
        ui.setProperties((prev: any) => prev.map((p: any) => p.id === propertyId ? { ...property, id: propertyId } : p));
        console.log("Updated property:", propertyId);
        break;

      case "delete":
        ui.setProperties((prev: any) => prev.filter((p: any) => p.id !== propertyId));
        console.log("Deleted property:", propertyId);
        break;

      default:
        console.log(`Admin action: ${action} for property ${propertyId}`);
    }
  };

  // CRUD Handlers for Bookings
  const handleBookingAction = (action: string, bookingId: string, booking?: any) => {
    switch (action) {
      case "create":
        const newBooking = { ...booking, id: `BK${Date.now()}`, createdAt: new Date().toISOString() };
        ui.setBookings((prev: any) => [...prev, newBooking]);
        console.log("Created booking:", newBooking);
        break;

      case "update":
        ui.setBookings((prev: any) => prev.map((b: any) => b.id === bookingId ? { ...booking, id: bookingId } : b));
        console.log("Updated booking:", bookingId);
        break;

      case "delete":
        ui.setBookings((prev: any) => prev.filter((b: any) => b.id !== bookingId));
        console.log("Deleted booking:", bookingId);
        break;

      default:
        console.log(`Admin action: ${action} for booking ${bookingId}`);
    }
  };

  return {
    handleOwnerAction,
    handlePropertyAction,
    handleBookingAction
  };
};
