"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
} from "lucide-react";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";

export function ConnectionStatus() {
  const {
    isConnected,
    connectionStatus,
    soundEnabled,
    toggleSound,
    getDebugInfo,
    disconnect,
    unreadCount,
  } = useRealTimeNotifications();

  const [showDebugInfo, setShowDebugInfo] = useState(false);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="h-4 w-4 text-green-500" />;
      case "connecting":
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case "error":
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "error":
        return "Connection Error";
      default:
        return "Disconnected";
    }
  };

  const debugInfo = getDebugInfo();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative flex items-center space-x-2 px-3"
        >
          {getStatusIcon()}
          <span className="hidden sm:inline text-xs font-medium">
            {getStatusText()}
          </span>

          {/* Connection status indicator */}
          <div
            className={`w-2 h-2 rounded-full ${getStatusColor()}`}
            title={getStatusText()}
          />

          {/* Unread notifications badge */}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span>Real-time Connection</span>
              </div>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {getStatusText()}
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Connection Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <div className="flex items-center space-x-2">
                  {isConnected ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span className="font-medium">{getStatusText()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Notifications:</span>
                <Badge variant="outline">{unreadCount} unread</Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sound:</span>
                <div className="flex items-center space-x-2">
                  {soundEnabled ? (
                    <Volume2 className="h-3 w-3 text-blue-500" />
                  ) : (
                    <VolumeX className="h-3 w-3 text-gray-400" />
                  )}
                  <Switch
                    checked={soundEnabled}
                    onCheckedChange={toggleSound}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => window.location.reload()}
                disabled={connectionStatus === "connecting"}
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Reconnect
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => setShowDebugInfo(!showDebugInfo)}
              >
                <Activity className="h-3 w-3 mr-2" />
                {showDebugInfo ? "Hide" : "Show"} Debug Info
              </Button>
            </div>

            {/* Debug Information */}
            {showDebugInfo && (
              <div className="space-y-2 pt-2 border-t">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Debug Information
                </h4>
                <div className="text-xs space-y-1 font-mono bg-muted p-2 rounded">
                  <div>
                    Socket Connected: {debugInfo.isConnected ? "✅" : "❌"}
                  </div>
                  <div>
                    Socket ID: {debugInfo.socketDebug?.socketId || "None"}
                  </div>
                  <div>Restaurant ID: {debugInfo.restaurantId || "None"}</div>
                  <div>User Role: {debugInfo.userRole || "None"}</div>
                  <div>
                    Reconnect Attempts:{" "}
                    {debugInfo.socketDebug?.reconnectAttempts || 0}
                  </div>
                  <div>Toast Count: {debugInfo.toastCount}</div>
                  <div>
                    Session Exists: {debugInfo.sessionExists ? "✅" : "❌"}
                  </div>
                  <div>
                    Initialized: {debugInfo.initializationRef ? "✅" : "❌"}
                  </div>
                </div>

                {!isConnected && (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span className="font-medium">
                        Connection Issue Detected
                      </span>
                    </div>
                    <div className="mt-1">
                      The real-time connection is not active. You may experience
                      delays in receiving updates.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Performance Indicator */}
            <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
              <span>Real-time Updates:</span>
              <div className="flex items-center space-x-1">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    isConnected ? "bg-green-500 animate-pulse" : "bg-gray-400"
                  }`}
                />
                <span>{isConnected ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

