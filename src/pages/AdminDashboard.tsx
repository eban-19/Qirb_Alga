import { Tabs, TabsContent } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/admin/OverviewTab";
import { OwnersTab } from "@/components/admin/OwnersTab";
import { PensionsTab } from "@/components/admin/PensionsTab";
import { CustomersTab } from "@/components/admin/CustomersTab";
import { StaffsTab } from "@/components/admin/StaffsTab";
import { AlertsTab } from "@/components/admin/AlertsTab";
import { BookingsTab } from "@/components/admin/BookingsTab";
import { PaymentsTab } from "@/components/admin/PaymentsTab";
import { SystemSettingsTab } from "@/components/admin/SystemSettingsTab";
import { SubscriptionPoliciesTab } from "@/components/admin/SubscriptionPoliciesTab";

import { useAdminDashboardData } from "@/hooks/useAdminDashboardData";
import { useAdminHandlers } from "@/hooks/useAdminHandlers";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { AdminMetricsGrid } from "@/components/admin/AdminMetricsGrid";
import { OwnerDetailsModal } from "@/components/admin/OwnerDetailsModal";

export default function AdminDashboard() {
  const ui = useAdminDashboardData();
  const handlers = useAdminHandlers(ui);

  const propertyNames = ui.properties.map((p: any) => p.name);

  return (
    <AdminDashboardLayout alerts={ui.alerts} onAlertClick={(id) => handlers.handleOwnerAction('view', id)}>
      <div className="space-y-4">
        {/* <AdminMetricsGrid metrics={ui.metrics} bookings={ui.bookings} /> */}

        <Tabs value={ui.activeTab} onValueChange={ui.setActiveTab} className="space-y-8 overflow-x-hidden">

          <TabsContent value="overview">
            <OverviewTab recentOwners={ui.owners} metrics={ui.metrics} alerts={ui.alerts} />
          </TabsContent>

          <TabsContent value="owners">
            <OwnersTab
              owners={ui.owners}
              searchTerm={ui.searchTerm}
              filterStatus={ui.filterStatus}
              onSearchChange={ui.setSearchTerm}
              onFilterChange={ui.setFilterStatus}
              onOwnerAction={handlers.handleOwnerAction}
              onBulkOwnerAction={handlers.handleBulkOwnerAction}
            />
          </TabsContent>

          <TabsContent value="customers">
            <CustomersTab customers={ui.customers} />
          </TabsContent>

          <TabsContent value="staffs">
            <StaffsTab staffs={ui.staffs} onRefresh={ui.fetchAdminData} />
          </TabsContent>

          <TabsContent value="pensions">
            <PensionsTab pensions={ui.properties} onRefresh={ui.fetchAdminData} />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsTab
              bookings={ui.bookings}
              properties={propertyNames}
              onBookingAction={handlers.handleBookingAction}
            />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsTab alerts={ui.alerts} onAlertAction={handlers.handleAlertAction} />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab
              plans={ui.plans}
              subscriptions={ui.subscriptions}
              owners={ui.owners}
              stats={ui.paymentStats}
              loading={ui.paymentLoading}
              onRefresh={ui.fetchPaymentData}
              onExtendSubscription={handlers.handleExtendSubscription}
              onTerminateFreeAccess={handlers.handleTerminateFreeAccess}
              onToggleSubscriptionStatus={handlers.handleToggleSubscriptionStatus}
              onTerminateSubscription={handlers.handleTerminateSubscription}
            />
          </TabsContent>

          <TabsContent value="settings-account">
            <SystemSettingsTab activeSection="account" />
          </TabsContent>

          <TabsContent value="settings-financial">
            <SystemSettingsTab activeSection="financial" />
          </TabsContent>

          <TabsContent value="settings-security">
            <SystemSettingsTab activeSection="security" />
          </TabsContent>

          <TabsContent value="settings-payouts">
            <SystemSettingsTab activeSection="payouts" />
          </TabsContent>

          <TabsContent value="settings-subscription-policies">
            <SubscriptionPoliciesTab />
          </TabsContent>
        </Tabs>

        {ui.showOwnerDetails && ui.selectedOwner && (
          <OwnerDetailsModal
            selectedOwner={ui.selectedOwner}
            setShowOwnerDetails={ui.setShowOwnerDetails}
            handleOwnerAction={handlers.handleOwnerAction}
          />
        )}
      </div>
    </AdminDashboardLayout>
  );
}
