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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, RotateCcw, Loader2 } from "lucide-react";

interface StockAdjustmentModalProps {
  item: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdjust: (adjustment: any) => Promise<void>;
}

export default function StockAdjustmentModal({
  item,
  open,
  onOpenChange,
  onAdjust,
}: StockAdjustmentModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<
    "add" | "remove" | "set"
  >("add");
  const [quantity, setQuantity] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const reasons = {
    add: [
      "Stock delivery",
      "Inventory recount",
      "Return from kitchen",
      "Transfer from other location",
      "Other",
    ],
    remove: [
      "Used in kitchen",
      "Waste/spoilage",
      "Damaged goods",
      "Transfer to other location",
      "Staff consumption",
      "Other",
    ],
    set: [
      "Physical count correction",
      "System correction",
      "Audit adjustment",
      "Other",
    ],
  };

  const calculateNewQuantity = (): number => {
    const qty = parseFloat(quantity) || 0;
    switch (adjustmentType) {
      case "add":
        return item.quantity + qty;
      case "remove":
        return Math.max(0, item.quantity - qty);
      case "set":
        return qty;
      default:
        return item.quantity;
    }
  };

  const handleSubmit = async () => {
    if (!quantity || !reason) return;

    setIsLoading(true);
    try {
      await onAdjust({
        type: adjustmentType,
        quantity: parseFloat(quantity),
        reason,
        notes: notes || undefined,
      });

      // Reset form
      setQuantity("");
      setReason("");
      setNotes("");
      setAdjustmentType("add");
    } finally {
      setIsLoading(false);
    }
  };

  const newQuantity = calculateNewQuantity();
  const isValid = quantity && reason && parseFloat(quantity) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock - {item?.itemName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Stock Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Current Stock</div>
            <div className="text-2xl font-bold">
              {item?.quantity} {item?.unit}
            </div>
            <div className="text-xs text-gray-500">
              Reorder at {item?.reorderLevel} • Max {item?.maxStock}
            </div>
          </div>

          {/* Adjustment Type */}
          <div className="space-y-2">
            <Label>Adjustment Type</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={adjustmentType === "add" ? "default" : "outline"}
                size="sm"
                onClick={() => setAdjustmentType("add")}
                className="flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </Button>
              <Button
                variant={adjustmentType === "remove" ? "default" : "outline"}
                size="sm"
                onClick={() => setAdjustmentType("remove")}
                className="flex items-center space-x-1"
              >
                <Minus className="h-4 w-4" />
                <span>Remove</span>
              </Button>
              <Button
                variant={adjustmentType === "set" ? "default" : "outline"}
                size="sm"
                onClick={() => setAdjustmentType("set")}
                className="flex items-center space-x-1"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Set</span>
              </Button>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">
              {adjustmentType === "set"
                ? "New Quantity"
                : "Quantity to " + adjustmentType}
            </Label>
            <div className="relative">
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="pr-16"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                {item?.unit}
              </div>
            </div>
          </div>

          {/* New Quantity Preview */}
          {quantity && (
            <Alert
              className={
                newQuantity <= item?.reorderLevel
                  ? "border-orange-200 bg-orange-50"
                  : "border-green-200 bg-green-50"
              }
            >
              <AlertDescription>
                <div className="flex justify-between items-center">
                  <span>New quantity will be:</span>
                  <Badge
                    variant={
                      newQuantity <= item?.reorderLevel
                        ? "secondary"
                        : "default"
                    }
                  >
                    {newQuantity.toFixed(2)} {item?.unit}
                  </Badge>
                </div>
                {newQuantity <= item?.reorderLevel && (
                  <div className="text-orange-600 text-sm mt-1">
                    ⚠️ This will put the item below reorder level
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason for adjustment" />
              </SelectTrigger>
              <SelectContent>
                {reasons[adjustmentType].map((reasonOption) => (
                  <SelectItem key={reasonOption} value={reasonOption}>
                    {reasonOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adjusting...
                </>
              ) : (
                "Apply Adjustment"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
