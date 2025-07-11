import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Check,
  Clock,
  X,
  RefreshCw,
  Package,
  Utensils,
} from "lucide-react";
import { IOrder } from "@/models/Order";

interface OrderActionsProps {
  order: IOrder;
  onStatusUpdate: (orderId: string, status: string) => Promise<void>;
  onCancel: (orderId: string, reason: string) => Promise<void>;
  onViewDetails: () => void;
  onEdit?: () => void;
}

export function OrderActions({
  order,
  onStatusUpdate,
  onCancel,
  onViewDetails,
  onEdit,
}: OrderActionsProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const getAvailableStatusUpdates = (currentStatus: string) => {
    const statusFlow = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["preparing", "cancelled"],
      preparing: ["ready", "cancelled"],
      ready: ["served"],
      served: ["completed"],
      completed: [],
      cancelled: [],
    };

    return statusFlow[currentStatus as keyof typeof statusFlow] || [];
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      confirmed: "Confirm Order",
      preparing: "Start Preparing",
      ready: "Mark Ready",
      served: "Mark Served",
      completed: "Complete Order",
      cancelled: "Cancel Order",
    };

    return labels[status as keyof typeof labels] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      confirmed: Check,
      preparing: Utensils,
      ready: Package,
      served: Check,
      completed: Check,
      cancelled: X,
    };

    return icons[status as keyof typeof icons] || Clock;
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(order._id, newStatus);
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      await onCancel(order._id, "Cancelled from order management");
      setShowCancelDialog(false);
    } catch (error) {
      console.error("Failed to cancel order:", error);
    }
  };

  const availableUpdates = getAvailableStatusUpdates(order.status);
  const canCancel = !["completed", "cancelled"].includes(order.status);

  return (
    <>
      <div className="flex items-center space-x-1">
        {/* Quick Action Button for most common next status */}
        {availableUpdates.length > 0 && availableUpdates[0] !== "cancelled" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusUpdate(availableUpdates[0])}
            disabled={isUpdating}
            className="hidden group-hover:inline-flex"
          >
            {isUpdating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              (() => {
                const Icon = getStatusIcon(availableUpdates[0]);
                return <Icon className="h-4 w-4" />;
              })()
            )}
          </Button>
        )}

        {/* More Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DropdownMenuItem onClick={onViewDetails}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>

            {onEdit && (
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Order
              </DropdownMenuItem>
            )}

            {availableUpdates.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Update Status</DropdownMenuLabel>

                {availableUpdates
                  .filter((status) => status !== "cancelled")
                  .map((status) => {
                    const Icon = getStatusIcon(status);
                    return (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => handleStatusUpdate(status)}
                        disabled={isUpdating}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {getStatusLabel(status)}
                      </DropdownMenuItem>
                    );
                  })}
              </>
            )}

            {canCancel && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowCancelDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel Order
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel order {order.orderNumber}? This
              action cannot be undone and may require refunding the customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              className="bg-red-600 hover:bg-red-700"
            >
              Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
