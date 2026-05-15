import { Building, Users, DollarSign, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/admin/MetricCard";
import { PlatformMetrics, AdminBooking } from "@/types/admin";

interface AdminMetricsGridProps {
  metrics: PlatformMetrics;
  bookings: AdminBooking[];
}

export const AdminMetricsGrid = ({ metrics, bookings }: AdminMetricsGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2 sm:px-4 sm:gap-6 mt-4 mb-4">
      <MetricCard
        title="Total Properties"
        value={metrics.totalProperties.toString()}
        change={8}
        icon={<Building className="w-6 h-6 text-blue-600" />}
        color="bg-blue-50"
      />
      <MetricCard
        title="Active Owners"
        value={metrics.totalOwners.toString()}
        change={12}
        icon={<Users className="w-6 h-6 text-green-600" />}
        color="bg-green-50"
      />
      <MetricCard
        title="Total Bookings"
        value={bookings.length.toString()}
        change={15}
        icon={<DollarSign className="w-6 h-6 text-purple-600" />}
        color="bg-purple-50"
      />
      <MetricCard
        title="Occupancy Rate"
        value={`${metrics.occupancyRate}%`}
        change={3}
        icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
        color="bg-orange-50"
      />
    </div>
  );
};
