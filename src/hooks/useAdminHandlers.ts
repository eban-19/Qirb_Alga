import apiService from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const useAdminHandlers = (ui: any) => {
  const { logout } = useAuth();

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

      case "suspend":
        try {
          const response = await apiService.suspendOwner(ownerId);
          if (response.success) {
            ui.setOwners((prev: any) => prev.map((o: any) => o.id === ownerId ? { ...o, status: "suspended" as const } : o));
            toast.success("Owner suspended successfully");
            console.log("✅ Owner suspended successfully:", ownerId);
          } else {
            toast.error(response.message || "Failed to suspend owner");
            console.error("❌ Failed to suspend owner:", response.message);
          }
        } catch (error: any) {
          toast.error(error.message || "Error suspending owner");
          console.error("❌ Error suspending owner:", error);
        }
        break;

      case "reactivate":
        try {
          const response = await apiService.reactivateOwner(ownerId);
          if (response.success) {
            ui.setOwners((prev: any) => prev.map((o: any) => o.id === ownerId ? { ...o, status: "verified" as const } : o));
            toast.success("Owner reactivated successfully");
            console.log("✅ Owner reactivated successfully:", ownerId);
          } else {
            toast.error(response.message || "Failed to reactivate owner");
            console.error("❌ Failed to reactivate owner:", response.message);
          }
        } catch (error: any) {
          toast.error(error.message || "Error reactivating owner");
          console.error("❌ Error reactivating owner:", error);
        }
        break;

      default:
        console.log(`Admin action: ${action} for owner ${ownerId}`);
    }
  };

  const handleBulkOwnerAction = async (action: string, ownerIds: string[], onSuccess: () => void) => {
    try {
      const response = await apiService.bulkOwnerAction(action, ownerIds);
      if (response.success) {
        // Update local UI state
        let statusUpdate: any = {};
        switch (action) {
          case 'approve':
          case 'reactivate':
            statusUpdate = { status: "verified" as const };
            break;
          case 'reject':
            statusUpdate = { status: "rejected" as const };
            break;
          case 'suspend':
            statusUpdate = { status: "suspended" as const };
            break;
        }

        if (action === 'delete') {
          ui.setOwners((prev: any) => prev.filter((o: any) => !ownerIds.includes(o.id)));
        } else if (Object.keys(statusUpdate).length > 0) {
          ui.setOwners((prev: any) => prev.map((o: any) => 
            ownerIds.includes(o.id) ? { ...o, ...statusUpdate } : o
          ));
        }

        toast.success(`Successfully executed ${action} on ${ownerIds.length} owners`);
        onSuccess();
      } else {
        toast.error(response.message || `Failed to execute bulk ${action}`);
      }
    } catch (error: any) {
      toast.error(error.message || `Error executing bulk ${action}`);
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
  const handleBookingAction = async (action: string, bookingId: string, booking?: any) => {
    try {
      console.log(`📅 Booking action: ${action} for ${bookingId}`);
      let response;
      
      switch (action) {
        case "approve":
        case "confirm":
          response = await fetch(`http://localhost:3006/api/admin/bookings/${bookingId}/confirm`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }).then(res => res.json());
          if (response.success) {
            ui.setBookings((prev: any) => prev.map((b: any) => b.id === bookingId ? { ...b, status: 'confirmed' } : b));
            toast.success("Booking confirmed successfully");
          }
          break;

        case "cancel":
          response = await fetch(`http://localhost:3006/api/admin/bookings/${bookingId}/cancel`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }).then(res => res.json());
          if (response.success) {
            ui.setBookings((prev: any) => prev.map((b: any) => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
            toast.success("Booking cancelled successfully");
          }
          break;

        case "delete":
          response = await fetch(`http://localhost:3006/api/admin/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }).then(res => res.json());
          if (response.success) {
            ui.setBookings((prev: any) => prev.filter((b: any) => b.id !== bookingId));
            toast.success("Booking deleted successfully");
          }
          break;

        default:
          console.log(`Action ${action} not implemented for bookings`);
      }

      if (response && !response.success) {
        toast.error(response.message || `Failed to ${action} booking`);
      }
    } catch (error: any) {
      toast.error(error.message || `Error executing ${action} on booking`);
    }
  };

  // CRUD Handlers for Alerts
  const handleAlertAction = async (action: string, alertId: string) => {
    try {
      let response;
      switch (action) {
        case "resolve":
          response = await fetch(`http://localhost:3006/api/admin/alerts/${alertId}/resolve`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }).then(res => res.json());
          if (response.success) {
            ui.setAlerts((prev: any) => prev.map((a: any) => a.id === alertId ? { ...a, status: 'resolved' } : a));
            toast.success("Alert resolved");
          }
          break;

        case "investigate":
          response = await fetch(`http://localhost:3006/api/admin/alerts/${alertId}/investigate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }).then(res => res.json());
          if (response.success) {
            ui.setAlerts((prev: any) => prev.map((a: any) => a.id === alertId ? { ...a, status: 'investigating' } : a));
            toast.success("Alert status updated to investigating");
          }
          break;

        case "delete":
          response = await fetch(`http://localhost:3006/api/admin/alerts/${alertId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          }).then(res => res.json());
          if (response.success) {
            ui.setAlerts((prev: any) => prev.filter((a: any) => a.id !== alertId));
            toast.success("Alert deleted");
          }
          break;
      }

      if (response && !response.success) {
        toast.error(response.message || "Failed to update alert");
      }
    } catch (error: any) {
      toast.error("Error updating alert");
    }
  };

  // Subscription Management Handlers
  const handleExtendSubscription = async (subscriptionId: number, durationDays: number) => {
    try {
      const response = await fetch(`http://localhost:3006/api/admin-payments/subscriptions/${subscriptionId}/extend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ durationDays }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(`Subscription extended by ${durationDays} days`);
        ui.fetchPaymentData();
      } else {
        toast.error(result.message || "Failed to extend subscription");
      }
    } catch (error: any) {
      toast.error(error.message || "Error extending subscription");
    }
  };

  const handleTerminateFreeAccess = async (subscriptionId: number) => {
    try {
      const response = await fetch(`http://localhost:3006/api/admin-payments/subscriptions/${subscriptionId}/terminate-free`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Free access terminated successfully");
        ui.fetchPaymentData();
      } else {
        toast.error(result.message || "Failed to terminate free access");
      }
    } catch (error: any) {
      toast.error(error.message || "Error terminating free access");
    }
  };

  const handleToggleSubscriptionStatus = async (subscriptionId: number, status: "ACTIVE" | "CANCELLED") => {
    try {
      const response = await fetch(`http://localhost:3006/api/admin-payments/subscriptions/${subscriptionId}/toggle-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(`Subscription ${status.toLowerCase()} successfully`);
        ui.fetchPaymentData();
      } else {
        toast.error(result.message || "Failed to update subscription status");
      }
    } catch (error: any) {
      toast.error(error.message || "Error updating subscription status");
    }
  };

  const handleTerminateSubscription = async (subscriptionId: number) => {
    try {
      const response = await fetch(`http://localhost:3006/api/admin-payments/subscriptions/${subscriptionId}/terminate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Subscription terminated successfully");
        ui.fetchPaymentData();
      } else {
        toast.error(result.message || "Failed to terminate subscription");
      }
    } catch (error: any) {
      toast.error(error.message || "Error terminating subscription");
    }
  };

  return {
    handleOwnerAction,
    handlePropertyAction,
    handleBookingAction,
    handleExtendSubscription,
    handleTerminateFreeAccess,
    handleToggleSubscriptionStatus,
    handleTerminateSubscription,
    handleBulkOwnerAction,
    handleAlertAction,
    handleLogout: logout
  };
};
