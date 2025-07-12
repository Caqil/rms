"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Check,
  X,
  Clock,
  AlertTriangle,
  Package,
  ChefHat,
  ShoppingCart,
  Settings,
} from "lucide-react";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import { formatDistanceToNow } from "date-fns";

export default function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    soundEnabled,
    toggleSound,
    markAsRead,
    isConnected,
    getNotificationColor,
  } = useRealTimeNotifications();

  const [open, setOpen] = useState(false);

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `h-4 w-4 ${
      priority === "urgent"
        ? "text-red-600"
        : priority === "high"
        ? "text-orange-600"
        : priority === "medium"
        ? "text-blue-600"
        : "text-gray-600"
    }`;

    switch (type) {
      case "order":
        return <ShoppingCart className={iconClass} />;
      case "kitchen":
        return <ChefHat className={iconClass} />;
      case "inventory":
        return <Package className={iconClass} />;
      case "system":
        return <Settings className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {isConnected ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-400" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs font-medium flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-h-96" sideOffset={4}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DropdownMenuLabel className="text-base font-semibold p-0">
                Notifications
              </DropdownMenuLabel>
              <p className="text-sm text-gray-500 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {/* Connection Status */}
              <div className="flex items-center space-x-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-xs text-gray-500">
                  {isConnected ? "Live" : "Offline"}
                </span>
              </div>

              {/* Sound Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSound}
                className="h-6 w-6 p-0"
                title={soundEnabled ? "Disable sounds" : "Enable sounds"}
              >
                {soundEnabled ? (
                  <Volume2 className="h-3 w-3" />
                ) : (
                  <VolumeX className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification._id}
                  className={`w-full p-3 mb-2 rounded-lg border cursor-pointer hover:bg-gray-50 focus:bg-gray-50 ${getNotificationColor(
                    notification.priority
                  )} ${!notification.isRead ? "font-medium" : "opacity-75"}`}
                  onClick={() => handleNotificationClick(notification._id)}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(
                        notification.type,
                        notification.priority
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {notification.message}
                          </p>
                        </div>

                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2 ml-2" />
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            { addSuffix: true }
                          )}
                        </span>

                        <Badge
                          variant={
                            notification.priority === "urgent"
                              ? "destructive"
                              : notification.priority === "high"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {notification.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-center"
                onClick={() => {
                  setOpen(false);
                  // Navigate to full notifications page
                  // router.push('/dashboard/notifications');
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
