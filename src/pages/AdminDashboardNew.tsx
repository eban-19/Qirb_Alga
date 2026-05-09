import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";

// Import admin components
import { OverviewTab } from "@/components/admin/OverviewTab";
import { OwnersTab } from "@/components/admin/OwnersTab";
import { PropertiesTab } from "@/components/admin/PropertiesTab";
import PensionApprovalInline from "@/components/admin/PensionApprovalInline";
import { AlertsTab } from "@/components/admin/AlertsTab";
import { BookingsTab } from "@/components/admin/BookingsTab";
import { OwnerDetailsModal } from "@/components/admin/OwnerDetailsModal";
import PropertyDetailsModal from "@/components/admin/PropertyDetailsModal";

export default function AdminDashboard() {
  const {
    activeTab,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    selectedOwner,
    showOwnerDetails,
    setShowOwnerDetails,
    owners,
    selectedPropertyId,
    isPropertyModalOpen,
    setIsPropertyModalOpen,
    properties,
    bookings,
    metrics,
    alerts,
    loading,
    handleOwnerAction,
    handleAlertAction,
    handlePropertyAction,
    handleBookingAction
  } = useAdminDashboard();

  // Render content based on active tab
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewTab metrics={metrics} recentOwners={owners.slice(0, 5)} alerts={alerts} />;
      case 'owners':
        return <OwnersTab 
          owners={owners} 
          onOwnerAction={handleOwnerAction}
          searchTerm={searchTerm}
          filterStatus={filterStatus}
          onSearchChange={setSearchTerm}
          onFilterChange={setFilterStatus}
        />;
      case 'properties':
        return <PropertiesTab properties={properties} onPropertyAction={handlePropertyAction} />;
      case 'approvals':
        return <PensionApprovalInline />;
      case 'bookings':
        return <BookingsTab bookings={bookings as any} properties={properties} onBookingAction={handleBookingAction} />;
      case 'alerts':
        return <AlertsTab alerts={alerts} />;
      default:
        return <OverviewTab metrics={metrics} recentOwners={owners.slice(0, 5)} alerts={alerts} />;
    }
  };

  return (
    <AdminDashboardLayout alerts={alerts} onAlertClick={(id) => handleAlertAction(id, 'mark_as_read')}>
      {/* Page Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 capitalize">
              {activeTab === 'overview' ? 'Dashboard Overview' : 
               activeTab === 'owners' ? 'Pension Owners' :
               activeTab === 'properties' ? 'Properties' :
               activeTab === 'approvals' ? 'Pension Approvals' :
               activeTab === 'bookings' ? 'Bookings' :
               activeTab === 'alerts' ? 'System Alerts' : 'Admin Dashboard'}
            </h1>
          </div>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="mt-4">
        {renderContent()}
      </div>
      
      {/* Owner Details Modal */}
      <OwnerDetailsModal
        owner={selectedOwner}
        isOpen={showOwnerDetails}
        onClose={() => setShowOwnerDetails(false)}
        onVerify={(ownerId) => handleOwnerAction(ownerId, "verify", selectedOwner || undefined)}
        onReject={(ownerId) => handleOwnerAction(ownerId, "reject")}
      />
      
      {/* Property Details Modal */}
      <PropertyDetailsModal
        property={properties.find(p => p.id === selectedPropertyId) || null}
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
      />
    </AdminDashboardLayout>
  );
}
