"use client";

import { useState, useEffect, JSX } from "react";
import { useSession } from "next-auth/react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  RefreshCw,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Package,
} from "lucide-react";
import { useOrderManagement } from "@/hooks/useOrderManagement";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import OrderFilters from "@/components/orders/OrderFilters";
import OrderStats from "@/components/orders/OrderStats";
import OrderTimeline from "@/components/orders/OrderTimeline";
import { OrderActions } from "@/components/orders/OrderActions";

interface OrdersPageProps {}

export default function OrdersPage({}: OrdersPageProps) {
  const { data: session } = useSession();
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const {
    orders,
    filteredOrders,
    stats,
    filters,
    isLoading,
    handleStatusUpdate,
    handleCancelOrder,
    handleUpdateOrder,
    refetchOrders,
    updateFilter,
    clearFilters,
    getOrdersByStatus,
  } = useOrderManagement();

  const { socketManager } = useRealTimeNotifications();

  // Real-time updates
  useEffect(() => {
    if (!socketManager.isConnected()) return;

    const unsubscribeOrderUpdate = socketManager.onOrderStatusUpdate((update) => {
      refetchOrders();
    });

    const unsubscribeNewOrder = socketManager.onNewOrder(() => {
      refetchOrders();
    });

    return () => {
      unsubscribeOrderUpdate();
      unsubscribeNewOrder();
    };
  }, [socketManager, refetchOrders]);

  // Filter orders by tab
  const getOrdersForTab = (tab: string) => {
    switch (tab) {
      case "pending":
        return getOrdersByStatus("pending");
      case "preparing":
        return getOrdersByStatus("preparing");
      case "ready":
        return getOrdersByStatus("ready");
      case "completed":
        return getOrdersByStatus("completed");
      default:
        return filteredOrders;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "confirmed":
        return "bg-blue-500";
      case "preparing":
        return "bg-orange-500";
      case "ready":
        return "bg-purple-500";
      case "served":
        return "bg-green-500";
      case "completed":
        return "bg-gray-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
      case "preparing":
        return <RefreshCw className="h-4 w-4" />;
      case "ready":
      case "served":
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const tabCounts = {
    all: orders.length,
    pending: getOrdersByStatus("pending").length,
    preparing: getOrdersByStatus("preparing").length,
    ready: getOrdersByStatus("ready").length,
    completed: getOrdersByStatus("completed").length,
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
          <p className="text-gray-500">
            Monitor and manage all restaurant orders in real-time
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchOrders()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>

          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <OrderStats stats={stats} />

      {/* Filters */}
      {showFilters && (
        <OrderFilters
          filters={filters}
          onUpdateFilter={updateFilter}
          onClearFilters={clearFilters}
        />
      )}

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Order Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <span>All</span>
            <Badge variant="secondary" className="ml-1">
              {tabCounts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <span>Pending</span>
            <Badge variant="secondary" className="ml-1">
              {tabCounts.pending}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="preparing" className="flex items-center space-x-2">
            <span>Preparing</span>
            <Badge variant="secondary" className="ml-1">
              {tabCounts.preparing}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="ready" className="flex items-center space-x-2">
            <span>Ready</span>
            <Badge variant="secondary" className="ml-1">
              {tabCounts.ready}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center space-x-2">
            <span>Completed</span>
            <Badge variant="secondary" className="ml-1">
              {tabCounts.completed}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Orders List */}
        <TabsContent value={selectedTab}>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {getOrdersForTab(selectedTab)
                .filter((order) =>
                  order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  order.customerInfo?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  order.tableNumber?.includes(searchQuery)
                )
                .map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                    onCancel={handleCancelOrder}
                    onViewDetails={() => setSelectedOrder(order)}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                  />
                ))}

              {getOrdersForTab(selectedTab).length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                    <p className="text-gray-500">
                      {selectedTab === "all" 
                        ? "No orders have been placed yet." 
                        : `No ${selectedTab} orders at the moment.`}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Order Details Modal/Sidebar would go here */}
      {selectedOrder && (
        <OrderTimeline 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
}

interface OrderCardProps {
  order: any;
  onStatusUpdate: (orderId: string, status: string) => Promise<void>;
  onCancel: (orderId: string, reason: string) => Promise<void>;
  onViewDetails: () => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => JSX.Element;
}

function OrderCard({
  order,
  onStatusUpdate,
  onCancel,
  onViewDetails,
  getStatusColor,
  getStatusIcon,
}: OrderCardProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* Order Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold">#{order.orderNumber}</h3>
                <Badge className={`${getStatusColor(order.status)} text-white`}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </div>
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {order.orderType.replace("_", " ")}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                <div>
                  <span className="font-medium">Customer:</span>
                  <br />
                  {order.customerInfo?.name || "Walk-in"}
                </div>
                <div>
                  <span className="font-medium">Table:</span>
                  <br />
                  {order.tableNumber || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Total:</span>
                  <br />
                  {formatCurrency(order.total)}
                </div>
                <div>
                  <span className="font-medium">Time:</span>
                  <br />
                  {formatTime(order.createdAt)}
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Items ({order.items.length}):</p>
                <div className="space-y-1">
                  {order.items.slice(0, 3).map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm text-gray-600">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{order.items.length - 3} more items
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <OrderActions
            order={order}
            onStatusUpdate={onStatusUpdate}
            onCancel={onCancel}
            onViewDetails={onViewDetails}
          />
        </div>
      </CardContent>
    </Card>
  );
}