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
import { RoomCalendarSection } from '../components/dashboard/RoomCalendarSection';
import { GuestsSection } from '../components/dashboard/GuestsSection';
import { TransactionsSection } from '../components/dashboard/TransactionsSection';
import { PromotionsSection } from '../components/dashboard/PromotionsSection';
import { PricingPoliciesSection } from '../components/dashboard/pricing/PricingPoliciesSection';
import { BookingPoliciesModule } from '../components/dashboard/policies/BookingPoliciesModule';
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
      navigate("/dashboard/subscription");
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
        subscriptionStatus={status}
      />

      <main className="flex-1 h-full overflow-y-auto min-w-0 lg:pl-64 scrollbar-hide no-scrollbar">
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
          subscriptionStatus={status}
          onLogout={ui.handleLogout}
        />

        <div className="p-4 lg:p-8 max-w-[2000px] ml-0 w-full">
          {/* Section Headers */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {ui.activeTab === "overview" ? (t.dashboard?.header_overview || "Dashboard Overview") :
                  ui.activeTab === "bookings" ? (t.dashboard?.header_bookings || "Bookings Management") :
                    ui.activeTab === "rooms" ? (t.dashboard?.header_rooms || "Rooms Management") :
                      ui.activeTab === "room-calendar" ? "Availability Calendar" :
                        ui.activeTab === "guests" ? (t.dashboard?.header_guests || "Guests Management") :
                        ui.activeTab === "staff" ? (t.dashboard?.header_staff || "Staff & HR Management") :
                          ui.activeTab === "pension-profile" ? (t.dashboard?.header_pensionProfile || "Pension Profile") :
                            ui.activeTab === "packages" ? (t.dashboard?.header_packages || "Package Tiers") :
                              ui.activeTab === "pricing-policies" ? "Pricing Policies" :
                                ui.activeTab === "booking-policies" ? "Booking Policies" :
                                ui.activeTab === "promotions" ? (t.dashboard?.header_promotions || "Promotions & Offers") :
                                  ui.activeTab === "transactions" ? (t.dashboard?.header_transactions || "Financial Transactions") :
                                  ui.activeTab === "reports" ? (t.dashboard?.header_reports || "Reports & Analytics") :
                                    ui.activeTab === "subscription" ? (t.dashboard?.header_subscription || "Subscription Plans") :
                                      ui.activeTab.startsWith("settings-") ? (t.dashboard?.header_settings || "Settings") :
                                        "Dashboard Section"}
              </h2>
            </div>
            <div className="flex gap-2">
              {/* Top actions removed when they are integrated into specific sections */}
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
                <Button variant="destructive" className="rounded-xl px-8 h-12 font-bold" onClick={() => navigate("/dashboard/subscription")}>
                  Renew Now
                </Button>
              </div>
            )}

            {status?.isSoftRestricted && !status?.isRestricted && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center gap-3 shadow-sm text-orange-800">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-medium">
                  <span className="font-bold">Account Restricted:</span> Your subscription has expired. Some features are currently disabled.
                </p>
                <Button variant="ghost" size="sm" className="ml-auto text-orange-700 font-bold hover:bg-orange-100" onClick={() => navigate("/dashboard/subscription")}>
                  Renew Now
                </Button>
              </div>
            )}

            {status?.gracePeriod?.isActive && !status?.isRestricted && !status?.isSoftRestricted && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 shadow-sm text-amber-800">
                <Clock className="w-5 h-5" />
                <p className="text-sm font-medium">
                  <span className="font-bold">Grace Period Active:</span> You have {status.gracePeriod.daysLeft} days to renew before restrictions apply.
                </p>
                <Button variant="ghost" size="sm" className="ml-auto text-amber-700 font-bold hover:bg-amber-100" onClick={() => navigate("/dashboard/subscription")}>
                  Renew Now
                </Button>
              </div>
            )}

            {status?.warnings && status.warnings.length > 0 && !status.isRestricted && !status.isSoftRestricted && !status.gracePeriod?.isActive && (
              <div className="mb-6 space-y-2">
                {status.warnings.map((warning, i) => (
                  <div key={i} className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 text-blue-800 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            )}

            {status?.trial?.isActive && !status.isRestricted && !status.hasActiveSubscription && (
              <div className="mb-6 p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <p className="text-sm font-medium text-foreground">
                    <span className="font-bold">Free Trial:</span> You have <span className="text-primary font-bold">{status.trial.daysLeft} days</span> left on your trial.
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/10" onClick={() => navigate("/dashboard/subscription")}>
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
                onCreatePension={() => {
                  if (status?.isSoftRestricted) return toast.error("Action restricted. Please renew your subscription.");
                  ui.setShowCreatePension(true);
                }}
                onNavigateTab={(tab) => navigate(tab === 'overview' ? '/dashboard' : `/dashboard/${tab}`)}
                onAddStaff={() => { 
                  if (status?.isSoftRestricted) return toast.error("Action restricted. Please renew your subscription.");
                  ui.setEditingStaff(null); ui.setNewStaff({ full_name: '', role: '', phone: '', salary: '', pension_id: '', owner_id: '', department: '', email: '', status: 'active' }); ui.setShowAddStaffModal(true); 
                }}
                onAddRoom={() => {
                  if (status?.isSoftRestricted) return toast.error("Action restricted. Please renew your subscription.");
                  ui.setShowAddRoomModal(true);
                }}
                onAddPackage={() => {
                  if (status?.isSoftRestricted) return toast.error("Action restricted. Please renew your subscription.");
                  ui.setEditingPackage(null);
                  ui.setNewPackage({
                    name: '', name_en: '', name_am: '', name_om: '', price: '',
                    description: '', description_en: '', description_am: '', description_om: '',
                    services: ['WiFi', 'Clean Room', 'Basic Amenities'],
                    isMostPopular: false, image: '', customService: '', imageType: 'Normal'
                  });
                  ui.setShowAddPackageModal(true);
                }}
                onBookWalkIn={() => ui.setShowWalkInModal(true)}
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
                downloadTemplate={() => { }}
                pagination={ui.pagination.staff}
                onPageChange={(page) => ui.setPagination({ ...ui.pagination, staff: { ...ui.pagination.staff, page } })}
                onLimitChange={(limit) => ui.setPagination({ ...ui.pagination, staff: { ...ui.pagination.staff, limit, page: 1 } })}
                selectedRows={ui.selectedRows.staff}
                onToggleSelection={(id) => ui.toggleSelection('staff', id)}
                onSelectAll={(ids) => ui.setSelectedRows({ ...ui.selectedRows, staff: ids })}
                totalItems={data.dataTotals.staff}
                language={language}
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
                onAddNewBooking={() => ui.setShowWalkInModal(true)}
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
                pagination={ui.pagination.rooms}
                onPageChange={(page) => ui.setPagination({ ...ui.pagination, rooms: { ...ui.pagination.rooms, page } })}
                onLimitChange={(limit) => ui.setPagination({ ...ui.pagination, rooms: { ...ui.pagination.rooms, limit, page: 1 } })}
                selectedRows={ui.selectedRows.rooms}
                onToggleSelection={(id) => ui.toggleSelection('rooms', id)}
                onSelectAll={(ids) => ui.setSelectedRows({ ...ui.selectedRows, rooms: ids })}
                onUpdateStatus={handlers.handleUpdateRoomStatus}
                totalItems={data.dataTotals.rooms}
              />
            )}

            {ui.activeTab === "room-calendar" && !status?.isRestricted && (
              <RoomCalendarSection />
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
                onExport={handlers.handleExportTransactions}
                selectedCategory={ui.transactionCategory}
                onCategoryChange={ui.setTransactionCategory}
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
                onEditPackage={(pkg) => { ui.setEditingPackage(pkg); ui.setNewPackage({ ...pkg } as unknown as typeof ui.newPackage); ui.setShowAddPackageModal(true); }}
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
                language={language}
              />
            )}

            {ui.activeTab === "pricing-policies" && !status?.isRestricted && (
              <PricingPoliciesSection pensionId={data.selectedPensionId as number} />
            )}

            {ui.activeTab === "booking-policies" && !status?.isRestricted && (
              <BookingPoliciesModule pensionId={data.selectedPensionId as number} />
            )}

            {ui.activeTab === "promotions" && !status?.isRestricted && (
              <PromotionsSection />
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
                bankSettings={ui.bankSettings}
                setBankSettings={ui.setBankSettings}
                securitySettings={ui.securitySettings}
                setSecuritySettings={ui.setSecuritySettings}
                approvalStatus="Approved"
                isUpdating={ui.isUpdating}
                setIsUpdating={ui.setIsUpdating}
                onSaveBusinessProfile={() => { }}
                onSaveSecuritySettings={handlers.handleSaveSecuritySettings}
                onToggleTwoFactor={() => { }}
                showSaveSuccess={ui.showSaveSuccess}
                subscriptionStatus={status}
                onUpgradeClick={() => navigate("/dashboard/subscription")}
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
