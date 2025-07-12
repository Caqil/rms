"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Trash2, Calculator, Clock, Users } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { formatCurrency } from "@/lib/utils";
import { z } from "zod";

// Recipe validation schema
const recipeSchema = z.object({
  name: z.string().min(2, "Recipe name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  servings: z.number().min(1, "Servings must be at least 1"),
  prepTime: z.number().min(1, "Prep time must be at least 1 minute"),
  cookTime: z.number().min(0, "Cook time must be 0 or more minutes"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  ingredients: z
    .array(
      z.object({
        inventoryItemId: z.string().min(1, "Inventory item is required"),
        quantity: z.number().min(0.01, "Quantity must be greater than 0"),
        notes: z.string().optional(),
      })
    )
    .min(1, "At least one ingredient is required"),
  instructions: z
    .array(
      z.object({
        instruction: z
          .string()
          .min(5, "Instruction must be at least 5 characters"),
        time: z.number().optional(),
      })
    )
    .min(1, "At least one instruction is required"),
  nutritionalInfo: z
    .object({
      calories: z.number().min(0).optional(),
      protein: z.number().min(0).optional(),
      carbs: z.number().min(0).optional(),
      fat: z.number().min(0).optional(),
    })
    .optional(),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  onSubmit: (data: RecipeFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<RecipeFormData>;
  mode?: "create" | "edit";
}

export default function RecipeForm({
  onSubmit,
  isLoading = false,
  initialData,
  mode = "create",
}: RecipeFormProps) {
  const [totalCost, setTotalCost] = useState(0);
  const [costPerServing, setCostPerServing] = useState(0);

  const { items: inventoryItems } = useInventory();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      servings: 4,
      prepTime: 15,
      cookTime: 30,
      difficulty: "medium",
      ingredients: [{ inventoryItemId: "", quantity: 0 }],
      instructions: [{ instruction: "", time: undefined }],
      ...initialData,
    },
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: "ingredients",
  });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({
    control,
    name: "instructions",
  });

  const watchedIngredients = watch("ingredients");
  const watchedServings = watch("servings");

  // Calculate total cost whenever ingredients or servings change
  useEffect(() => {
    let total = 0;

    watchedIngredients.forEach((ingredient) => {
      if (ingredient.inventoryItemId && ingredient.quantity > 0) {
        const inventoryItem = inventoryItems.find(
          (item) => item._id === ingredient.inventoryItemId
        );
        if (inventoryItem) {
          total += inventoryItem.cost * ingredient.quantity;
        }
      }
    });

    setTotalCost(total);
    setCostPerServing(watchedServings > 0 ? total / watchedServings : 0);
  }, [watchedIngredients, watchedServings, inventoryItems]);

  const categories = [
    "Appetizers",
    "Main Course",
    "Desserts",
    "Beverages",
    "Sides",
    "Salads",
    "Soups",
    "Sauces",
    "Bread",
    "Other",
  ];

  const getIngredientCost = (
    ingredientId: string,
    quantity: number
  ): number => {
    const item = inventoryItems.find((item) => item._id === ingredientId);
    return item ? item.cost * quantity : 0;
  };

  const handleFormSubmit = async (data: RecipeFormData) => {
    // Add calculated costs to the data
    const enrichedData = {
      ...data,
      totalCost,
      costPerServing,
      ingredients: data.ingredients.map((ingredient) => {
        const inventoryItem = inventoryItems.find(
          (item) => item._id === ingredient.inventoryItemId
        );
        return {
          ...ingredient,
          itemName: inventoryItem?.itemName || "",
          unit: inventoryItem?.unit || "",
          cost: getIngredientCost(
            ingredient.inventoryItemId,
            ingredient.quantity
          ),
        };
      }),
    };

    await onSubmit(enrichedData);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  General recipe details and cooking information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Recipe Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter recipe name"
                      {...register("name")}
                      disabled={isLoading}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">
                        {errors.name.message}
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
                    <Label htmlFor="servings">Servings</Label>
                    <div className="relative">
                      <Input
                        id="servings"
                        type="number"
                        min="1"
                        {...register("servings", { valueAsNumber: true })}
                        disabled={isLoading}
                        className="pr-10"
                      />
                      <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.servings && (
                      <p className="text-sm text-red-600">
                        {errors.servings.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      onValueChange={(value) =>
                        setValue(
                          "difficulty",
                          value as "easy" | "medium" | "hard"
                        )
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.difficulty && (
                      <p className="text-sm text-red-600">
                        {errors.difficulty.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                    <div className="relative">
                      <Input
                        id="prepTime"
                        type="number"
                        min="1"
                        {...register("prepTime", { valueAsNumber: true })}
                        disabled={isLoading}
                        className="pr-10"
                      />
                      <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.prepTime && (
                      <p className="text-sm text-red-600">
                        {errors.prepTime.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cookTime">Cook Time (minutes)</Label>
                    <div className="relative">
                      <Input
                        id="cookTime"
                        type="number"
                        min="0"
                        {...register("cookTime", { valueAsNumber: true })}
                        disabled={isLoading}
                        className="pr-10"
                      />
                      <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.cookTime && (
                      <p className="text-sm text-red-600">
                        {errors.cookTime.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the recipe..."
                    rows={3}
                    {...register("description")}
                    disabled={isLoading}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ingredients */}
          <TabsContent value="ingredients" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ingredients</CardTitle>
                    <CardDescription>
                      Add ingredients from your inventory
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Total Cost</div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(totalCost)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(costPerServing)} per serving
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {ingredientFields.map((field, index) => {
                  const currentIngredient = watchedIngredients[index];
                  const selectedItem = inventoryItems.find(
                    (item) => item._id === currentIngredient?.inventoryItemId
                  );
                  const ingredientCost = currentIngredient
                    ? getIngredientCost(
                        currentIngredient.inventoryItemId,
                        currentIngredient.quantity
                      )
                    : 0;

                  return (
                    <div
                      key={field.id}
                      className="p-4 border rounded-lg space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Ingredient {index + 1}</h4>
                        <div className="flex items-center space-x-2">
                          {ingredientCost > 0 && (
                            <Badge variant="outline">
                              {formatCurrency(ingredientCost)}
                            </Badge>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeIngredient(index)}
                            disabled={
                              ingredientFields.length === 1 || isLoading
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Inventory Item</Label>
                          <Select
                            onValueChange={(value) =>
                              setValue(
                                `ingredients.${index}.inventoryItemId`,
                                value
                              )
                            }
                            disabled={isLoading}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              {inventoryItems.map((item) => (
                                <SelectItem key={item._id} value={item._id}>
                                  <div className="flex justify-between items-center w-full">
                                    <span>{item.itemName}</span>
                                    <span className="text-xs text-gray-500 ml-2">
                                      {item.currentStock} {item.unit} •{" "}
                                      {formatCurrency(item.cost)}/{item.unit}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.ingredients?.[index]?.inventoryItemId && (
                            <p className="text-sm text-red-600">
                              {
                                errors.ingredients[index]?.inventoryItemId
                                  ?.message
                              }
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              placeholder="0"
                              {...register(`ingredients.${index}.quantity`, {
                                valueAsNumber: true,
                              })}
                              disabled={isLoading}
                              className="pr-12"
                            />
                            {selectedItem && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                                {selectedItem.unit}
                              </div>
                            )}
                          </div>
                          {errors.ingredients?.[index]?.quantity && (
                            <p className="text-sm text-red-600">
                              {errors.ingredients[index]?.quantity?.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Notes (Optional)</Label>
                          <Input
                            placeholder="e.g., diced, chopped"
                            {...register(`ingredients.${index}.notes`)}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      {selectedItem && currentIngredient?.quantity > 0 && (
                        <Alert>
                          <Calculator className="h-4 w-4" />
                          <AlertDescription>
                            Using {currentIngredient.quantity}{" "}
                            {selectedItem.unit} ×{" "}
                            {formatCurrency(selectedItem.cost)} ={" "}
                            {formatCurrency(ingredientCost)}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  );
                })}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    appendIngredient({ inventoryItemId: "", quantity: 0 })
                  }
                  disabled={isLoading}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ingredient
                </Button>

                {errors.ingredients && (
                  <p className="text-sm text-red-600">
                    {errors.ingredients.message}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Instructions */}
          <TabsContent value="instructions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
                <CardDescription>
                  Step-by-step cooking instructions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {instructionFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 border rounded-lg space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Step {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeInstruction(index)}
                        disabled={instructionFields.length === 1 || isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-3 space-y-2">
                        <Label>Instruction</Label>
                        <Textarea
                          placeholder="Describe this step..."
                          rows={2}
                          {...register(`instructions.${index}.instruction`)}
                          disabled={isLoading}
                        />
                        {errors.instructions?.[index]?.instruction && (
                          <p className="text-sm text-red-600">
                            {errors.instructions[index]?.instruction?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Time (minutes, optional)</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...register(`instructions.${index}.time`, {
                            valueAsNumber: true,
                          })}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    appendInstruction({ instruction: "", time: undefined })
                  }
                  disabled={isLoading}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Instruction
                </Button>

                {errors.instructions && (
                  <p className="text-sm text-red-600">
                    {errors.instructions.message}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nutrition */}
          <TabsContent value="nutrition" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Nutritional Information</CardTitle>
                <CardDescription>
                  Optional nutritional information per serving
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories</Label>
                    <Input
                      id="calories"
                      type="number"
                      min="0"
                      placeholder="0"
                      {...register("nutritionalInfo.calories", {
                        valueAsNumber: true,
                      })}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0"
                      {...register("nutritionalInfo.protein", {
                        valueAsNumber: true,
                      })}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="carbs">Carbohydrates (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0"
                      {...register("nutritionalInfo.carbs", {
                        valueAsNumber: true,
                      })}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fat">Fat (g)</Label>
                    <Input
                      id="fat"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0"
                      {...register("nutritionalInfo.fat", {
                        valueAsNumber: true,
                      })}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Cost Summary */}
        {totalCost > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="font-medium">Recipe Cost Summary</h3>
                  <p className="text-sm text-gray-600">
                    Total cost: {formatCurrency(totalCost)} • Cost per serving:{" "}
                    {formatCurrency(costPerServing)}
                  </p>
                </div>
                <Badge variant="outline" className="text-lg py-2 px-4">
                  {formatCurrency(costPerServing)} / serving
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
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
              "Create Recipe"
            ) : (
              "Update Recipe"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
