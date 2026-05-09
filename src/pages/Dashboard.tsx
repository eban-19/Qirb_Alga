import React from 'react';
import { useLanguage } from '../hooks/use-language';
import { useNavigate } from 'react-router-dom';

// Hooks
import { useDashboard } from '../hooks/useDashboard';
import { useDashboardData } from '../hooks/useDashboardData';
import { useDashboardHandlers } from '../hooks/useDashboardHandlers';
import { useAuth } from '../contexts/AuthContext';

// Components
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { OverviewSection } from '../components/dashboard/OverviewSection';
import { ReportsSection } from '../components/dashboard/ReportsSection';
import { SettingsSection } from '../components/dashboard/SettingsSection';
import { PensionProfileSection } from '../components/dashboard/PensionProfileSection';
import { StaffSection } from '../components/dashboard/StaffSection';
import { BookingSection } from '../components/dashboard/BookingSection';
import { RoomsSection } from '../components/dashboard/RoomsSection';
import { GuestsSection } from '../components/dashboard/GuestsSection';
import { TransactionsSection } from '../components/dashboard/TransactionsSection';

// Modals
import { CreatePensionModal } from '../components/dashboard/CreatePensionModal';
import { AddRoomModal } from '../components/dashboard/AddRoomModal';
import { AddPackageModal } from '../components/dashboard/AddPackageModal';
import { AddStaffModal } from '../components/dashboard/AddStaffModal';
import { WalkInBookingModal } from '../components/dashboard/WalkInBookingModal';
import { BulkUploadModal } from '../components/dashboard/BulkUploadModal';

// UI & Data
import { Button } from '../components/ui/button';
import { Calendar, Upload, Bed, Building, Download, BarChart3, Save, Plus } from 'lucide-react';
import { sidebarLinks, getIcon } from '../data/dashboard';

const Dashboard: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { isPensionOwner, user } = useAuth();

  // Initialize Hooks
  const ui = useDashboard();
  const data = useDashboardData(ui);
  const handlers = useDashboardHandlers(data, ui, data.loadRealData);

  // Derived State
  const expensesByCategory = data.expensesData.reduce((acc: Record<string, number>, exp: { category: string, amount: string | number }) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {} as Record<string, number>);

  if (data.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Initializing Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <DashboardSidebar
        mobileSidebarOpen={ui.mobileSidebarOpen}
        setMobileSidebarOpen={ui.setMobileSidebarOpen}
        activeTab={ui.activeTab}
        setActiveTab={ui.setActiveTab}
        settingsExpanded={ui.settingsExpanded}
        setSettingsExpanded={ui.setSettingsExpanded}
        pensions={data.pensions}
        user={user}
        selectedPensionId={data.selectedPensionId}
        handlePensionSelectionChange={handlers.handlePensionSelectionChange}
        handleLogout={ui.handleLogout}
        navigate={navigate}
        sidebarLinks={sidebarLinks}
        getIcon={getIcon}
        t={t}
        isPensionOwner={isPensionOwner}
      />

      <main className="flex-1 min-h-screen">
        <DashboardHeader
          isSearchOpenMobile={ui.isSearchOpenMobile}
          setIsSearchOpenMobile={ui.setIsSearchOpenMobile}
          mobileSidebarOpen={ui.mobileSidebarOpen}
          setMobileSidebarOpen={ui.setMobileSidebarOpen}
          searchQuery={ui.searchQuery}
          setSearchQuery={ui.setSearchQuery}
          activeTab={ui.activeTab}
          user={user}
          language={language}
        />

        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
          {/* Section Headers */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              {ui.activeTab === "overview" ? (
                <h2 className="text-3xl font-black text-slate-900">
                  Dashboard Overview
                </h2>
              ) : (
                <h2 className="text-3xl font-bold text-slate-900">
                  {ui.activeTab === "staff" ? "Staff & HR Management" : 
                   ui.activeTab === "bookings" ? "Bookings Management" :
                   ui.activeTab === "rooms" ? "Rooms Management" :
                   ui.activeTab === "pension-profile" ? "Pension Profile" :
                   ui.activeTab === "reports" ? "Reports & Analytics" :
                   ui.activeTab.startsWith("settings-") ? "Settings" :
                   "Dashboard Section"}
                </h2>
              )}
            </div>
            <div className="flex gap-2">
              {ui.activeTab === "bookings" && (
                <Button className="gap-2" onClick={() => ui.setShowWalkInModal(true)}>
                  <Calendar className="h-4 w-4" /> New Booking
                </Button>
              )}
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {ui.activeTab === "overview" && (
              <OverviewSection
                stats={{
                  staffCount: data.staffData.length,
                  availableRooms: data.actualRoomStats.availableRooms,
                  activeBookings: data.bookings.length,
                  totalRevenue: data.totalRevenue
                }}
                propertySettings={ui.propertySettings}
                recentTransactions={data.recentTransactions}
                guestsCount={data.guestsData.length}
                onCreatePension={() => ui.setShowCreatePension(true)}
              />
            )}

            {ui.activeTab === "staff" && (
              <StaffSection
                staff={data.staffData}
                viewMode={ui.viewModes.staff}
                onToggleView={() => ui.toggleViewMode('staff')}
                onEditStaff={handlers.handleEditStaff}
                onDeleteStaff={handlers.handleDeleteStaff}
                onAddNewStaff={() => { ui.setEditingStaff(null); ui.setNewStaff({ full_name: '', role: '', phone: '', salary: '', pension_id: '', owner_id: '', department: '', email: '', status: 'active' }); ui.setShowAddStaffModal(true); }}
                onBulkUpload={() => ui.setShowStaffBulkUploadModal(true)}
                downloadTemplate={() => {}}
              />
            )}

            {ui.activeTab === "bookings" && (
              <BookingSection
                bookings={data.bookings}
                viewMode={ui.viewModes.bookings}
                onToggleView={() => ui.toggleViewMode('bookings')}
                onUpdateStatus={handlers.handleUpdateBookingStatus}
                onCompleteEarly={handlers.handleCompleteEarly}
              />
            )}

            {ui.activeTab === "rooms" && (
              <RoomsSection
                rooms={data.roomsData}
                viewMode={ui.viewModes.rooms}
                onToggleView={() => ui.toggleViewMode('rooms')}
                onDeleteRoom={handlers.handleDeleteRoom}
                onAddNewRoom={() => ui.setShowAddRoomModal(true)}
                onBulkUpload={() => ui.setShowRoomsBulkUploadModal(true)}
              />
            )}

            {ui.activeTab === "guests" && (
              <GuestsSection
                guests={data.guestsData}
                viewMode={ui.viewModes.guests || 'card'}
                onToggleView={() => ui.toggleViewMode('guests')}
              />
            )}

            {ui.activeTab === "transactions" && (
              <TransactionsSection
                transactions={data.recentTransactions}
              />
            )}

            {ui.activeTab === "pension-profile" && (
              <PensionProfileSection
                propertySettings={ui.propertySettings}
                setPropertySettings={ui.setPropertySettings}
                packages={data.packages}
                onToggleMostPopular={handlers.handleToggleMostPopular}
                onEditPackage={(pkg) => { ui.setEditingPackage(pkg); ui.setNewPackage({...pkg} as unknown as typeof ui.newPackage); ui.setShowAddPackageModal(true); }}
                onDeletePackage={handlers.handleDeletePackage}
                onAddNewPackage={() => { ui.setEditingPackage(null); ui.setShowAddPackageModal(true); }}
                onSaveProfile={handlers.handleSavePropertySettings}
                isUpdating={ui.isUpdating}
                showSaveSuccess={ui.showSaveSuccess}
                pensionProfileImageFile={null}
                setPensionProfileImageFile={() => {}}
                calculateAvailableRooms={(id) => data.roomsData.filter(r => String(r.package_id) === String(id) && r.status === 'Available').length}
              />
            )}

            {ui.activeTab === "reports" && (
              <ReportsSection
                totalRevenue={data.totalRevenue}
                totalExpenses={data.totalExpenses}
                bookings={data.bookings}
                expensesData={data.expensesData}
                expensesByCategory={expensesByCategory}
                onAddExpense={async (e) => { e.preventDefault(); /* Implement add expense */ }}
                occupancyMetrics={{
                  currentOccupancy: 0,
                  totalRooms: data.roomsData.length,
                  availableRooms: data.actualRoomStats.availableRooms
                }}
                bookingTrends={{ avgStayDuration: 0, cancellationRate: 0 }}
              />
            )}

            {ui.activeTab.startsWith("settings-") && (
              <SettingsSection
                activeTab={ui.activeTab}
                businessProfile={ui.businessProfile}
                setBusinessProfile={ui.setBusinessProfile}
                securitySettings={ui.securitySettings}
                setSecuritySettings={ui.setSecuritySettings}
                approvalStatus="Approved"
                isUpdating={ui.isUpdating}
                onSaveBusinessProfile={() => {}}
                onSaveSecuritySettings={() => {}}
                onToggleTwoFactor={() => {}}
                showSaveSuccess={ui.showSaveSuccess}
              />
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreatePensionModal
        isOpen={ui.showCreatePension}
        onClose={() => ui.setShowCreatePension(false)}
        newPension={ui.newPension}
        setNewPension={ui.setNewPension}
        onCreatePension={handlers.handleCreatePension}
        language={language}
        pensionImageFile={null}
        setPensionImageFile={() => {}}
      />

      <AddRoomModal
        isOpen={ui.showAddRoomModal}
        onClose={() => ui.setShowAddRoomModal(false)}
        newRoom={ui.newRoom}
        setNewRoom={ui.setNewRoom}
        packages={data.packages}
        onAddRoom={handlers.handleAddRoom}
      />

      <AddPackageModal
        isOpen={ui.showAddPackageModal}
        onClose={() => ui.setShowAddPackageModal(false)}
        newPackage={ui.newPackage}
        setNewPackage={ui.setNewPackage}
        editingPackage={ui.editingPackage}
        onAddPackage={handlers.handleAddPackage}
        language={language}
        handlePackageImageUpload={() => {}}
      />

      <AddStaffModal
        isOpen={ui.showAddStaffModal}
        onClose={() => ui.setShowAddStaffModal(false)}
        newStaff={ui.newStaff}
        setNewStaff={ui.setNewStaff}
        editingStaff={ui.editingStaff}
        onSaveStaff={handlers.handleSaveStaff}
      />

      <WalkInBookingModal
        isOpen={ui.showWalkInModal}
        onClose={() => ui.setShowWalkInModal(false)}
        walkInForm={ui.walkInForm}
        setWalkInForm={ui.setWalkInForm}
        walkInPackages={data.packages}
        onWalkInSubmit={handlers.handleWalkInSubmit}
      />

      {/* Rooms Bulk Upload */}
      <BulkUploadModal
        isOpen={ui.showRoomsBulkUploadModal}
        onClose={() => ui.setShowRoomsBulkUploadModal(false)}
        title="Bulk Upload Rooms"
        description="Upload multiple rooms at once using a CSV file."
        uploadData={ui.roomsBulkUpload}
        onFileUpload={handlers.handleRoomFileUpload}
        onConfirm={handlers.handleConfirmRoomBulkUpload}
        onDownloadTemplate={handlers.handleDownloadRoomTemplate}
        columns={[
          { key: 'room_number', label: 'Room Number' },
          { key: 'room_type', label: 'Room Type' },
          { key: 'package_name', label: 'Package Name' },
          { key: 'capacity', label: 'Capacity' },
          { key: 'number_of_beds', label: 'Beds' },
          { key: 'price', label: 'Price' },
          { key: 'status', label: 'Status' }
        ]}
      />

      {/* Staff Bulk Upload */}
      <BulkUploadModal
        isOpen={ui.showStaffBulkUploadModal}
        onClose={() => ui.setShowStaffBulkUploadModal(false)}
        title="Bulk Upload Staff"
        description="Upload multiple staff members at once using a CSV file."
        uploadData={ui.staffBulkUpload}
        onFileUpload={handlers.handleStaffFileUpload}
        onConfirm={handlers.handleConfirmStaffBulkUpload}
        onDownloadTemplate={handlers.handleDownloadStaffTemplate}
        columns={[
          { key: 'full_name', label: 'Full Name' },
          { key: 'role', label: 'Role' },
          { key: 'department', label: 'Department' },
          { key: 'phone', label: 'Phone' },
          { key: 'email', label: 'Email' },
          { key: 'salary', label: 'Salary' },
          { key: 'status', label: 'Status' }
        ]}
      />
    </div>
  );
};

export default Dashboard;
