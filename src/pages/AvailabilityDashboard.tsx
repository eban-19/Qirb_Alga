import React, { useState, useEffect } from 'react';
import { BedDouble, BarChart3, Users, Calendar, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import AvailabilityManager from '@/components/AvailabilityManager';
import QuickAvailabilityActions from '@/components/QuickAvailabilityActions';
import availabilityService from '@/services/availabilityService';
import { RoomNeedingAttention } from '@/types/availability';

const AvailabilityDashboard: React.FC = () => {
  const [pensionId, setPensionId] = useState<number>(1); // Default pension ID
  const [stats, setStats] = useState({
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    maintenanceRooms: 0,
    blockedRooms: 0,
    checkInsToday: 0,
    checkOutsToday: 0,
    overdueCheckIns: 0,
    overdueCheckOuts: 0
  });
  const [loading, setLoading] = useState(true);

  // Calculate statistics from rooms data
  const calculateStats = (rooms: RoomNeedingAttention[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const roomStats = rooms.reduce((acc, room) => {
      // Count room statuses
      switch (room.availability_status) {
        case 'Available':
          acc.availableRooms++;
          break;
        case 'Occupied':
          acc.occupiedRooms++;
          break;
        case 'Maintenance':
          acc.maintenanceRooms++;
          break;
        case 'Blocked':
          acc.blockedRooms++;
          break;
      }
      acc.totalRooms++;

      // Count today's check-ins
      if (room.check_in_date) {
        const checkInDate = new Date(room.check_in_date);
        if (checkInDate >= today && checkInDate < tomorrow && !room.actual_check_in) {
          acc.checkInsToday++;
          if (checkInDate < new Date()) {
            acc.overdueCheckIns++;
          }
        }
      }

      // Count today's check-outs
      if (room.check_out_date) {
        const checkOutDate = new Date(room.check_out_date);
        if (checkOutDate >= today && checkOutDate < tomorrow && !room.actual_check_out) {
          acc.checkOutsToday++;
          if (checkOutDate < new Date()) {
            acc.overdueCheckOuts++;
          }
        }
      }

      return acc;
    }, {
      totalRooms: 0,
      availableRooms: 0,
      occupiedRooms: 0,
      maintenanceRooms: 0,
      blockedRooms: 0,
      checkInsToday: 0,
      checkOutsToday: 0,
      overdueCheckIns: 0,
      overdueCheckOuts: 0
    });

    setStats(roomStats);
  };

  // Load room data and calculate stats
  const loadStats = async () => {
    try {
      const result = await availabilityService.getRoomsNeedingAttention(pensionId);
      if (result.success) {
        calculateStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [pensionId]);

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BedDouble className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading availability dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BedDouble className="w-6 h-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Availability Dashboard</h1>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Pension ID: {pensionId}
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Rooms"
          value={stats.totalRooms}
          icon={<BedDouble className="w-5 h-5 text-blue-600" />}
          color="text-blue-600"
        />
        <StatCard
          title="Available"
          value={stats.availableRooms}
          icon={<Calendar className="w-5 h-5 text-green-600" />}
          color="text-green-600"
          subtitle={`${Math.round((stats.availableRooms / stats.totalRooms) * 100)}% occupied`}
        />
        <StatCard
          title="Occupied"
          value={stats.occupiedRooms}
          icon={<Users className="w-5 h-5 text-red-600" />}
          color="text-red-600"
        />
        <StatCard
          title="Maintenance"
          value={stats.maintenanceRooms}
          icon={<Settings className="w-5 h-5 text-yellow-600" />}
          color="text-yellow-600"
        />
      </div>

      {/* Today's Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Check-ins"
          value={stats.checkInsToday}
          icon={<Calendar className="w-5 h-5 text-blue-600" />}
          color="text-blue-600"
          subtitle={stats.overdueCheckIns > 0 ? `${stats.overdueCheckIns} overdue` : ''}
        />
        <StatCard
          title="Today's Check-outs"
          value={stats.checkOutsToday}
          icon={<Calendar className="w-5 h-5 text-purple-600" />}
          color="text-purple-600"
          subtitle={stats.overdueCheckOuts > 0 ? `${stats.overdueCheckOuts} overdue` : ''}
        />
        <StatCard
          title="Overdue Actions"
          value={stats.overdueCheckIns + stats.overdueCheckOuts}
          icon={<BarChart3 className="w-5 h-5 text-red-600" />}
          color="text-red-600"
          subtitle="Requires attention"
        />
        <StatCard
          title="Blocked Rooms"
          value={stats.blockedRooms}
          icon={<Settings className="w-5 h-5 text-gray-600" />}
          color="text-gray-600"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="management" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="management">Room Management</TabsTrigger>
          <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-4">
          <AvailabilityManager pensionId={pensionId} />
        </TabsContent>

        <TabsContent value="quick-actions" className="space-y-4">
          <QuickAvailabilityActions onSuccess={loadStats} />
        </TabsContent>
      </Tabs>

      {/* Alert for overdue actions */}
      {(stats.overdueCheckIns > 0 || stats.overdueCheckOuts > 0) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <BarChart3 className="w-5 h-5" />
              <span className="font-semibold">
                {stats.overdueCheckIns + stats.overdueCheckOuts} overdue actions require attention
              </span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              {stats.overdueCheckIns} overdue check-ins, {stats.overdueCheckOuts} overdue check-outs
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AvailabilityDashboard;
