"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  createMenuItemSchema,
  type CreateMenuItemInput,
} from "@/lib/validations";

interface MenuItemFormProps {
  onSubmit: (data: CreateMenuItemInput) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<CreateMenuItemInput>;
  mode?: "create" | "edit";
}

export default function MenuItemForm({
  onSubmit,
  isLoading = false,
  initialData,
  mode = "create",
}: MenuItemFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateMenuItemInput>({
    resolver: zodResolver(createMenuItemSchema),
    defaultValues: {
      availability: true,
      ...initialData,
    },
  });

  const availability = watch("availability");

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Add Menu Item" : "Edit Menu Item"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Create a new item for your menu."
            : "Update menu item information."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                placeholder="Enter item name"
                {...register("name")}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Appetizers, Main Course"
                {...register("category")}
                disabled={isLoading}
              />
              {errors.category && (
                <p className="text-sm text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("price", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.price && (
                <p className="text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost ($)</Label>
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
              <Label htmlFor="preparationTime">Prep Time (minutes)</Label>
              <Input
                id="preparationTime"
                type="number"
                placeholder="15"
                {...register("preparationTime", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.preparationTime && (
                <p className="text-sm text-red-600">
                  {errors.preparationTime.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL (Optional)</Label>
              <Input
                id="image"
                type="url"
                placeholder="https://example.com/image.jpg"
                {...register("image")}
                disabled={isLoading}
              />
              {errors.image && (
                <p className="text-sm text-red-600">{errors.image.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the item..."
              {...register("description")}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="availability"
              checked={availability}
              onCheckedChange={(checked) => setValue("availability", checked)}
              disabled={isLoading}
            />
            <Label htmlFor="availability">Available for ordering</Label>
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
