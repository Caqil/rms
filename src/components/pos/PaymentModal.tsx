"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  DollarSign,
  Percent,
  Receipt,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { formatCurrency } from "@/lib/utils";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentComplete: (paymentData: any) => Promise<void>;
  loading?: boolean;
}

export default function PaymentModal({
  open,
  onOpenChange,
  onPaymentComplete,
  loading = false,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [tipType, setTipType] = useState<"amount" | "percentage">("percentage");
  const [tipPercentage, setTipPercentage] = useState<number>(15);
  const [discountAmount, setDiscountAmount] = useState<string>("");
  const [discountReason, setDiscountReason] = useState<string>("");
  const [splitCount, setSplitCount] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { currentOrder, setTips, addDiscount, calculateTotals } = useOrders();

  // Calculate tip based on type
  const calculateTip = () => {
    if (tipType === "percentage") {
      return (currentOrder.subtotal * tipPercentage) / 100;
    }
    return tipAmount;
  };

  // Calculate change for cash payments
  const calculateChange = () => {
    const received = parseFloat(cashReceived) || 0;
    const total = currentOrder.total + calculateTip();
    return Math.max(0, received - total);
  };

  // Validate payment
  const validatePayment = () => {
    const newErrors: Record<string, string> = {};

    if (paymentMethod === "cash") {
      const received = parseFloat(cashReceived) || 0;
      const total = currentOrder.total + calculateTip();

      if (received < total) {
        newErrors.cashReceived = "Insufficient cash received";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validatePayment()) return;

    const finalTip = calculateTip();
    setTips(finalTip);

    if (discountAmount && parseFloat(discountAmount) > 0) {
      addDiscount({
        type: "manual",
        amount: parseFloat(discountAmount),
        description: discountReason || "Manual discount",
      });
    }

    calculateTotals(0.08); // Recalculate with tips and discounts

    const paymentData = {
      method: paymentMethod,
      amount: currentOrder.total + finalTip,
      status: "completed",
      ...(paymentMethod === "cash" && {
        cashReceived: parseFloat(cashReceived),
        change: calculateChange(),
      }),
    };

    await onPaymentComplete(paymentData);
  };

  const quickTipButtons = [0, 10, 15, 18, 20];
  const finalTotal = currentOrder.total + calculateTip();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Process Payment</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(currentOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(currentOrder.taxes)}</span>
              </div>
              {currentOrder.discounts.length > 0 && (
                <div className="flex justify-between text-green-600">
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
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Order Total:</span>
                <span>{formatCurrency(currentOrder.total)}</span>
              </div>
              {calculateTip() > 0 && (
                <>
                  <div className="flex justify-between text-blue-600">
                    <span>
                      Tip (
                      {tipType === "percentage"
                        ? `${tipPercentage}%`
                        : "Amount"}
                      ):
                    </span>
                    <span>{formatCurrency(calculateTip())}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Final Total:</span>
                    <span>{formatCurrency(finalTotal)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="payment" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="tips">Tips</TabsTrigger>
              <TabsTrigger value="discounts">Discounts</TabsTrigger>
            </TabsList>

            {/* Payment Tab */}
            <TabsContent value="payment" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Payment Method</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="mobile_payment">
                        Mobile Payment
                      </SelectItem>
                      <SelectItem value="gift_card">Gift Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === "cash" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cashReceived">Cash Received</Label>
                      <Input
                        id="cashReceived"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        className={errors.cashReceived ? "border-red-500" : ""}
                      />
                      {errors.cashReceived && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.cashReceived}
                        </p>
                      )}
                    </div>

                    {cashReceived && parseFloat(cashReceived) >= finalTotal && (
                      <Alert>
                        <DollarSign className="h-4 w-4" />
                        <AlertDescription>
                          <strong>
                            Change due: {formatCurrency(calculateChange())}
                          </strong>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Split Bill */}
                <div>
                  <Label>Split Bill</Label>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={splitCount.toString()}
                      onValueChange={(value) => setSplitCount(parseInt(value))}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-600">
                      ways{" "}
                      {splitCount > 1 &&
                        `(${formatCurrency(finalTotal / splitCount)} each)`}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tips Tab */}
            <TabsContent value="tips" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Tip Method</Label>
                  <Select
                    value={tipType}
                    onValueChange={(value: "amount" | "percentage") =>
                      setTipType(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {tipType === "percentage" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-5 gap-2">
                      {quickTipButtons.map((percentage) => (
                        <Button
                          key={percentage}
                          variant={
                            tipPercentage === percentage ? "default" : "outline"
                          }
                          onClick={() => setTipPercentage(percentage)}
                          className="text-sm"
                        >
                          {percentage}%
                        </Button>
                      ))}
                    </div>
                    <div>
                      <Label htmlFor="customTipPercentage">
                        Custom Percentage
                      </Label>
                      <div className="relative">
                        <Input
                          id="customTipPercentage"
                          type="number"
                          min="0"
                          max="100"
                          value={tipPercentage}
                          onChange={(e) =>
                            setTipPercentage(parseFloat(e.target.value) || 0)
                          }
                          className="pr-8"
                        />
                        <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="tipAmount">Tip Amount</Label>
                    <Input
                      id="tipAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={tipAmount}
                      onChange={(e) =>
                        setTipAmount(parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                )}

                {calculateTip() > 0 && (
                  <Alert>
                    <DollarSign className="h-4 w-4" />
                    <AlertDescription>
                      Tip amount:{" "}
                      <strong>{formatCurrency(calculateTip())}</strong>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            {/* Discounts Tab */}
            <TabsContent value="discounts" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="discountAmount">Discount Amount</Label>
                  <Input
                    id="discountAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="discountReason">Reason (Optional)</Label>
                  <Input
                    id="discountReason"
                    placeholder="e.g., Staff discount, Promotion, etc."
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                  />
                </div>

                {discountAmount && parseFloat(discountAmount) > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Discount:{" "}
                      <strong>
                        -{formatCurrency(parseFloat(discountAmount))}
                      </strong>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Receipt className="h-4 w-4 mr-2" />
                  Complete Payment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
