import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  Package,
  Utensils,
  CreditCard,
  FileText,
  Calendar,
  Truck,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { IOrder } from "@/models/Order";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderDetailsDialogProps {
  orderId: string;
  open: boolean;
  onClose: () => void;
}

export function OrderDetailsDialog({
  orderId,
  open,
  onClose,
}: OrderDetailsDialogProps) {
  const { data: orderData, loading } = useApi<{ order: IOrder }>(
    `/api/orders/${orderId}`
  );

  const order = orderData?.order;

  if (loading || !order) {
    return (
      <Dialog open={open} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Loading Order Details...</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-muted animate-pulse rounded"
              ></div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const getTimelineStatus = (status: string, timestamp?: Date) => {
    if (!timestamp) return { completed: false, time: null };
    return { completed: true, time: timestamp };
  };

  const timeline = [
    {
      status: "ordered",
      label: "Order Placed",
      ...getTimelineStatus("ordered", order.timestamps.ordered),
    },
    {
      status: "confirmed",
      label: "Confirmed",
      ...getTimelineStatus("confirmed", order.timestamps.confirmed),
    },
    {
      status: "preparing",
      label: "Preparing",
      ...getTimelineStatus("preparing", order.timestamps.preparing),
    },
    {
      status: "ready",
      label: "Ready",
      ...getTimelineStatus("ready", order.timestamps.ready),
    },
    {
      status: "served",
      label: "Served",
      ...getTimelineStatus("served", order.timestamps.served),
    },
    {
      status: "completed",
      label: "Completed",
      ...getTimelineStatus("completed", order.timestamps.completed),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">
                Order {order.orderNumber}
              </DialogTitle>
              <DialogDescription>
                {formatDate(order.timestamps.ordered)} at{" "}
                {formatTime(order.timestamps.ordered)}
              </DialogDescription>
            </div>
            <OrderStatusBadge status={order.status} size="lg" />
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timeline.map((step, index) => (
                    <div
                      key={step.status}
                      className="flex items-center space-x-3"
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          step.completed
                            ? "bg-green-500"
                            : index ===
                              timeline.findIndex(
                                (t) => t.status === order.status
                              )
                            ? "bg-blue-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            step.completed ? "text-green-700" : "text-gray-500"
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.time && (
                          <p className="text-sm text-muted-foreground">
                            {formatDate(step.time)} at {formatTime(step.time)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{order.customerInfo?.name || "Guest"}</span>
                  </div>

                  {order.customerInfo?.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{order.customerInfo.phone}</span>
                    </div>
                  )}

                  {order.customerInfo?.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{order.customerInfo.email}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">
                      {order.orderType.replace("_", " ")}
                    </span>
                  </div>

                  {order.tableNumber && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Table {order.tableNumber}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="font-medium">
                      {order.paymentInfo.method}
                    </span>
                  </div>

                  <div className="flex justify-between">
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
                    <div className="flex justify-between">
                      <span>Transaction ID:</span>
                      <span className="font-mono text-sm">
                        {order.paymentInfo.transactionId}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {item.menuItemId?.name || "Unknown Item"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} ×{" "}
                          {formatCurrency(item.price)}
                        </p>
                        {item.specialInstructions && (
                          <p className="text-sm text-orange-600 mt-1">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                        {item.modifications &&
                          item.modifications.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {item.modifications.map((mod, modIndex) => (
                                <div
                                  key={modIndex}
                                  className="text-xs text-muted-foreground"
                                >
                                  {mod.type}: {mod.item} (
                                  {formatCurrency(mod.price)})
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                      <div className="text-right">
                        <span className="font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>

                  {order.discounts && order.discounts.length > 0 && (
                    <>
                      {order.discounts.map((discount, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-green-600"
                        >
                          <span>{discount.description}:</span>
                          <span>-{formatCurrency(discount.amount)}</span>
                        </div>
                      ))}
                    </>
                  )}

                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatCurrency(order.taxes)}</span>
                  </div>

                  {order.tips > 0 && (
                    <div className="flex justify-between">
                      <span>Tip:</span>
                      <span>{formatCurrency(order.tips)}</span>
                    </div>
                  )}

                  {order.deliveryInfo?.deliveryFee && (
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span>
                        {formatCurrency(order.deliveryInfo.deliveryFee)}
                      </span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            {order.deliveryInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Delivery Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Delivery Address</p>
                      <p className="text-sm text-muted-foreground">
                        {order.deliveryInfo.address}
                      </p>
                    </div>
                  </div>

                  {order.deliveryInfo.estimatedTime && (
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Estimated Delivery</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.deliveryInfo.estimatedTime)} at{" "}
                          {formatTime(order.deliveryInfo.estimatedTime)}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {(order.customerNotes || order.kitchenNotes) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.customerNotes && (
                    <div>
                      <p className="font-medium text-sm">Customer Notes:</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customerNotes}
                      </p>
                    </div>
                  )}

                  {order.kitchenNotes && (
                    <div>
                      <p className="font-medium text-sm">Kitchen Notes:</p>
                      <p className="text-sm text-muted-foreground">
                        {order.kitchenNotes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
