"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  ChefHat,
  Package,
  AlertTriangle,
  CheckCircle,
  Timer,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OrderStatsProps {
  stats: {
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
  };
}

export default function OrderStats({ stats }: OrderStatsProps) {
  const completionPercentage = (stats.completedOrders / stats.totalOrders) * 100 || 0;
  const cancelledPercentage = (stats.cancelledOrders / stats.totalOrders) * 100 || 0;
  
  const activeOrders = stats.pendingOrders + stats.preparingOrders;
  const urgentOrders = stats.readyOrders; // Orders ready for pickup

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>Avg: {formatCurrency(stats.averageOrderValue)}</span>
            <TrendingUp className="h-3 w-3 text-green-500" />
          </div>
        </CardContent>
      </Card>

      {/* Active Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
          <ChefHat className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeOrders}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{stats.pendingOrders} pending</span>
            <span>•</span>
            <span>{stats.preparingOrders} preparing</span>
          </div>
          {urgentOrders > 0 && (
            <Badge variant="destructive" className="mt-2 text-xs">
              {urgentOrders} ready for pickup
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionPercentage.toFixed(1)}%</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{stats.completedOrders} completed</span>
            {cancelledPercentage > 5 && (
              <>
                <span>•</span>
                <span className="text-red-500">{cancelledPercentage.toFixed(1)}% cancelled</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Average Prep Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Prep Time</CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averagePreparationTime}m</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            {stats.averagePreparationTime <= 15 ? (
              <>
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">Excellent</span>
              </>
            ) : stats.averagePreparationTime <= 25 ? (
              <>
                <Clock className="h-3 w-3 text-yellow-500" />
                <span className="text-yellow-500">Good</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 text-red-500" />
                <span className="text-red-500">Needs improvement</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Stats Row */}
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
                    width: `${(stats.pendingOrders / stats.totalOrders) * 100 || 0}%` 
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
                    width: `${(stats.preparingOrders / stats.totalOrders) * 100 || 0}%` 
                  }}
                />
              </div>
            </div>

            {/* Ready */}
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.readyOrders}
              </div>
              <div className="text-sm text-muted-foreground">Ready</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(stats.readyOrders / stats.totalOrders) * 100 || 0}%` 
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
                    width: `${(stats.completedOrders / stats.totalOrders) * 100 || 0}%` 
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
                    width: `${(stats.cancelledOrders / stats.totalOrders) * 100 || 0}%` 
                  }}
                />
              </div>
            </div>

            {/* Total */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalOrders}
              </div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-gray-900 h-2 rounded-full w-full" />
              </div>
            </div>
          </div>

          {/* Quick Insights */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                {urgentOrders > 0 ? (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                <span>
                  {urgentOrders > 0 
                    ? `${urgentOrders} orders ready for pickup` 
                    : "All orders on track"}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>
                  {activeOrders} orders in kitchen
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>
                  {completionPercentage.toFixed(0)}% success rate today
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}