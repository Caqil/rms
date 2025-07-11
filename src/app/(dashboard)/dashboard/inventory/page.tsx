"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  TrendingDown,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useInventory } from "@/hooks/useInventory";
import { formatCurrency, formatDate } from "@/lib/utils";
import InventoryForm from "@/components/forms/InventoryForm";
import ReorderAlerts from "@/components/inventory/ReorderAlerts";

export default function InventoryPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAdjustment, setShowAdjustment] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);

  const {
    items,
    categories,
    selectedCategory,
    searchQuery,
    isLoading,
    filteredItems,
    lowStockItems,
    expiringItems,
    totalValue,
    setSelectedCategory,
    setSearchQuery,
    refetchInventory,
    createItem,
    updateItem,
    deleteItem,
    adjustStock,
    creating,
    updating,
  } = useInventory();

  // Calculate statistics
  const stats = {
    totalItems: items.length,
    lowStockCount: lowStockItems.length,
    expiringCount: expiringItems.length,
    totalValue: totalValue,
    categories: categories.length,
  };

  const handleCreateItem = async (data: any) => {
    const result = await createItem(data);
    if (result) {
      setShowCreateDialog(false);
    }
  };

  const handleUpdateItem = async (data: any) => {
    if (!editingItem) return;

    const result = await updateItem(editingItem._id, data);
    if (result) {
      setEditingItem(null);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm("Are you sure you want to delete this inventory item?")) {
      await deleteItem(itemId);
    }
  };

  const getStockLevel = (item: any): "low" | "medium" | "high" => {
    const percentage = (item.quantity / item.maxStock) * 100;
    if (percentage <= 20) return "low";
    if (percentage <= 50) return "medium";
    return "high";
  };

  const getStockColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getDaysUntilExpiry = (expirationDate: string): number => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-gray-600">
            Track stock levels, costs, and supplier information
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={refetchInventory}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Inventory Item</DialogTitle>
              </DialogHeader>
              <InventoryForm
                onSubmit={handleCreateItem}
                isLoading={creating}
                mode="create"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
              </div>
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.lowStockCount}
                </p>
              </div>
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.expiringCount}
                </p>
              </div>
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold">{stats.categories}</p>
              </div>
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <ReorderAlerts items={lowStockItems} expiringItems={expiringItems} />

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search inventory items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All Categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory Items */}
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const stockLevel = getStockLevel(item);
              const stockPercentage = Math.min(
                100,
                (item.quantity / item.maxStock) * 100
              );
              const daysUntilExpiry = item.expirationDate
                ? getDaysUntilExpiry(
                    typeof item.expirationDate === "string"
                      ? item.expirationDate
                      : item.expirationDate.toISOString()
                  )
                : null;

              return (
                <Card
                  key={item._id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg line-clamp-1">
                            {item.itemName}
                          </h3>
                          <Badge variant="outline" className="mt-1">
                            {item.category}
                          </Badge>
                        </div>
                        <Badge className={getStockColor(stockLevel)}>
                          {stockLevel.toUpperCase()}
                        </Badge>
                      </div>

                      {/* Stock Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Stock Level</span>
                          <span>
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                        <Progress
                          value={stockPercentage}
                          className={`h-2 ${
                            stockLevel === "low"
                              ? "bg-red-100"
                              : stockLevel === "medium"
                              ? "bg-yellow-100"
                              : "bg-green-100"
                          }`}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Reorder: {item.reorderLevel}</span>
                          <span>Max: {item.maxStock}</span>
                        </div>
                      </div>

                      {/* Cost Info */}
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Unit Cost:</span>
                          <span className="font-medium">
                            {formatCurrency(item.cost)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Value:</span>
                          <span className="font-medium">
                            {formatCurrency(item.cost * item.quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Expiration Warning */}
                      {daysUntilExpiry !== null && daysUntilExpiry <= 7 && (
                        <Alert
                          className={`${
                            daysUntilExpiry <= 2
                              ? "border-red-200 bg-red-50"
                              : "border-orange-200 bg-orange-50"
                          }`}
                        >
                          <AlertTriangle
                            className={`h-4 w-4 ${
                              daysUntilExpiry <= 2
                                ? "text-red-600"
                                : "text-orange-600"
                            }`}
                          />
                          <AlertDescription
                            className={
                              daysUntilExpiry <= 2
                                ? "text-red-800"
                                : "text-orange-800"
                            }
                          >
                            {daysUntilExpiry <= 0
                              ? "Expired!"
                              : daysUntilExpiry === 1
                              ? "Expires tomorrow"
                              : `Expires in ${daysUntilExpiry} days`}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Supplier Info */}
                      <div className="text-xs text-gray-500">
                        <p>Supplier: {item.supplierInfo.name}</p>
                        <p>Contact: {item.supplierInfo.contact}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAdjustment(item)}
                          className="flex-1"
                        >
                          Adjust Stock
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingItem(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteItem(item._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.map((item) => {
                      const stockLevel = getStockLevel(item);
                      const daysUntilExpiry = item.expirationDate
                        ? getDaysUntilExpiry(
                            typeof item.expirationDate === "string"
                              ? item.expirationDate
                              : item.expirationDate.toISOString()
                          )
                        : null;

                      return (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.itemName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.supplierInfo.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline">{item.category}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.quantity} {item.unit}
                            </div>
                            <div className="text-xs text-gray-500">
                              Reorder at {item.reorderLevel}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.cost)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.cost * item.quantity)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <Badge className={getStockColor(stockLevel)}>
                                {stockLevel.toUpperCase()}
                              </Badge>
                              {daysUntilExpiry !== null &&
                                daysUntilExpiry <= 7 && (
                                  <Badge
                                    variant={
                                      daysUntilExpiry <= 2
                                        ? "destructive"
                                        : "secondary"
                                    }
                                    className="block text-xs"
                                  >
                                    {daysUntilExpiry <= 0
                                      ? "Expired"
                                      : daysUntilExpiry === 1
                                      ? "Expires tomorrow"
                                      : `${daysUntilExpiry}d left`}
                                  </Badge>
                                )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAdjustment(item)}
                                title="Adjust stock"
                              >
                                <Package className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingItem(item)}
                                title="Edit item"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteItem(item._id)}
                                className="text-red-600 hover:text-red-700"
                                title="Delete item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <InventoryForm
              onSubmit={handleUpdateItem}
              isLoading={updating}
              initialData={editingItem}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Modal */}
      {showAdjustment && (
        <StockAdjustmentModal
          item={showAdjustment}
          open={!!showAdjustment}
          onOpenChange={() => setShowAdjustment(null)}
          onAdjust={async (adjustment) => {
            await adjustStock(showAdjustment._id, adjustment);
            setShowAdjustment(null);
          }}
        />
      )}
    </div>
  );
}
