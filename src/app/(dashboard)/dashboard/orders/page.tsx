"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShoppingCart,
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  X,
  RefreshCw,
  Download,
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Package,
} from "lucide-react";
import { useOrderManagement } from "@/hooks/useOrderManagement";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { OrderActions } from "@/components/orders/OrderActions";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

export default function OrdersPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const {
    orders,
    filteredOrders,
    stats,
    filters,
    isLoading,
    updateFilter,
    clearFilters,
    handleStatusUpdate,
    handleCancelOrder,
    refetchOrders,
  } = useOrderManagement();

  const statusCounts = {
    pending: filteredOrders.filter((o) => o.status === "pending").length,
    confirmed: filteredOrders.filter((o) => o.status === "confirmed").length,
    preparing: filteredOrders.filter((o) => o.status === "preparing").length,
    ready: filteredOrders.filter((o) => o.status === "ready").length,
    served: filteredOrders.filter((o) => o.status === "served").length,
    completed: filteredOrders.filter((o) => o.status === "completed").length,
    cancelled: filteredOrders.filter((o) => o.status === "cancelled").length,
  };

  const handleQuickStatusUpdate = async (
    orderId: string,
    newStatus: string
  ) => {
    await handleStatusUpdate(orderId, newStatus);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-12 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Order Management
          </h1>
          <p className="text-muted-foreground">
            Track and manage all restaurant orders
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => refetchOrders()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingOrders} pending, {stats.completedOrders} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.todayRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(stats.avgOrderValue)} per order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.preparingOrders + stats.readyOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.preparingOrders} preparing, {stats.readyOrders} ready
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.todayOrders > 0
                ? Math.round((stats.completedOrders / stats.todayOrders) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.cancelledOrders} cancelled today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filters</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={filters.searchQuery}
                  onChange={(e) => updateFilter("searchQuery", e.target.value)}
                  className="pl-8"
                />
              </div>

              {/* Status Filter */}
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  updateFilter("status", value === "all" ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">
                    Pending ({statusCounts.pending})
                  </SelectItem>
                  <SelectItem value="confirmed">
                    Confirmed ({statusCounts.confirmed})
                  </SelectItem>
                  <SelectItem value="preparing">
                    Preparing ({statusCounts.preparing})
                  </SelectItem>
                  <SelectItem value="ready">
                    Ready ({statusCounts.ready})
                  </SelectItem>
                  <SelectItem value="served">
                    Served ({statusCounts.served})
                  </SelectItem>
                  <SelectItem value="completed">
                    Completed ({statusCounts.completed})
                  </SelectItem>
                  <SelectItem value="cancelled">
                    Cancelled ({statusCounts.cancelled})
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Order Type Filter */}
              <Select
                value={filters.orderType || "all"}
                onValueChange={(value) =>
                  updateFilter("orderType", value === "all" ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="dine_in">Dine In</SelectItem>
                  <SelectItem value="takeout">Takeout</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range Filter */}
              <Select
                value={filters.dateRange || "today"}
                onValueChange={(value) => updateFilter("dateRange", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              {/* Table Number */}
              <Input
                placeholder="Table number..."
                value={filters.tableNumber || ""}
                onChange={(e) => updateFilter("tableNumber", e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
              <span className="text-sm text-muted-foreground">
                Showing {filteredOrders.length} of {orders.length} orders
              </span>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Manage and track order status and details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order._id} className="group">
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <span>{order.orderNumber}</span>
                        {order.tableNumber && (
                          <Badge variant="outline" className="text-xs">
                            Table {order.tableNumber}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {order.customerInfo?.name || "Guest"}
                        </div>
                        {order.customerInfo?.phone && (
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {order.customerInfo.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {order.orderType.replace("_", " ")}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div key={idx}>
                              {item.quantity}x {item.menuItemId?.name || "Item"}
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div>+{order.items.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>

                    <TableCell className="font-medium">
                      {formatCurrency(order.total)}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {formatTime(order.timestamps.ordered)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(order.timestamps.ordered)}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <OrderActions
                        order={order}
                        onStatusUpdate={handleQuickStatusUpdate}
                        onCancel={handleCancelOrder}
                        onViewDetails={() => setSelectedOrderId(order._id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredOrders.length === 0 && (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No orders found</h3>
                <p className="mt-2 text-muted-foreground">
                  No orders match the current filters.
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      {selectedOrderId && (
        <OrderDetailsDialog
          orderId={selectedOrderId}
          open={!!selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
}
