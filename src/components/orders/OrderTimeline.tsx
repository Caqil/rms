"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  MapPin,
  DollarSign,
  Phone,
  Mail,
  Edit,
  RefreshCw,
  Package,
  ChefHat,
  Utensils,
  Car,
  Home,
  X,
} from "lucide-react";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface OrderTimelineProps {
  order: any;
  onClose: () => void;
}

export default function OrderTimeline({ order, onClose }: OrderTimelineProps) {
  const [activeTab, setActiveTab] = useState<"timeline" | "items" | "customer">(
    "timeline"
  );

  const getStatusIcon = (status: string, isCompleted: boolean) => {
    if (!isCompleted) {
      return (
        <div className="w-4 h-4 rounded-full border-2 border-gray-300 bg-white" />
      );
    }

    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case "preparing":
        return <ChefHat className="w-4 h-4 text-orange-600" />;
      case "ready":
        return <Package className="w-4 h-4 text-purple-600" />;
      case "served":
        return <Utensils className="w-4 h-4 text-green-600" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case "dine_in":
        return <Utensils className="w-4 h-4" />;
      case "takeout":
        return <Package className="w-4 h-4" />;
      case "delivery":
        return <Car className="w-4 h-4" />;
      default:
        return <Home className="w-4 h-4" />;
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

  // Timeline data
  const timelineEvents = [
    {
      status: "pending",
      label: "Order Placed",
      timestamp: order.timestamps.ordered,
      description: "Order received and waiting for confirmation",
      isCompleted: true,
    },
    {
      status: "confirmed",
      label: "Order Confirmed",
      timestamp: order.timestamps.confirmed,
      description: "Order confirmed and sent to kitchen",
      isCompleted: !!order.timestamps.confirmed,
    },
    {
      status: "preparing",
      label: "Preparation Started",
      timestamp: order.timestamps.preparing,
      description: "Kitchen started preparing the order",
      isCompleted: !!order.timestamps.preparing,
    },
    {
      status: "ready",
      label: "Order Ready",
      timestamp: order.timestamps.ready,
      description: "Order is ready for pickup/serving",
      isCompleted: !!order.timestamps.ready,
    },
    {
      status: "served",
      label: "Order Served",
      timestamp: order.timestamps.served,
      description: "Order has been served to customer",
      isCompleted: !!order.timestamps.served,
    },
    {
      status: "completed",
      label: "Order Completed",
      timestamp: order.timestamps.completed,
      description: "Order completed successfully",
      isCompleted: !!order.timestamps.completed,
    },
  ];

  // Calculate preparation time
  const preparationTime =
    order.timestamps.preparing && order.timestamps.ready
      ? Math.round(
          (new Date(order.timestamps.ready).getTime() -
            new Date(order.timestamps.preparing).getTime()) /
            60000
        )
      : null;

  const totalTime = order.timestamps.completed
    ? Math.round(
        (new Date(order.timestamps.completed).getTime() -
          new Date(order.timestamps.ordered).getTime()) /
          60000
      )
    : null;

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-2xl sm:max-w-2xl">
        <SheetHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl">
                Order #{order.orderNumber}
              </SheetTitle>
              <SheetDescription className="flex items-center space-x-4 mt-2">
                <Badge className={`${getStatusColor(order.status)} text-white`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  {getOrderTypeIcon(order.orderType)}
                  <span className="capitalize">
                    {order.orderType.replace("_", " ")}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                </span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 p-1 bg-gray-100 rounded-lg">
          {[
            { id: "timeline", label: "Timeline", icon: Clock },
            { id: "items", label: "Items", icon: Package },
            { id: "customer", label: "Customer", icon: User },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all
                ${
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(order.total)}
                    </div>
                    <div className="text-sm text-gray-500">Total Amount</div>
                  </CardContent>
                </Card>

                {preparationTime && (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {preparationTime}m
                      </div>
                      <div className="text-sm text-gray-500">Prep Time</div>
                    </CardContent>
                  </Card>
                )}

                {totalTime && (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {totalTime}m
                      </div>
                      <div className="text-sm text-gray-500">Total Time</div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Progress</CardTitle>
                  <CardDescription>
                    Track the progress of this order from placement to
                    completion
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {timelineEvents.map((event, index) => {
                      // Skip cancelled orders timeline after cancellation
                      if (order.status === "cancelled" && index > 0)
                        return null;

                      return (
                        <div
                          key={event.status}
                          className="flex items-start space-x-4"
                        >
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-1">
                            {getStatusIcon(event.status, event.isCompleted)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4
                                className={`text-sm font-medium ${
                                  event.isCompleted
                                    ? "text-gray-900"
                                    : "text-gray-500"
                                }`}
                              >
                                {event.label}
                              </h4>
                              {event.timestamp && (
                                <div className="text-xs text-gray-500">
                                  {formatTime(event.timestamp)}
                                  <div className="text-xs text-gray-400">
                                    {formatDistanceToNow(
                                      new Date(event.timestamp),
                                      { addSuffix: true }
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            <p
                              className={`text-sm mt-1 ${
                                event.isCompleted
                                  ? "text-gray-600"
                                  : "text-gray-400"
                              }`}
                            >
                              {event.description}
                            </p>
                          </div>

                          {/* Connection Line */}
                          {index < timelineEvents.length - 1 && (
                            <div className="absolute ml-2 mt-6 w-px h-6 bg-gray-200" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Items Tab */}
          {activeTab === "items" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Order Items ({order.items.length})
                  </CardTitle>
                  <CardDescription>
                    Detailed breakdown of all items in this order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                          {item.specialInstructions && (
                            <p className="text-sm text-blue-600 mt-1">
                              Note: {item.specialInstructions}
                            </p>
                          )}
                          {item.modifications &&
                            item.modifications.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">
                                  Modifications:
                                </p>
                                {item.modifications.map(
                                  (mod: any, modIndex: number) => (
                                    <Badge
                                      key={modIndex}
                                      variant="outline"
                                      className="text-xs mr-1"
                                    >
                                      {mod.name}{" "}
                                      {mod.price > 0 &&
                                        `(+${formatCurrency(mod.price)})`}
                                    </Badge>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatCurrency(item.price)} each
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Order Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>
                        {formatCurrency(order.subtotal || order.total)}
                      </span>
                    </div>
                    {order.discounts && order.discounts.length > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discounts:</span>
                        <span>
                          -
                          {formatCurrency(
                            order.discounts.reduce(
                              (sum: number, d: any) => sum + d.amount,
                              0
                            )
                          )}
                        </span>
                      </div>
                    )}
                    {order.tax && (
                      <div className="flex justify-between text-sm">
                        <span>Tax:</span>
                        <span>{formatCurrency(order.tax)}</span>
                      </div>
                    )}
                    {order.tips && (
                      <div className="flex justify-between text-sm">
                        <span>Tip:</span>
                        <span>{formatCurrency(order.tips)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Customer Tab */}
          {activeTab === "customer" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Customer Information
                  </CardTitle>
                  <CardDescription>
                    Details about the customer who placed this order
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {order.customerInfo ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium">
                            {order.customerInfo.name}
                          </p>
                          <p className="text-sm text-gray-500">Customer Name</p>
                        </div>
                      </div>

                      {order.customerInfo.phone && (
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              {order.customerInfo.phone}
                            </p>
                            <p className="text-sm text-gray-500">
                              Phone Number
                            </p>
                          </div>
                        </div>
                      )}

                      {order.customerInfo.email && (
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              {order.customerInfo.email}
                            </p>
                            <p className="text-sm text-gray-500">
                              Email Address
                            </p>
                          </div>
                        </div>
                      )}

                      {order.tableNumber && (
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              Table {order.tableNumber}
                            </p>
                            <p className="text-sm text-gray-500">
                              Table Assignment
                            </p>
                          </div>
                        </div>
                      )}

                      {order.customerNotes && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 mb-1">
                            Customer Notes:
                          </h4>
                          <p className="text-sm text-blue-700">
                            {order.customerNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No customer information available</p>
                      <p className="text-sm">
                        This appears to be a walk-in order
                      </p>
                    </div>
                  )}

                  {/* Payment Information */}
                  {order.paymentInfo && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h4 className="font-medium mb-3">Payment Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Payment Method:</span>
                          <span className="capitalize">
                            {order.paymentInfo.method}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Payment Status:</span>
                          <Badge
                            variant={
                              order.paymentInfo.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {order.paymentInfo.status}
                          </Badge>
                        </div>
                        {order.paymentInfo.transactionId && (
                          <div className="flex justify-between text-sm">
                            <span>Transaction ID:</span>
                            <span className="font-mono text-xs">
                              {order.paymentInfo.transactionId}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
