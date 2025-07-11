"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Search, MapPin, Loader2 } from "lucide-react";
import { useMenu } from "@/hooks/useMenu";
import { useOrders } from "@/hooks/useOrders";
import { useTables } from "@/hooks/useTables";
import MenuItemCard from "@/components/pos/MenuItemCard";
import ShoppingCartSidebar from "@/components/pos/ShoppingCartSidebar";
import TableSelection from "@/components/pos/TableSelection";
import PaymentModal from "@/components/pos/PaymentModal";

export default function POSPage() {
  const { data: session } = useSession();
  const [showCart, setShowCart] = useState(false);
  const [showTableSelection, setShowTableSelection] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Custom hooks for data management
  const {
    items,
    categories,
    selectedCategory,
    searchQuery,
    isLoading: menuLoading,
    filteredItems,
    setSelectedCategory,
    setSearchQuery,
  } = useMenu();

  const { currentOrder, addItem, processOrder, creatingOrder } = useOrders();


  const itemCount = currentOrder.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const handleAddToCart = (menuItem: any) => {
    addItem({
      menuItemId: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: 1,
    });
  };

  const handleCheckout = () => {
    if (currentOrder.items.length === 0) return;

    if (currentOrder.orderType === "dine_in" && !currentOrder.tableNumber) {
      setShowTableSelection(true);
    } else {
      setShowPayment(true);
    }
  };

  const handlePaymentComplete = async (paymentData: any) => {
    const result = await processOrder(paymentData);
    if (result) {
      setShowPayment(false);
    }
  };

  if (menuLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading menu...</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Point of Sale
              </h1>
              <p className="text-gray-600">
                Process orders and manage transactions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowTableSelection(true)}
                className="flex items-center space-x-2"
              >
                <MapPin className="h-4 w-4" />
                <span>
                  {currentOrder.tableNumber
                    ? `Table ${currentOrder.tableNumber}`
                    : "Select Table"}
                </span>
              </Button>
              <Button
                onClick={() => setShowCart(true)}
                className="relative flex items-center space-x-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Cart</span>
                {itemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-4">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex space-x-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  onClick={() => setSelectedCategory(null)}
                  size="sm"
                >
                  All Items
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    onClick={() => setSelectedCategory(category)}
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item._id}
                item={item}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchQuery || selectedCategory
                  ? "No items found matching your criteria"
                  : "No menu items available"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <ShoppingCartSidebar
        open={showCart}
        onOpenChange={setShowCart}
        onCheckout={handleCheckout}
      />

      {/* Table Selection Modal */}
      <TableSelection
        open={showTableSelection}
        onOpenChange={setShowTableSelection}
        onTableSelect={(tableNumber) => {
          setShowTableSelection(false);
          setShowPayment(true);
        }}
      />

      {/* Payment Modal */}
      <PaymentModal
        open={showPayment}
        onOpenChange={setShowPayment}
        onPaymentComplete={handlePaymentComplete}
        loading={creatingOrder}
      />
    </div>
  );
}
