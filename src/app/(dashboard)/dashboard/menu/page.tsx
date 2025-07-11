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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Upload,
  Download,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useMenu } from "@/hooks/useMenu";
import { useApiMutation } from "@/hooks/useApi";
import { formatCurrency } from "@/lib/utils";
import MenuItemForm from "@/components/forms/MenuItemForm";
import { CreateMenuItemInput } from "@/lib/validations";
import { MenuItem } from "@/stores/menuStore";

export default function MenuManagementPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const {
    items,
    categories,
    selectedCategory,
    searchQuery,
    isLoading,
    filteredItems,
    setSelectedCategory,
    setSearchQuery,
    refetchMenu,
  } = useMenu();

  const { mutate: createMenuItem, loading: creating } = useApiMutation<
    CreateMenuItemInput,
    any
  >("/api/menu", "POST");

  const { mutate: updateMenuItem, loading: updating } = useApiMutation<
    any,
    any
  >("/api/menu", "PATCH");

  const { mutate: deleteMenuItem } = useApiMutation("/api/menu", "DELETE");

  const handleCreateItem = async (data: CreateMenuItemInput) => {
    const result = await createMenuItem(data);
    if (result) {
      setShowCreateDialog(false);
      refetchMenu();
    }
  };

  const handleUpdateItem = async (data: Partial<CreateMenuItemInput>) => {
    if (!editingItem) return;

    const result = await updateMenuItem({
      itemId: editingItem._id,
      ...data,
    });
    if (result) {
      setEditingItem(null);
      refetchMenu();
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      await deleteMenuItem({ itemId });
      refetchMenu();
    }
  };

  const toggleItemAvailability = async (item: MenuItem) => {
    const result = await updateMenuItem({
      itemId: item._id,
      availability: !item.availability,
    });
    if (result) {
      refetchMenu();
    }
  };

  // Calculate profit margin for display
  const calculateProfitMargin = (item: MenuItem): number => {
    if (item.price <= 0) return 0;
    return ((item.price - item.cost) / item.price) * 100;
  };

  // Get profit margin color
  const getProfitMarginColor = (margin: number): string => {
    if (margin >= 60) return "text-green-600";
    if (margin >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  // Statistics
  const stats = {
    totalItems: items.length,
    availableItems: items.filter((item) => item.availability).length,
    avgPrice:
      items.length > 0
        ? items.reduce((sum, item) => sum + item.price, 0) / items.length
        : 0,
    avgCost:
      items.length > 0
        ? items.reduce((sum, item) => sum + item.cost, 0) / items.length
        : 0,
  };

  const avgProfitMargin =
    stats.avgPrice > 0
      ? ((stats.avgPrice - stats.avgCost) / stats.avgPrice) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-gray-600">
            Manage your restaurant's menu items and categories
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
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
                <DialogTitle>Add New Menu Item</DialogTitle>
              </DialogHeader>
              <MenuItemForm
                onSubmit={handleCreateItem}
                isLoading={creating}
                mode="create"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
              </div>
              <div className="text-blue-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold">{stats.availableItems}</p>
              </div>
              <div className="text-green-600">
                <Eye className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Price</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.avgPrice)}
                </p>
              </div>
              <div className="text-purple-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Margin</p>
                <p
                  className={`text-2xl font-bold ${getProfitMarginColor(
                    avgProfitMargin
                  )}`}
                >
                  {avgProfitMargin.toFixed(1)}%
                </p>
              </div>
              <div
                className={
                  avgProfitMargin >= 50 ? "text-green-600" : "text-red-600"
                }
              >
                {avgProfitMargin >= 50 ? (
                  <TrendingUp className="h-6 w-6" />
                ) : (
                  <TrendingDown className="h-6 w-6" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search menu items..."
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
                All Categories ({items.length})
              </Button>
              {categories.map((category) => {
                const count = items.filter(
                  (item) => item.category === category
                ).length;
                return (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category} ({count})
                  </Button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Menu Items */}
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Card
                key={item._id}
                className={`hover:shadow-lg transition-shadow ${
                  !item.availability ? "opacity-60" : ""
                }`}
              >
                <CardContent className="p-0">
                  {/* Image */}
                  <div className="relative h-48 bg-gray-100">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
                        <span className="text-gray-400 text-4xl">🍽️</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={item.availability ? "default" : "secondary"}
                      >
                        {item.availability ? "Available" : "Unavailable"}
                      </Badge>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-white/90 text-gray-900">
                        {formatCurrency(item.price)}
                      </Badge>
                    </div>

                    {/* Profit Margin Badge */}
                    <div className="absolute bottom-2 right-2">
                      <Badge
                        variant="outline"
                        className={`bg-white/90 ${getProfitMarginColor(
                          calculateProfitMargin(item)
                        )}`}
                      >
                        {calculateProfitMargin(item).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <Badge variant="outline">{item.category}</Badge>
                        <span>{item.preparationTime} min</span>
                      </div>

                      <div className="text-xs text-gray-500">
                        <div>Cost: {formatCurrency(item.cost)}</div>
                        <div>
                          Margin: {calculateProfitMargin(item).toFixed(1)}%
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleItemAvailability(item)}
                          className="flex-1"
                          disabled={updating}
                        >
                          {item.availability ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingItem(item)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteItem(item._id)}
                          className="flex-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Margin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prep Time
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
                      const margin = calculateProfitMargin(item);
                      return (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center mr-4">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-cover rounded-md"
                                  />
                                ) : (
                                  <span className="text-gray-400">🍽️</span>
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.name}
                                </div>
                                <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                                  {item.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline">{item.category}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.cost)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`text-sm font-medium ${getProfitMarginColor(
                                margin
                              )}`}
                            >
                              {margin.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.preparationTime} min
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge
                              variant={
                                item.availability ? "default" : "secondary"
                              }
                            >
                              {item.availability ? "Available" : "Unavailable"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleItemAvailability(item)}
                                disabled={updating}
                                title={
                                  item.availability
                                    ? "Make unavailable"
                                    : "Make available"
                                }
                              >
                                {item.availability ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
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
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <MenuItemForm
              onSubmit={handleUpdateItem}
              isLoading={updating}
              initialData={editingItem}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {filteredItems.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">
              <div className="text-4xl mb-4">🍽️</div>
              <h3 className="text-lg font-medium mb-2">No menu items found</h3>
              <p className="mb-4">
                {searchQuery || selectedCategory
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first menu item"}
              </p>
              {!searchQuery && !selectedCategory && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
