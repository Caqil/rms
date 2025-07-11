import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  Package,
  Utensils,
  Check,
  X,
  AlertCircle,
} from "lucide-react";

interface OrderStatusBadgeProps {
  status: string;
  showIcon?: boolean;
  size?: "sm" | "default" | "lg";
}

export function OrderStatusBadge({
  status,
  showIcon = true,
  size = "default",
}: OrderStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        variant: "secondary" as const,
        label: "Pending",
        icon: Clock,
        className: "bg-yellow-100 text-yellow-800 border-yellow-300",
      },
      confirmed: {
        variant: "secondary" as const,
        label: "Confirmed",
        icon: CheckCircle,
        className: "bg-blue-100 text-blue-800 border-blue-300",
      },
      preparing: {
        variant: "secondary" as const,
        label: "Preparing",
        icon: Utensils,
        className: "bg-orange-100 text-orange-800 border-orange-300",
      },
      ready: {
        variant: "secondary" as const,
        label: "Ready",
        icon: Package,
        className: "bg-purple-100 text-purple-800 border-purple-300",
      },
      served: {
        variant: "default" as const,
        label: "Served",
        icon: Check,
        className: "bg-green-100 text-green-800 border-green-300",
      },
      completed: {
        variant: "default" as const,
        label: "Completed",
        icon: CheckCircle,
        className: "bg-green-100 text-green-800 border-green-300",
      },
      cancelled: {
        variant: "destructive" as const,
        label: "Cancelled",
        icon: X,
        className: "bg-red-100 text-red-800 border-red-300",
      },
    };

    return (
      configs[status as keyof typeof configs] || {
        variant: "outline" as const,
        label: status.charAt(0).toUpperCase() + status.slice(1),
        icon: AlertCircle,
        className: "bg-gray-100 text-gray-800 border-gray-300",
      }
    );
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${
        size === "sm"
          ? "text-xs px-2 py-0.5"
          : size === "lg"
          ? "text-sm px-3 py-1"
          : ""
      }`}
    >
      {showIcon && (
        <Icon className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} mr-1`} />
      )}
      {config.label}
    </Badge>
  );
}
