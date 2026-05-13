import React, { useState } from 'react';
import { useLanguage } from '../hooks/use-language';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/use-subscription';

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
import { PackageTierSection } from '../components/dashboard/PackageTierSection';
import { BookingSection } from '../components/dashboard/BookingSection';
import { RoomsSection } from '../components/dashboard/RoomsSection';
import { GuestsSection } from '../components/dashboard/GuestsSection';
import { TransactionsSection } from '../components/dashboard/TransactionsSection';
import SubscriptionPlans from '../components/dashboard/SubscriptionPlans';

// Modals
import { CreatePensionModal } from '../components/dashboard/CreatePensionModal';
import { AddRoomModal } from '../components/dashboard/AddRoomModal';
import { AddPackageModal } from '../components/dashboard/AddPackageModal';
import { AddStaffModal } from '../components/dashboard/AddStaffModal';
import { WalkInBookingModal } from '../components/dashboard/WalkInBookingModal';
import { BulkUploadModal } from '../components/dashboard/BulkUploadModal';

// UI & Data
import { Button } from '../components/ui/button';
import { 
  Calendar, 
  AlertCircle, 
  Zap, 
  Bed, 
  Building, 
  Download, 
  BarChart3, 
  Save, 
  Plus,
  ChevronDown,
  UserPlus,
  FileUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { sidebarLinks, getIcon } from '../data/dashboard';

const Dashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const { status, isLoading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const { isPensionOwner, user } = useAuth();

  // Initialize Hooks
  const ui = useDashboard();
  const data = useDashboardData(ui);

  React.useEffect(() => {
    if (status?.isRestricted && ui.activeTab !== "subscription") {
      ui.setActiveTab("subscription");
    }
  }, [status, ui.activeTab]);
  const handlers = useDashboardHandlers(data, ui, data.loadRealData);

  // Derived State
  const expensesByCategory = data.expensesData.reduce((acc: Record<string, number>, exp: { category: string, amount: string | number }) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {} as Record<string, number>);

  if (data.loading || subLoading) {
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
    <div className="flex h-screen bg-slate-50/50 overflow-hidden">
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

      <main className="flex-1 h-full overflow-y-auto min-w-0 lg:pl-64">
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
          onLogout={ui.handleLogout}
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
                   ui.activeTab === "packages" ? "Package Tiers" :
                   ui.activeTab === "reports" ? "Reports & Analytics" :
                   ui.activeTab.startsWith("settings-") ? "Settings" :
                   ui.activeTab === "subscription" ? "Subscription Plans" :
                   "Dashboard Section"}
                </h2>
              )}
            </div>
            <div className="flex gap-2">
              {ui.activeTab === "bookings" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all">
                      <Plus className="h-4 w-4" /> 
                      <span className="hidden sm:inline">New Booking</span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                    <DropdownMenuItem 
                      onClick={() => ui.setShowWalkInModal(true)}
                      className="flex items-center gap-3 p-3 cursor-pointer rounded-lg focus:bg-blue-50 focus:text-blue-600 transition-colors"
                    >
                      <UserPlus className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-bold">Walk-in Booking</span>
                        <span className="text-[10px] text-slate-500">Add guest manually</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {}}
                      className="flex items-center gap-3 p-3 cursor-pointer rounded-lg focus:bg-slate-50 opacity-50 cursor-not-allowed"
                    >
                      <FileUp className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="font-bold">Bulk Upload</span>
                        <span className="text-[10px] text-slate-500">Coming soon</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {status?.isRestricted && (
              <div className="mb-6 p-6 bg-red-50 border border-red-100 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-red-900">Subscription Expired</h4>
                    <p className="text-sm text-red-700 opacity-80">Access to dashboard features is currently restricted.</p>
                  </div>
                </div>
                <Button variant="destructive" className="rounded-xl px-8 h-12 font-bold" onClick={() => ui.setActiveTab("subscription")}>
                  Renew Now
                </Button>
              </div>
            )}

            {status?.trial.isActive && !status.isRestricted && (
              <div className="mb-6 p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium text-foreground">
                    <span className="font-bold">Free Trial:</span> You have <span className="text-primary font-bold">{status.trial.daysLeft} days</span> left on your trial.
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/10" onClick={() => ui.setActiveTab("subscription")}>
                  Upgrade Now
                </Button>
              </div>
            )}

            {ui.activeTab === "overview" && !status?.isRestricted && (
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

            {ui.activeTab === "staff" && !status?.isRestricted && (
              <StaffSection
                staff={data.staffData.slice(
                  (ui.pagination.staff.page - 1) * ui.pagination.staff.limit,
                  ui.pagination.staff.page * ui.pagination.staff.limit
                )}
                viewMode={ui.viewModes.staff}
                onToggleView={() => ui.toggleViewMode('staff')}
                onEditStaff={handlers.handleEditStaff}
                onDeleteStaff={handlers.handleDeleteStaff}
                onAddNewStaff={() => { ui.setEditingStaff(null); ui.setNewStaff({ full_name: '', role: '', phone: '', salary: '', pension_id: '', owner_id: '', department: '', email: '', status: 'active' }); ui.setShowAddStaffModal(true); }}
                onBulkUpload={() => ui.setShowStaffBulkUploadModal(true)}
                downloadTemplate={() => {}}
                pagination={ui.pagination.staff}
                onPageChange={(page) => ui.setPagination({ ...ui.pagination, staff: { ...ui.pagination.staff, page } })}
                onLimitChange={(limit) => ui.setPagination({ ...ui.pagination, staff: { ...ui.pagination.staff, limit, page: 1 } })}
                selectedRows={ui.selectedRows.staff}
                onToggleSelection={(id) => ui.toggleSelection('staff', id)}
                onSelectAll={(ids) => ui.setSelectedRows({ ...ui.selectedRows, staff: ids })}
                totalItems={data.dataTotals.staff}
                language={ui.language}
              />
            )}

            {ui.activeTab === "bookings" && !status?.isRestricted && (
              <BookingSection
                bookings={data.bookings.slice(
                  (ui.pagination.bookings.page - 1) * ui.pagination.bookings.limit,
                  ui.pagination.bookings.page * ui.pagination.bookings.limit
                )}
                viewMode={ui.viewModes.bookings}
                onToggleView={() => ui.toggleViewMode('bookings')}
                onUpdateStatus={handlers.handleUpdateBookingStatus}
                onCompleteEarly={handlers.handleCompleteEarly}
                pagination={ui.pagination.bookings}
                onPageChange={(page) => ui.setPagination({ ...ui.pagination, bookings: { ...ui.pagination.bookings, page } })}
                onLimitChange={(limit) => ui.setPagination({ ...ui.pagination, bookings: { ...ui.pagination.bookings, limit, page: 1 } })}
                selectedRows={ui.selectedRows.bookings}
                onToggleSelection={(id) => ui.toggleSelection('bookings', id)}
                onSelectAll={(ids) => ui.setSelectedRows({ ...ui.selectedRows, bookings: ids })}
                totalItems={data.dataTotals.bookings}
                language={ui.language}
              />
            )}

            {ui.activeTab === "rooms" && !status?.isRestricted && (
              <RoomsSection
                rooms={data.roomsData.slice(
                  (ui.pagination.rooms.page - 1) * ui.pagination.rooms.limit,
                  ui.pagination.rooms.page * ui.pagination.rooms.limit
                )}
                viewMode={ui.viewModes.rooms}
                onToggleView={() => ui.toggleViewMode('rooms')}
                onDeleteRoom={handlers.handleDeleteRoom}
                onAddNewRoom={() => ui.setShowAddRoomModal(true)}
                onBulkUpload={() => ui.setShowRoomsBulkUploadModal(true)}
                pagination={ui.pagination.rooms}
                onPageChange={(page) => ui.setPagination({ ...ui.pagination, rooms: { ...ui.pagination.rooms, page } })}
                onLimitChange={(limit) => ui.setPagination({ ...ui.pagination, rooms: { ...ui.pagination.rooms, limit, page: 1 } })}
                selectedRows={ui.selectedRows.rooms}
                onToggleSelection={(id) => ui.toggleSelection('rooms', id)}
                onSelectAll={(ids) => ui.setSelectedRows({ ...ui.selectedRows, rooms: ids })}
                onUpdateStatus={handlers.handleUpdateRoomStatus}
                totalItems={data.dataTotals.rooms}
                language={ui.language}
              />
            )}

            {ui.activeTab === "guests" && !status?.isRestricted && (
              <GuestsSection
                guests={data.guestsData.slice(
                  (ui.pagination.guests.page - 1) * ui.pagination.guests.limit,
                  ui.pagination.guests.page * ui.pagination.guests.limit
                )}
                viewMode={ui.viewModes.guests}
                onToggleView={() => ui.toggleViewMode('guests')}
                pagination={ui.pagination.guests}
                onPageChange={(page) => ui.setPagination({ ...ui.pagination, guests: { ...ui.pagination.guests, page } })}
                onLimitChange={(limit) => ui.setPagination({ ...ui.pagination, guests: { ...ui.pagination.guests, limit, page: 1 } })}
                selectedRows={ui.selectedRows.guests}
                onToggleSelection={(id) => ui.toggleSelection('guests', id)}
                onSelectAll={(ids) => ui.setSelectedRows({ ...ui.selectedRows, guests: ids })}
                totalItems={data.dataTotals.guests}
                language={ui.language}
              />
            )}

            {ui.activeTab === "transactions" && !status?.isRestricted && (
              <TransactionsSection
                transactions={data.recentTransactions.slice(
                  (ui.pagination.transactions.page - 1) * ui.pagination.transactions.limit,
                  ui.pagination.transactions.page * ui.pagination.transactions.limit
                )}
                pagination={ui.pagination.transactions}
                onPageChange={(page) => ui.setPagination({ ...ui.pagination, transactions: { ...ui.pagination.transactions, page } })}
                onLimitChange={(limit) => ui.setPagination({ ...ui.pagination, transactions: { ...ui.pagination.transactions, limit, page: 1 } })}
                selectedRows={ui.selectedRows.transactions}
                onToggleSelection={(id) => ui.toggleSelection('transactions', id)}
                onSelectAll={(ids) => ui.setSelectedRows({ ...ui.selectedRows, transactions: ids })}
                totalItems={data.dataTotals.transactions}
                language={ui.language}
              />
            )}

            {ui.activeTab === "pension-profile" && !status?.isRestricted && (
              <PensionProfileSection
                propertySettings={ui.propertySettings}
                setPropertySettings={ui.setPropertySettings}
                onSaveProfile={handlers.handleSavePropertySettings}
                isUpdating={ui.isUpdating}
                showSaveSuccess={ui.showSaveSuccess}
                pensionProfileImageFile={ui.pensionProfileImageFile}
                setPensionProfileImageFile={ui.setPensionProfileImageFile}
              />
            )}

            {ui.activeTab === "packages" && !status?.isRestricted && (
              <PackageTierSection
                packages={data.packages.slice(
                  (ui.pagination.packages.page - 1) * ui.pagination.packages.limit,
                  ui.pagination.packages.page * ui.pagination.packages.limit
                )}
                rooms={data.roomsData}
                onToggleMostPopular={handlers.handleToggleMostPopular}
                onEditPackage={(pkg) => { ui.setEditingPackage(pkg); ui.setNewPackage({...pkg} as unknown as typeof ui.newPackage); ui.setShowAddPackageModal(true); }}
                onDeletePackage={handlers.handleDeletePackage}
                onAddNewPackage={() => { 
                  ui.setEditingPackage(null); 
                  ui.setNewPackage({
                    name: '', name_en: '', name_am: '', name_om: '', price: '',
                    description: '', description_en: '', description_am: '', description_om: '',
                    services: ['WiFi', 'Clean Room', 'Basic Amenities'],
                    isMostPopular: false, image: '', customService: '', imageType: 'Normal'
                  });
                  ui.setShowAddPackageModal(true); 
                }}
                pagination={ui.pagination.packages}
                onPageChange={(page) => ui.setPagination({ ...ui.pagination, packages: { ...ui.pagination.packages, page } })}
                onLimitChange={(limit) => ui.setPagination({ ...ui.pagination, packages: { ...ui.pagination.packages, limit, page: 1 } })}
                selectedRows={ui.selectedRows.packages}
                onToggleSelection={(id) => ui.toggleSelection('packages', id)}
                onSelectAll={(ids) => ui.setSelectedRows({ ...ui.selectedRows, packages: ids })}
                totalItems={data.dataTotals?.packages || data.packages.length}
                language={ui.language}
              />
            )}

            {ui.activeTab === "reports" && !status?.isRestricted && (
              <ReportsSection
                totalRevenue={data.totalRevenue}
                totalExpenses={data.totalExpenses}
                bookings={data.bookings}
                expensesData={data.expensesData}
                expensesByCategory={expensesByCategory}
                onAddExpense={handlers.handleAddExpense}
                occupancyMetrics={{
                  currentOccupancy: data.roomsData.length > 0 
                    ? Math.round(((data.roomsData.length - data.actualRoomStats.availableRooms) / data.roomsData.length) * 100) 
                    : 0,
                  totalRooms: data.roomsData.length,
                  availableRooms: data.actualRoomStats.availableRooms
                }}
                bookingTrends={{ avgStayDuration: 0, cancellationRate: 0 }}
              />
            )}

            {ui.activeTab === "subscription" && <SubscriptionPlans />}

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
                onSaveSecuritySettings={handlers.handleSaveSecuritySettings}
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
        pensionImageFile={ui.pensionImageFile}
        setPensionImageFile={ui.setPensionImageFile}
      />

      <AddRoomModal
        isOpen={ui.showAddRoomModal}
        onClose={() => { ui.setShowAddRoomModal(false); ui.setErrorMessage(''); }}
        newRoom={ui.newRoom}
        setNewRoom={ui.setNewRoom}
        packages={data.packages}
        onAddRoom={handlers.handleAddRoom}
        existingRooms={data.roomsData}
        errorMessage={ui.errorMessage}
      />

      <AddPackageModal
        isOpen={ui.showAddPackageModal}
        onClose={() => ui.setShowAddPackageModal(false)}
        newPackage={ui.newPackage}
        setNewPackage={ui.setNewPackage}
        editingPackage={ui.editingPackage}
        onAddPackage={handlers.handleAddPackage}
        language={language}
        handlePackageImageUpload={handlers.handlePackageImageUpload}
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
        onClose={() => { ui.setShowRoomsBulkUploadModal(false); ui.setErrorMessage(''); }}
        title="Bulk Upload Rooms"
        description="Upload multiple rooms at once using a CSV file."
        uploadData={ui.roomsBulkUpload}
        onFileUpload={handlers.handleRoomFileUpload}
        onConfirm={handlers.handleConfirmRoomBulkUpload}
        onDownloadTemplate={handlers.handleDownloadRoomTemplate}
        errorMessage={ui.errorMessage}
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
