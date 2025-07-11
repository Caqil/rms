"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  createInventorySchema,
  type CreateInventoryInput,
} from "@/lib/validations";

interface InventoryFormProps {
  onSubmit: (data: CreateInventoryInput) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<CreateInventoryInput>;
  mode?: "create" | "edit";
}

export default function InventoryForm({
  onSubmit,
  isLoading = false,
  initialData,
  mode = "create",
}: InventoryFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateInventoryInput>({
    resolver: zodResolver(createInventorySchema),
    defaultValues: initialData,
  });

  const categories = [
    "Proteins",
    "Vegetables",
    "Dairy",
    "Grains",
    "Spices",
    "Beverages",
    "Cleaning Supplies",
    "Packaging",
    "Other",
  ];

  const units = [
    "kg",
    "g",
    "lb",
    "oz",
    "L",
    "ml",
    "gal",
    "qt",
    "pt",
    "pcs",
    "box",
    "case",
    "pack",
    "dozen",
    "each",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Add Inventory Item" : "Edit Inventory Item"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Add a new item to your inventory."
            : "Update inventory item information."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input
                id="itemName"
                placeholder="Enter item name"
                {...register("itemName")}
                disabled={isLoading}
              />
              {errors.itemName && (
                <p className="text-sm text-red-600">
                  {errors.itemName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                onValueChange={(value) => setValue("category", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Current Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                placeholder="0"
                {...register("quantity", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.quantity && (
                <p className="text-sm text-red-600">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select
                onValueChange={(value) => setValue("unit", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && (
                <p className="text-sm text-red-600">{errors.unit.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost per Unit ($)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("cost", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.cost && (
                <p className="text-sm text-red-600">{errors.cost.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorderLevel">Reorder Level</Label>
              <Input
                id="reorderLevel"
                type="number"
                step="0.01"
                placeholder="0"
                {...register("reorderLevel", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.reorderLevel && (
                <p className="text-sm text-red-600">
                  {errors.reorderLevel.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStock">Maximum Stock</Label>
              <Input
                id="maxStock"
                type="number"
                step="0.01"
                placeholder="0"
                {...register("maxStock", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.maxStock && (
                <p className="text-sm text-red-600">
                  {errors.maxStock.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expirationDate">Expiration Date (Optional)</Label>
              <Input
                id="expirationDate"
                type="date"
                {...register("expirationDate")}
                disabled={isLoading}
              />
              {errors.expirationDate && (
                <p className="text-sm text-red-600">
                  {errors.expirationDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode (Optional)</Label>
              <Input
                id="barcode"
                placeholder="Enter barcode"
                {...register("barcode")}
                disabled={isLoading}
              />
              {errors.barcode && (
                <p className="text-sm text-red-600">{errors.barcode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Storage Location (Optional)</Label>
              <Input
                id="location"
                placeholder="e.g., Freezer A, Pantry B"
                {...register("location")}
                disabled={isLoading}
              />
              {errors.location && (
                <p className="text-sm text-red-600">
                  {errors.location.message}
                </p>
              )}
            </div>
          </div>

          {/* Supplier Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Supplier Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierName">Supplier Name</Label>
                <Input
                  id="supplierName"
                  placeholder="Enter supplier name"
                  {...register("supplierInfo.name")}
                  disabled={isLoading}
                />
                {errors.supplierInfo?.name && (
                  <p className="text-sm text-red-600">
                    {errors.supplierInfo.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierContact">Primary Contact</Label>
                <Input
                  id="supplierContact"
                  placeholder="Contact person name"
                  {...register("supplierInfo.contact")}
                  disabled={isLoading}
                />
                {errors.supplierInfo?.contact && (
                  <p className="text-sm text-red-600">
                    {errors.supplierInfo.contact.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierEmail">Email (Optional)</Label>
                <Input
                  id="supplierEmail"
                  type="email"
                  placeholder="supplier@example.com"
                  {...register("supplierInfo.email")}
                  disabled={isLoading}
                />
                {errors.supplierInfo?.email && (
                  <p className="text-sm text-red-600">
                    {errors.supplierInfo.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierPhone">Phone (Optional)</Label>
                <Input
                  id="supplierPhone"
                  placeholder="Phone number"
                  {...register("supplierInfo.phone")}
                  disabled={isLoading}
                />
                {errors.supplierInfo?.phone && (
                  <p className="text-sm text-red-600">
                    {errors.supplierInfo.phone.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Updating..."}
                </>
              ) : mode === "create" ? (
                "Add Item"
              ) : (
                "Update Item"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
