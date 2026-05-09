import { useState } from "react";
import { AnalyticsData, TopProperty, RecentActivity } from "@/types/admin";

export const useDashboardAnalytics = () => {
  const [timeRange, setTimeRange] = useState("30days");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  // Mock analytics data
  const analyticsData: AnalyticsData = {
    revenue: {
      current: 2456000,
      previous: 2123000,
      change: 15.7,
      trend: 'up'
    },
    bookings: {
      current: 342,
      previous: 298,
      change: 14.8,
      trend: 'up'
    },
    properties: {
      current: 156,
      previous: 142,
      change: 9.9,
      trend: 'up'
    },
    users: {
      current: 2847,
      previous: 2456,
      change: 15.9,
      trend: 'up'
    }
  };

  const topProperties: TopProperty[] = [
    {
      id: "1",
      name: "Sunshine Pension",
      bookings: 89,
      revenue: 890000,
      occupancyRate: 92
    },
    {
      id: "2", 
      name: "Abyssinia Guest House",
      bookings: 76,
      revenue: 760000,
      occupancyRate: 88
    },
    {
      id: "3",
      name: "Ethiopian Paradise",
      bookings: 65,
      revenue: 650000,
      occupancyRate: 85
    }
  ];

  const recentActivity: RecentActivity[] = [
    {
      id: "1",
      type: "booking",
      description: "New booking at Sunshine Pension",
      timestamp: "2 minutes ago",
      amount: 3500
    },
    {
      id: "2",
      type: "registration",
      description: "New property owner registered",
      timestamp: "15 minutes ago"
    },
    {
      id: "3",
      type: "payment",
      description: "Payment received for booking #BK234",
      timestamp: "1 hour ago",
      amount: 7200
    },
    {
      id: "4",
      type: "review",
      description: "5-star review for Abyssinia Guest House",
      timestamp: "2 hours ago"
    }
  ];

  const handleExportData = () => {
    console.log('Export analytics data');
  };

  const handleViewDetails = (metric: string) => {
    setSelectedMetric(metric);
    console.log('View details for:', metric);
  };

  return {
    timeRange,
    setTimeRange,
    selectedMetric,
    analyticsData,
    topProperties,
    recentActivity,
    handleExportData,
    handleViewDetails
  };
};
