"use client";

import { useState, useRef } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Upload,
  X,
  ImageIcon,
  DollarSign,
  Clock,
  Info,
} from "lucide-react";
import Image from "next/image";
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    initialData?.image || ""
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      preparationTime: 15,
      allergens: [],
      ingredients: [],
      ...initialData,
    },
  });

  const availability = watch("availability");
  const price = watch("price");
  const cost = watch("cost");

  // Calculate profit margin
  const profitMargin = price && cost ? ((price - cost) / price) * 100 : 0;

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);

    try {
      // Create form data for image upload
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", "menu-items");

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const result = await response.json();

      if (result.success && result.data?.url) {
        setImagePreview(result.data.url);
        setValue("image", result.data.url);
        return result.data.url;
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image
    try {
      await handleImageUpload(file);
    } catch (error) {
      alert("Failed to upload image. Please try again.");
      setImagePreview(initialData?.image || "");
      setImageFile(null);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setValue("image", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onFormSubmit = async (data: CreateMenuItemInput) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ImageIcon className="h-5 w-5" />
          <span>{mode === "create" ? "Add Menu Item" : "Edit Menu Item"}</span>
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Create a new item for your menu with image, pricing, and details."
            : "Update menu item information, pricing, and availability."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label>Item Image</Label>
            <div className="flex flex-col space-y-4">
              {/* Image Preview */}
              {imagePreview ? (
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Menu item preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    disabled={uploadingImage}
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload image</p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                </div>
              )}

              {/* File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploadingImage || isLoading}
              />

              {/* Upload Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage || isLoading}
                className="w-fit"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {imagePreview ? "Change Image" : "Upload Image"}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Margherita Pizza"
                {...register("name")}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                placeholder="e.g., Pizza, Appetizers, Beverages"
                {...register("category")}
                disabled={isLoading}
              />
              {errors.category && (
                <p className="text-sm text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the item, ingredients, and preparation..."
              {...register("description")}
              disabled={isLoading}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Pricing and Cost */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span>Selling Price *</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                {...register("price", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.price && (
                <p className="text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost per Item *</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("cost", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.cost && (
                <p className="text-sm text-red-600">{errors.cost.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center space-x-1">
                <Info className="h-4 w-4" />
                <span>Profit Margin</span>
              </Label>
              <div className="p-2 bg-gray-50 rounded border">
                <span
                  className={`font-medium ${
                    profitMargin >= 60
                      ? "text-green-600"
                      : profitMargin >= 40
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {profitMargin > 0 ? `${profitMargin.toFixed(1)}%` : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Preparation Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="preparationTime"
                className="flex items-center space-x-1"
              >
                <Clock className="h-4 w-4" />
                <span>Prep Time (minutes) *</span>
              </Label>
              <Input
                id="preparationTime"
                type="number"
                min="1"
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
              <Label htmlFor="allergens">Allergens (comma-separated)</Label>
              <Input
                id="allergens"
                placeholder="e.g., nuts, dairy, gluten"
                disabled={isLoading}
                onChange={(e) => {
                  const allergens = e.target.value
                    .split(",")
                    .map((a) => a.trim())
                    .filter(Boolean);
                  setValue("allergens", allergens);
                }}
                defaultValue={initialData?.allergens?.join(", ") || ""}
              />
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="availability"
              checked={availability}
              onCheckedChange={(checked) => setValue("availability", checked)}
              disabled={isLoading}
            />
            <Label
              htmlFor="availability"
              className="flex items-center space-x-2"
            >
              <span>Available for ordering</span>
              {!availability && (
                <Badge variant="secondary">Hidden from menu</Badge>
              )}
            </Label>
          </div>

          {/* Profit Margin Info */}
          {price && cost && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Profit Analysis:</strong>
                {profitMargin >= 60 && " Excellent profit margin! 💚"}
                {profitMargin >= 40 &&
                  profitMargin < 60 &&
                  " Good profit margin. 💛"}
                {profitMargin < 40 &&
                  " Consider reviewing your pricing strategy. 🔴"}
                {` Profit per item: $${(price - cost).toFixed(2)}`}
              </AlertDescription>
            </Alert>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading || uploadingImage}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || uploadingImage}
              className="min-w-[120px]"
            >
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
