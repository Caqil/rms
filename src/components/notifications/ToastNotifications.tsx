"use client";

import { JSX, useEffect } from "react";
import { X, AlertTriangle, CheckCircle, Info, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";

export default function ToastNotifications() {
  const {
    toastNotifications,
    removeToastNotification,
    clearAllToasts,
    getNotificationIcon,
    getNotificationColor,
  } = useRealTimeNotifications();

  // Auto-remove urgent notifications after 10 seconds
  useEffect(() => {
    toastNotifications.forEach((toast) => {
      if (toast.priority === "urgent" && !toast.autoClose) {
        const timer = setTimeout(() => {
          removeToastNotification(toast.id);
        }, 10000);

        return () => clearTimeout(timer);
      }
    });
  }, [toastNotifications, removeToastNotification]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case "high":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "medium":
        return <Info className="h-5 w-5 text-blue-600" />;
      case "low":
        return <CheckCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getProgressBarColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-blue-500";
      case "low":
        return "bg-gray-500";
      default:
        return "bg-gray-300";
    }
  };

  if (toastNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {/* Clear All Button (only show if more than 2 notifications) */}
      {toastNotifications.length > 2 && (
        <div className="flex justify-end mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllToasts}
            className="text-xs bg-white/90 backdrop-blur-sm border shadow-sm hover:bg-white"
          >
            Clear all ({toastNotifications.length})
          </Button>
        </div>
      )}

      {/* Toast Notifications */}
      {toastNotifications.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onRemove={removeToastNotification}
          getPriorityIcon={getPriorityIcon}
          getProgressBarColor={getProgressBarColor}
          getNotificationColor={getNotificationColor}
        />
      ))}
    </div>
  );
}

interface ToastCardProps {
  toast: any;
  onRemove: (id: string) => void;
  getPriorityIcon: (priority: string) => JSX.Element;
  getProgressBarColor: (priority: string) => string;
  getNotificationColor: (priority: string) => string;
}

function ToastCard({
  toast,
  onRemove,
  getPriorityIcon,
  getProgressBarColor,
  getNotificationColor,
}: ToastCardProps) {
  return (
    <Card
      className={`
        w-full shadow-lg border-l-4 transition-all duration-300 ease-in-out
        transform translate-x-0 hover:scale-[1.02]
        ${getNotificationColor(toast.priority)}
        ${toast.priority === "urgent" ? "animate-pulse" : ""}
        bg-white/95 backdrop-blur-sm
      `}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Priority Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {getPriorityIcon(toast.priority)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {toast.title}
                  </h4>
                  <Badge
                    variant={
                      toast.priority === "urgent"
                        ? "destructive"
                        : toast.priority === "high"
                        ? "secondary"
                        : "outline"
                    }
                    className="text-xs"
                  >
                    {toast.priority}
                  </Badge>
                </div>

                <p className="text-sm text-gray-700 leading-relaxed">
                  {toast.message}
                </p>

                {/* Additional data display */}
                {toast.data && (
                  <div className="mt-2 text-xs text-gray-500">
                    {toast.data.orderId && (
                      <span>Order: {toast.data.orderId.slice(-6)}</span>
                    )}
                    {toast.data.tableNumber && (
                      <span className="ml-2">
                        Table: {toast.data.tableNumber}
                      </span>
                    )}
                  </div>
                )}

                {/* Timestamp */}
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(toast.timestamp).toLocaleTimeString()}
                </div>
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(toast.id)}
                className="h-6 w-6 p-0 hover:bg-gray-100 ml-2 flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            {/* Progress Bar for Auto-close */}
            {toast.autoClose && toast.duration && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full ${getProgressBarColor(
                      toast.priority
                    )} transition-all duration-300`}
                    style={{
                      animation: `shrink ${toast.duration}ms linear forwards`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons for urgent notifications */}
        {toast.priority === "urgent" && toast.data?.orderId && (
          <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => {
                // Navigate to order details
                window.location.href = `/dashboard/orders/${toast.data.orderId}`;
              }}
            >
              View Order
            </Button>
            <Button
              size="sm"
              className="flex-1 text-xs"
              onClick={() => {
                // Quick action based on notification type
                if (toast.type === "kitchen") {
                  window.location.href = "/dashboard/kitchen";
                } else {
                  window.location.href = "/dashboard/orders";
                }
              }}
            >
              Take Action
            </Button>
          </div>
        )}
      </CardContent>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </Card>
  );
}
