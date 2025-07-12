// src/components/orders/OrderStats.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Package,
  Users,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Utensils,
} from "lucide-react";

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  averagePreparationTime: number;
  completionRate: number;
  peakHours: { hour: number; count: number }[];
}

interface OrderStatsProps {
  stats: OrderStats;
}

export default function OrderStats({ stats }: OrderStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const getPreparationTimeStatus = (time: number) => {
    if (time <= 15)
      return { color: "text-green-500", icon: CheckCircle, label: "Excellent" };
    if (time <= 25)
      return { color: "text-yellow-500", icon: Clock, label: "Good" };
    return {
      color: "text-red-500",
      icon: AlertTriangle,
      label: "Needs Improvement",
    };
  };

  const getCompletionRateStatus = (rate: number) => {
    if (rate >= 95) return { color: "text-green-500", icon: TrendingUp };
    if (rate >= 85) return { color: "text-yellow-500", icon: Clock };
    return { color: "text-red-500", icon: TrendingDown };
  };

  const preparationStatus = getPreparationTimeStatus(
    stats.averagePreparationTime
  );
  const completionStatus = getCompletionRateStatus(stats.completionRate);
  const PrepTimeIcon = preparationStatus.icon;
  const CompletionIcon = completionStatus.icon;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrders}</div>
          <p className="text-xs text-muted-foreground">
            All orders in the system
          </p>
        </CardContent>
      </Card>

      {/* Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Avg: {formatCurrency(stats.averageOrderValue)} per order
          </p>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <CompletionIcon className={`h-4 w-4 ${completionStatus.color}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPercentage(stats.completionRate)}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.completedOrders} of {stats.totalOrders} completed
          </p>
        </CardContent>
      </Card>

      {/* Average Prep Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Prep Time</CardTitle>
          <PrepTimeIcon className={`h-4 w-4 ${preparationStatus.color}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.averagePreparationTime}min
          </div>
          <p className={`text-xs ${preparationStatus.color}`}>
            {preparationStatus.label}
          </p>
        </CardContent>
      </Card>

      {/* Detailed Status Breakdown */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">Order Status Breakdown</CardTitle>
          <CardDescription>
            Real-time overview of all orders in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {/* Pending */}
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pendingOrders}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (stats.pendingOrders / stats.totalOrders) * 100 || 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Preparing */}
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.preparingOrders}
              </div>
              <div className="text-sm text-muted-foreground">Preparing</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (stats.preparingOrders / stats.totalOrders) * 100 || 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Ready */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.readyOrders}
              </div>
              <div className="text-sm text-muted-foreground">Ready</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (stats.readyOrders / stats.totalOrders) * 100 || 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Completed */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.completedOrders}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (stats.completedOrders / stats.totalOrders) * 100 || 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Cancelled */}
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.cancelledOrders}
              </div>
              <div className="text-sm text-muted-foreground">Cancelled</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (stats.cancelledOrders / stats.totalOrders) * 100 || 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Total Active */}
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.pendingOrders +
                  stats.preparingOrders +
                  stats.readyOrders}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      ((stats.pendingOrders +
                        stats.preparingOrders +
                        stats.readyOrders) /
                        stats.totalOrders) *
                        100 || 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Peak:{" "}
              {stats.peakHours.length > 0
                ? `${stats.peakHours[0]?.hour}:00`
                : "N/A"}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Utensils className="h-3 w-3" />
              Kitchen: {stats.preparingOrders} active
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Efficiency: {formatPercentage(stats.completionRate)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
