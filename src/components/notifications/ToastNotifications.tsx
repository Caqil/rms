"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Bell, AlertTriangle, Package, ChefHat } from "lucide-react";
import { NotificationData } from "@/lib/socket";

interface ToastNotificationProps {
  notification: NotificationData & {
    id: string;
    autoClose?: boolean;
    duration?: number;
  };
  onClose: () => void;
}

export function ToastNotification({
  notification,
  onClose,
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  const getIcon = () => {
    switch (notification.type) {
      case "order":
        return <Bell className="h-4 w-4" />;
      case "kitchen":
        return <ChefHat className="h-4 w-4" />;
      case "inventory":
        return <Package className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case "urgent":
        return "border-red-500 bg-red-50";
      case "high":
        return "border-orange-500 bg-orange-50";
      case "medium":
        return "border-blue-500 bg-blue-50";
      default:
        return "border-gray-300 bg-white";
    }
  };

  useEffect(() => {
    setIsVisible(true);

    if (
      notification.autoClose &&
      notification.duration &&
      notification.duration > 0
    ) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - 100 / (notification.duration! / 100);
          if (newProgress <= 0) {
            clearInterval(interval);
            handleClose();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [notification.autoClose, notification.duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  return (
    <Card
      className={`${getPriorityColor()} border transition-all duration-300 transform ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      } max-w-sm shadow-lg`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getIcon()}
            <Badge
              variant={
                notification.priority === "urgent" ? "destructive" : "secondary"
              }
              className="text-xs"
            >
              {notification.priority.toUpperCase()}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <h4 className="font-medium text-sm mb-1">{notification.title}</h4>
        <p className="text-xs text-muted-foreground mb-2">
          {notification.message}
        </p>

        {notification.data?.orderId && (
          <div className="flex space-x-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs h-7"
              onClick={() => {
                window.location.href = `/dashboard/orders/${notification.data.orderId}`;
              }}
            >
              View Order
            </Button>
          </div>
        )}

        {/* Progress bar for auto-close */}
        {notification.autoClose &&
          notification.duration &&
          notification.duration > 0 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-primary h-1 rounded-full transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
