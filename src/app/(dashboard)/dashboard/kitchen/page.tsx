"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  ChefHat,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Timer,
  Flame,
  Users,
} from "lucide-react";
import { formatTime } from "@/lib/utils";
import { useKitchenOrders } from "@/hooks/useKitchenOrders";

interface KitchenOrder {
  _id: string;
  orderNumber: string;
  tableNumber?: string;
  customerName?: string;
  items: Array<{
    _id: string;
    name: string;
    quantity: number;
    specialInstructions?: string;
    preparationTime: number;
    category: string;
    allergens: string[];
  }>;
  status: "pending" | "confirmed" | "preparing" | "ready" | "served";
  orderType: "dine_in" | "takeout" | "delivery";
  priority: "low" | "normal" | "high" | "urgent";
  estimatedTime: number;
  actualStartTime?: Date;
  targetCompletionTime?: Date;
  timestamps: {
    ordered: Date;
    confirmed?: Date;
    preparing?: Date;
    ready?: Date;
  };
  isRushing?: boolean;
}

export default function KitchenDisplayPage() {
  const { data: session } = useSession();
  const [selectedStation, setSelectedStation] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const {
    orders,
    pendingOrders,
    preparingOrders,
    readyOrders,
    updateOrderStatus,
    updateOrderPriority,
    startPreparation,
    markReady,
    isLoading,
    refetch,
  } = useKitchenOrders();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-refresh orders
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetch();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refetch]);

  const stations = [
    { id: "all", name: "All Stations", icon: ChefHat },
    { id: "grill", name: "Grill", icon: Flame },
    { id: "prep", name: "Prep", icon: ChefHat },
    { id: "salad", name: "Salad", icon: ChefHat },
    { id: "dessert", name: "Desserts", icon: ChefHat },
  ];

  const getOrderDelay = (order: KitchenOrder): number => {
    if (!order.targetCompletionTime) return 0;
    return Math.max(
      0,
      (currentTime.getTime() - new Date(order.targetCompletionTime).getTime()) /
        60000
    );
  };

  const getOrderProgress = (order: KitchenOrder): number => {
    if (order.status === "pending") return 0;
    if (order.status === "ready") return 100;

    if (!order.actualStartTime || !order.targetCompletionTime) return 0;

    const totalTime =
      new Date(order.targetCompletionTime).getTime() -
      new Date(order.actualStartTime).getTime();
    const elapsedTime =
      currentTime.getTime() - new Date(order.actualStartTime).getTime();

    return Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-600";
      case "high":
        return "bg-orange-500";
      case "normal":
        return "bg-blue-500";
      case "low":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "border-yellow-500 bg-yellow-50";
      case "preparing":
        return "border-blue-500 bg-blue-50";
      case "ready":
        return "border-green-500 bg-green-50";
      default:
        return "border-gray-300 bg-white";
    }
  };

  const KitchenOrderCard = ({ order }: { order: KitchenOrder }) => {
    const delay = getOrderDelay(order);
    const progress = getOrderProgress(order);
    const isDelayed = delay > 5; // More than 5 minutes late

    return (
      <Card
        className={`${getStatusColor(order.status)} ${
          isDelayed ? "ring-2 ring-red-500" : ""
        } transition-all duration-200`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge
                className={`${getPriorityColor(order.priority)} text-white`}
              >
                {order.priority.toUpperCase()}
              </Badge>
              <h3 className="font-bold text-lg">{order.orderNumber}</h3>
              {order.tableNumber && (
                <Badge variant="outline">Table {order.tableNumber}</Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {isDelayed && <AlertCircle className="h-5 w-5 text-red-500" />}
              <div className="text-right text-sm">
                <div className="font-medium">{order.estimatedTime} min</div>
                <div className="text-gray-500">
                  {formatTime(order.timestamps.ordered)}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {order.status === "preparing" && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress
                value={progress}
                className={`h-2 ${isDelayed ? "bg-red-100" : "bg-blue-100"}`}
              />
            </div>
          )}

          {isDelayed && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Delayed by {Math.round(delay)} minutes
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Order Items */}
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {item.quantity}x
                    </Badge>
                    <span className="font-medium">{item.name}</span>
                  </div>

                  {item.specialInstructions && (
                    <p className="text-sm text-orange-600 mt-1 font-medium">
                      ⚠️ {item.specialInstructions}
                    </p>
                  )}

                  {item.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.allergens.map((allergen) => (
                        <Badge
                          key={allergen}
                          variant="destructive"
                          className="text-xs"
                        >
                          {allergen}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-right text-sm text-gray-500">
                  <div>{item.preparationTime} min</div>
                  <div className="text-xs">{item.category}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Customer Info */}
          {order.customerName && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{order.customerName}</span>
              <Badge variant="outline" className="capitalize">
                {order.orderType.replace("_", " ")}
              </Badge>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {order.status === "pending" && (
              <Button
                onClick={() => startPreparation(order._id)}
                className="flex-1"
                size="sm"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Cooking
              </Button>
            )}

            {order.status === "preparing" && (
              <>
                <Button
                  onClick={() => markReady(order._id)}
                  className="flex-1"
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Ready
                </Button>
                <Button
                  variant="outline"
                  onClick={() => updateOrderPriority(order._id, "urgent")}
                  size="sm"
                  disabled={order.priority === "urgent"}
                >
                  <FastForward className="h-4 w-4" />
                </Button>
              </>
            )}

            {order.status === "ready" && (
              <Button
                variant="outline"
                onClick={() => updateOrderStatus(order._id, "preparing")}
                className="flex-1"
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Back to Kitchen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Kitchen Display
            </h1>
            <p className="text-gray-600">
              {pendingOrders.length} pending • {preparingOrders.length} cooking
              • {readyOrders.length} ready
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-mono">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "bg-green-50 border-green-200" : ""}
            >
              {autoRefresh ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Auto Refresh
            </Button>

            <Button onClick={refetch} disabled={isLoading} size="sm">
              <RotateCcw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Station Filter */}
        <div className="mt-4 flex space-x-2">
          {stations.map((station) => (
            <Button
              key={station.id}
              variant={selectedStation === station.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStation(station.id)}
              className="flex items-center space-x-2"
            >
              <station.icon className="h-4 w-4" />
              <span>{station.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Kitchen Display Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="active" className="h-full flex flex-col">
          <div className="bg-white border-b px-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="relative">
                Pending Orders
                {pendingOrders.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {pendingOrders.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="active" className="relative">
                Cooking
                {preparingOrders.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {preparingOrders.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="ready" className="relative">
                Ready
                {readyOrders.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {readyOrders.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="pending" className="h-full m-0">
              <ScrollArea className="h-full p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pendingOrders.map((order) => (
                    <KitchenOrderCard key={order._id} order={order} />
                  ))}
                </div>
                {pendingOrders.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No pending orders</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="active" className="h-full m-0">
              <ScrollArea className="h-full p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {preparingOrders.map((order) => (
                    <KitchenOrderCard key={order._id} order={order} />
                  ))}
                </div>
                {preparingOrders.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <Flame className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No orders cooking</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="ready" className="h-full m-0">
              <ScrollArea className="h-full p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {readyOrders.map((order) => (
                    <KitchenOrderCard key={order._id} order={order} />
                  ))}
                </div>
                {readyOrders.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No orders ready</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
