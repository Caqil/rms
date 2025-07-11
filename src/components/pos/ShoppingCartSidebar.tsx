"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Users,
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { formatCurrency } from "@/lib/utils";

interface ShoppingCartSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: () => void;
}

export default function ShoppingCartSidebar({
  open,
  onOpenChange,
  onCheckout,
}: ShoppingCartSidebarProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");

  const {
    currentOrder,
    updateItemQuantity,
    removeItem,
    setOrderType,
    setCustomerInfo,
    calculateTotals,
    clearOrder,
    addDiscount,
    setTips,
  } = useOrders();

  const handleQuantityChange = (menuItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(menuItemId);
    } else {
      updateItemQuantity(menuItemId, newQuantity);
    }
  };

  const handleCustomerInfoChange = () => {
    setCustomerInfo({
      name: customerName,
      phone: customerPhone,
      email: customerEmail,
    });
  };

  const handleOrderTypeChange = (type: "dine_in" | "takeout" | "delivery") => {
    setOrderType(type);
  };

  const handleCheckout = () => {
    handleCustomerInfoChange();
    calculateTotals(0.08); // 8% tax rate - should come from restaurant settings
    onCheckout();
  };

  const isEmpty = currentOrder.items.length === 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Shopping Cart</span>
            {!isEmpty && (
              <Badge variant="secondary">
                {currentOrder.items.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                )}{" "}
                items
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full pt-6">
          {isEmpty ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
                <p className="text-sm text-gray-400">
                  Add items from the menu to get started
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Order Type Selection */}
              <div className="space-y-2 mb-4">
                <Label>Order Type</Label>
                <Select
                  value={currentOrder.orderType}
                  onValueChange={handleOrderTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dine_in">Dine In</SelectItem>
                    <SelectItem value="takeout">Takeout</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Customer Information */}
              <div className="space-y-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <Label>Customer Information</Label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="customerName" className="text-xs">
                      Name
                    </Label>
                    <Input
                      id="customerName"
                      placeholder="Customer name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone" className="text-xs">
                      Phone
                    </Label>
                    <Input
                      id="customerPhone"
                      placeholder="Phone number"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="customerEmail" className="text-xs">
                    Email (Optional)
                  </Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="Email address"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
              </div>

              <Separator className="my-4" />

              {/* Cart Items */}
              <ScrollArea className="flex-1">
                <div className="space-y-4">
                  {currentOrder.items.map((item) => (
                    <div
                      key={item.menuItemId}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(item.price)} each
                        </p>
                        {item.specialInstructions && (
                          <p className="text-xs text-gray-500 mt-1">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(
                              item.menuItemId,
                              item.quantity - 1
                            )
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(
                              item.menuItemId,
                              item.quantity + 1
                            )
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.menuItemId)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="font-medium text-sm">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Separator className="my-4" />

              {/* Order Notes */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="notes">Special Instructions</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Order Summary */}
              <div className="space-y-2 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(currentOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>{formatCurrency(currentOrder.taxes)}</span>
                </div>
                {currentOrder.discounts.length > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discounts:</span>
                    <span>
                      -
                      {formatCurrency(
                        currentOrder.discounts.reduce(
                          (sum, d) => sum + d.amount,
                          0
                        )
                      )}
                    </span>
                  </div>
                )}
                {currentOrder.tips > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tips:</span>
                    <span>{formatCurrency(currentOrder.tips)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(currentOrder.total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button onClick={handleCheckout} className="w-full" size="lg">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Payment
                </Button>
                <Button
                  variant="outline"
                  onClick={clearOrder}
                  className="w-full"
                >
                  Clear Cart
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
