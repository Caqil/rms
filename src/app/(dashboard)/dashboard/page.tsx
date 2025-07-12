// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  MoreHorizontal,
  ArrowUpRight,
  Activity,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { stats, isLoading, refetch } = useDashboard();

  // Provide default values to prevent undefined errors
  const defaultStats = {
    todayRevenue: 0,
    revenueGrowth: 0,
    todayOrders: 0,
    orderGrowth: 0,
    activeCustomers: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    monthlyGrowth: 0,
    pendingOrders: 0,
    completedOrders: 0,
    lowStockItems: 0,
    chartData: [],
    recentOrders: [],
    topItems: [],
    ...stats, // Spread actual stats to override defaults
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "preparing":
        return "bg-blue-500";
      case "ready":
        return "bg-orange-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadge = (
    status: string
  ): "secondary" | "destructive" | "outline" | "default" | null | undefined => {
    const variants: Record<
      string,
      "secondary" | "destructive" | "outline" | "default"
    > = {
      completed: "default",
      preparing: "secondary",
      ready: "destructive",
      pending: "outline",
    };
    return variants[status] || "outline";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                <div className="h-3 w-24 bg-muted animate-pulse rounded mt-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name}! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            View Reports
          </Button>
          <Button>
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(defaultStats.todayRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {defaultStats.revenueGrowth >= 0 ? (
                <span className="text-green-600 inline-flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />+
                  {defaultStats.revenueGrowth}%
                </span>
              ) : (
                <span className="text-red-600 inline-flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {defaultStats.revenueGrowth}%
                </span>
              )}{" "}
              from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{defaultStats.todayOrders}</div>
            <p className="text-xs text-muted-foreground">
              {defaultStats.orderGrowth >= 0 ? (
                <span className="text-green-600 inline-flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />+
                  {defaultStats.orderGrowth}%
                </span>
              ) : (
                <span className="text-red-600 inline-flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {defaultStats.orderGrowth}%
                </span>
              )}{" "}
              from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {defaultStats.activeCustomers}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600 inline-flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                {defaultStats.totalCustomers} total
              </span>{" "}
              registered customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Order Value
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(defaultStats.avgOrderValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 inline-flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />+
                {defaultStats.monthlyGrowth}%
              </span>{" "}
              this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Weekly Overview</CardTitle>
            <CardDescription>
              Daily performance for the past 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="revenue" className="space-y-4">
              <TabsList>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
              </TabsList>
              <TabsContent value="revenue" className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={defaultStats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(Number(value)),
                        "Revenue",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="orders" className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={defaultStats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="customers" className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={defaultStats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="customers"
                      stroke="hsl(var(--secondary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Current status overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Pending Orders</p>
                  <p className="text-sm text-muted-foreground">
                    Need attention
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {defaultStats.pendingOrders}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Completed Today</p>
                  <p className="text-sm text-muted-foreground">
                    Orders fulfilled
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {defaultStats.completedOrders}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">Stock Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Items running low
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {defaultStats.lowStockItems}
              </div>
            </div>

            <div className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Today's Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Math.min(
                    100,
                    Math.round(
                      (defaultStats.todayOrders /
                        Math.max(
                          1,
                          defaultStats.todayOrders + defaultStats.pendingOrders
                        )) *
                        100
                    )
                  )}
                  %
                </span>
              </div>
              <Progress
                value={Math.min(
                  100,
                  Math.round(
                    (defaultStats.todayOrders /
                      Math.max(
                        1,
                        defaultStats.todayOrders + defaultStats.pendingOrders
                      )) *
                      100
                  )
                )}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders today</CardDescription>
          </CardHeader>
          <CardContent>
            {defaultStats.recentOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {defaultStats.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {order.customer.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{order.customer}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(order.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No orders today yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Items */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
            <CardDescription>Best performing menu items today</CardDescription>
          </CardHeader>
          <CardContent>
            {defaultStats.topItems.length > 0 ? (
              <div className="space-y-4">
                {defaultStats.topItems.map((item, index) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-medium text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.sales} sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(item.revenue)}
                      </p>
                      <p className="text-sm text-muted-foreground">revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No sales data today yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
