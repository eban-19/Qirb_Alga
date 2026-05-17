import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  CreditCard, Plus, Edit, Trash2, Calendar, User, Shield, 
  TrendingUp, Activity, CheckCircle, AlertTriangle, Clock,
  ArrowUpRight, DollarSign, Gift, MoreVertical, Ban, CheckCircle2, ZapOff
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import apiService from "@/services/api";
import { OverrideModal } from "./OverrideModal";
import { PlanModal } from "./PlanModal";
import { ExtendSubscriptionModal } from "./ExtendSubscriptionModal";
import { ConfirmActionModal } from "./ConfirmActionModal";

interface PaymentsTabProps {
  plans: any[];
  subscriptions: any[];
  owners: any[];
  stats: any;
  loading: boolean;
  onRefresh: () => void;
  onExtendSubscription?: (subscriptionId: number, durationDays: number) => Promise<void>;
  onTerminateFreeAccess?: (subscriptionId: number) => Promise<void>;
  onToggleSubscriptionStatus?: (subscriptionId: number, status: "ACTIVE" | "CANCELLED") => Promise<void>;
  onTerminateSubscription?: (subscriptionId: number) => Promise<void>;
}

export function PaymentsTab({ 
  plans, 
  subscriptions, 
  owners,
  stats, 
  loading,
  onRefresh,
  onExtendSubscription,
  onTerminateFreeAccess,
  onToggleSubscriptionStatus,
  onTerminateSubscription
}: PaymentsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState("subscriptions");
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  
  // New Modals State
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    description: React.ReactNode;
    confirmText: string;
    variant: "destructive" | "default";
    action: () => Promise<void>;
  } | null>(null);

  const handleOpenConfirm = (title: string, description: string, confirmText: string, variant: "destructive" | "default", action: () => Promise<void>) => {
    setConfirmAction({ title, description, confirmText, variant, action });
    setIsConfirmModalOpen(true);
  };

  const handleDeletePlan = async (planId: number, planName: string) => {
    handleOpenConfirm(
      "Delete Subscription Plan",
      `Are you sure you want to delete the plan "${planName}"? This action cannot be undone. Note: Plans with active or past subscriptions cannot be deleted.`,
      "Delete Plan",
      "destructive",
      async () => {
        try {
          const response = await apiService.deleteSubscriptionPlan(planId);
          if (response.success) {
            toast.success("Plan deleted successfully");
            onRefresh();
          } else {
            toast.error(response.message || "Failed to delete plan. Try deactivating it instead.");
          }
        } catch (error) {
          toast.error("Failed to delete plan. Try deactivating it instead.");
        }
      }
    );
  };

  const metrics = [
    {
      title: "Total Revenue",
      value: `${stats?.totalRevenue?.toLocaleString() || 0} ETB`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
      trend: stats?.revenueTrend || "0 ETB this month",
      description: "Lifetime platform earnings"
    },
    {
      title: "Active Subscriptions",
      value: stats?.activeSubscriptions || 0,
      icon: Activity,
      color: "text-blue-600",
      bg: "bg-blue-50",
      trend: stats?.activeSubsTrend || "0 this month",
      description: "Currently paying owners"
    },
    {
      title: "Expired",
      value: stats?.expiredSubscriptions || 0,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
      trend: stats?.expiredSubsTrend || "0 this month",
      description: "Subs needing renewal"
    },
    {
      title: "Free Access",
      value: stats?.freeAccessUsers || 0,
      icon: Gift,
      color: "text-purple-600",
      bg: "bg-purple-50",
      trend: stats?.freeUsersTrend || "0 this month",
      description: "Admin granted access"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl text-white shadow-lg">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Payments & Subscriptions</h2>
            <p className="text-slate-600">Monitor revenue and manage owner access levels</p>
          </div>
        </div>
        <Button variant="outline" onClick={onRefresh} className="gap-2">
          <Activity className="w-4 h-4" />
          Refresh Data
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-none shadow-md bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-lg", metric.bg)}>
                  <metric.icon className={cn("w-5 h-5", metric.color)} />
                </div>
                <Badge variant="outline" className="text-xs font-medium bg-slate-50">
                  {metric.trend}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">{metric.title}</p>
                <h3 className="text-2xl font-bold text-slate-900">{metric.value}</h3>
                <p className="text-xs text-slate-400">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="subscriptions" className="rounded-lg py-2.5">
            Owner Subscriptions
          </TabsTrigger>
          <TabsTrigger value="plans" className="rounded-lg py-2.5">
            Subscription Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Subscriptions</CardTitle>
                  <CardDescription>View and manage all owner payment statuses</CardDescription>
                </div>
                <Button 
                  size="sm" 
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsOverrideModalOpen(true)}
                >
                  <Shield className="w-4 h-4" />
                  Grant Free Access
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/30">
                    <TableHead>Owner / Business</TableHead>
                    <TableHead>Current Plan</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.subscription_id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                            {sub.owner.full_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{sub.owner.full_name}</div>
                            <div className="text-xs text-slate-500">{sub.owner.ownerProfile?.business_name || "Personal Owner"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{sub.plan.name}</span>
                          {sub.is_free && <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none text-[10px] h-4">FREE</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {format(new Date(sub.start_date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className={cn(
                          "font-medium",
                          new Date(sub.end_date) < new Date() ? "text-red-600" : "text-slate-900"
                        )}>
                          {format(new Date(sub.end_date), "MMM d, yyyy")}
                        </span>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const now = new Date();
                          const endDate = new Date(sub.end_date);
                          const isExpired = endDate < now;
                          
                          if (sub.status === 'CANCELLED') {
                            return <Badge className="bg-slate-100 text-slate-700 border-none">Cancelled/Deactivated</Badge>;
                          }
                          if (sub.is_free) {
                            return <Badge className="bg-purple-100 text-purple-700 border-none">Free Access</Badge>;
                          }
                          if (isExpired) {
                            return <Badge className="bg-red-100 text-red-700 border-none">Expired</Badge>;
                          }
                          return <Badge className="bg-green-100 text-green-700 border-none">Active</Badge>;
                        })()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100">
                              <MoreVertical className="h-4 w-4 text-slate-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-slate-200">
                            <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => {
                              setSelectedSubscription(sub);
                              setIsExtendModalOpen(true);
                            }}>
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-slate-700">Extend Subscription</span>
                            </DropdownMenuItem>
                            
                            {sub.is_free && (
                              <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => {
                                handleOpenConfirm(
                                  "Terminate Free Access",
                                  `Are you sure you want to revoke free access for ${sub.owner?.full_name}? This will expire their subscription immediately.`,
                                  "Terminate Access",
                                  "destructive",
                                  async () => {
                                    if (onTerminateFreeAccess) await onTerminateFreeAccess(sub.subscription_id);
                                  }
                                );
                              }}>
                                <ZapOff className="h-4 w-4 text-red-600" />
                                <span className="font-medium text-red-600">Terminate Free Access</span>
                              </DropdownMenuItem>
                            )}

                            {sub.status !== 'CANCELLED' && sub.status !== 'EXPIRED' && (
                              <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => {
                                handleOpenConfirm(
                                  "Terminate Subscription",
                                  `Are you sure you want to terminate ${sub.owner?.full_name}'s subscription? This will expire it immediately.`,
                                  "Terminate",
                                  "destructive",
                                  async () => {
                                    if (onTerminateSubscription) await onTerminateSubscription(sub.subscription_id);
                                  }
                                );
                              }}>
                                <Ban className="h-4 w-4 text-red-600" />
                                <span className="font-medium text-red-600">Terminate Subscription</span>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            {sub.status !== 'CANCELLED' ? (
                              <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => {
                                handleOpenConfirm(
                                  "Deactivate Subscription",
                                  `Are you sure you want to deactivate ${sub.owner?.full_name}'s subscription? They will lose access to restricted features.`,
                                  "Deactivate",
                                  "destructive",
                                  async () => {
                                    if (onToggleSubscriptionStatus) await onToggleSubscriptionStatus(sub.subscription_id, "CANCELLED");
                                  }
                                );
                              }}>
                                <Ban className="h-4 w-4 text-amber-600" />
                                <span className="font-medium text-amber-600">Deactivate Subscription</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => {
                                handleOpenConfirm(
                                  "Activate Subscription",
                                  `Are you sure you want to reactivate ${sub.owner?.full_name}'s subscription?`,
                                  "Activate",
                                  "default",
                                  async () => {
                                    if (onToggleSubscriptionStatus) await onToggleSubscriptionStatus(sub.subscription_id, "ACTIVE");
                                  }
                                );
                              }}>
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-green-600">Activate Subscription</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {subscriptions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                        No subscription records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="flex justify-end">
            <Button 
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setSelectedPlan(null);
                setIsPlanModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Create New Plan
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.plan_id} 
                className={cn(
                  "relative overflow-hidden transition-all duration-300 hover:-translate-y-1",
                  plan.promotion_banner 
                    ? "border-rose-300 shadow-[0_10px_30px_-10px_rgba(244,63,94,0.3)] bg-rose-50/10" 
                    : "border-slate-200 hover:border-blue-300 hover:shadow-md"
                )}
              >
                {!plan.is_public && (
                  <div className="absolute top-0 right-0 z-10">
                    <div className="bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      ADMIN ONLY
                    </div>
                  </div>
                )}
                {plan.promotion_banner && (
                  <div className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold px-4 py-2 text-center shadow-sm">
                    {plan.promotion_banner}
                  </div>
                )}
                <CardHeader className="relative">
                  <CardTitle className="text-xl flex items-center justify-between">
                    {plan.name}
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setIsPlanModalOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDeletePlan(plan.plan_id, plan.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-slate-500 text-sm ml-1">ETB / {plan.duration_days} days</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Features Included</div>
                    <ul className="space-y-2">
                      {(() => {
                        try {
                          const featuresArray = typeof plan.features === 'string' ? JSON.parse(plan.features) : (Array.isArray(plan.features) ? plan.features : []);
                          return featuresArray.map((feature: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ));
                        } catch (e) {
                          return <li className="text-sm text-slate-400 italic">No features listed</li>;
                        }
                      })()}
                    </ul>
                  </div>
                  <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <Badge variant={plan.is_active ? "outline" : "secondary"} className={cn(
                      "font-medium",
                      plan.is_active ? "text-green-600 border-green-200 bg-green-50" : "text-slate-400"
                    )}>
                      {plan.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-xs text-slate-400">ID: #{plan.plan_id}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <OverrideModal 
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        owners={owners}
        plans={plans}
        onSuccess={onRefresh}
      />

      <PlanModal 
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        plan={selectedPlan}
        onSuccess={onRefresh}
      />

      <ExtendSubscriptionModal 
        isOpen={isExtendModalOpen}
        onClose={() => {
          setIsExtendModalOpen(false);
          setSelectedSubscription(null);
        }}
        subscription={selectedSubscription}
        onExtend={async (id, days) => {
          if (onExtendSubscription) await onExtendSubscription(id, days);
        }}
      />

      <ConfirmActionModal 
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setConfirmAction(null);
        }}
        title={confirmAction?.title || ""}
        description={confirmAction?.description || ""}
        confirmText={confirmAction?.confirmText || "Confirm"}
        variant={confirmAction?.variant || "default"}
        onConfirm={confirmAction?.action || (async () => {})}
      />
    </div>
  );
}
