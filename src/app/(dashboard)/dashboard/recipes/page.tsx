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
  ChefHat,
  Plus,
  Search,
  Clock,
  Users,
  DollarSign,
  Edit,
  Trash2,
  Calculator,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useRecipes } from "@/hooks/useRecipes";
import RecipeForm from "@/components/forms/RecipeForm";

interface Recipe {
  _id: string;
  name: string;
  description: string;
  category: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: "easy" | "medium" | "hard";
  ingredients: Array<{
    inventoryItemId: string;
    itemName: string;
    quantity: number;
    unit: string;
    cost: number;
  }>;
  instructions: Array<{
    step: number;
    instruction: string;
    time?: number;
  }>;
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  costPerServing: number;
  totalCost: number;
  menuItemId?: string;
}

export default function RecipesPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    recipes,
    categories,
    isLoading,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    calculateRecipeCost,
    creating,
    updating,
  } = useRecipes();

  // Filter recipes
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateRecipe = async (data: any) => {
    const result = await createRecipe(data);
    if (result) {
      setShowCreateDialog(false);
    }
  };

  const handleUpdateRecipe = async (data: any) => {
    if (!editingRecipe) return;

    const result = await updateRecipe(editingRecipe._id, data);
    if (result) {
      setEditingRecipe(null);
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    if (confirm("Are you sure you want to delete this recipe?")) {
      await deleteRecipe(recipeId);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recipe Management</h1>
          <p className="text-gray-600">
            Manage recipes and calculate food costs
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Recipe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Recipe</DialogTitle>
            </DialogHeader>
            <RecipeForm
              onSubmit={handleCreateRecipe}
              isLoading={creating}
              mode="create"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

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
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <Card key={recipe._id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              {/* Recipe Header */}
              <div className="p-4 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg line-clamp-1">
                      {recipe.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {recipe.description}
                    </p>
                  </div>
                  <Badge className={getDifficultyColor(recipe.difficulty)}>
                    {recipe.difficulty}
                  </Badge>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <Badge variant="outline">{recipe.category}</Badge>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{recipe.servings}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{recipe.prepTime + recipe.cookTime}m</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recipe Details */}
              <div className="p-4 space-y-4">
                {/* Ingredients Summary */}
                <div>
                  <h4 className="font-medium text-sm mb-2">
                    Ingredients ({recipe.ingredients.length})
                  </h4>
                  <div className="space-y-1">
                    {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-gray-600">
                          {ingredient.itemName}
                        </span>
                        <span>
                          {ingredient.quantity} {ingredient.unit}
                        </span>
                      </div>
                    ))}
                    {recipe.ingredients.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{recipe.ingredients.length - 3} more ingredients
                      </div>
                    )}
                  </div>
                </div>

                {/* Cost Information */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Cost:</span>
                    <span className="font-medium">
                      {formatCurrency(recipe.totalCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cost per Serving:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(recipe.costPerServing)}
                    </span>
                  </div>
                </div>

                {/* Nutritional Info */}
                {recipe.nutritionalInfo && (
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">
                      Nutritional Info (per serving)
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Calories: {recipe.nutritionalInfo.calories}</div>
                      <div>Protein: {recipe.nutritionalInfo.protein}g</div>
                      <div>Carbs: {recipe.nutritionalInfo.carbs}g</div>
                      <div>Fat: {recipe.nutritionalInfo.fat}g</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 border-t bg-gray-50">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => calculateRecipeCost(recipe._id)}
                    className="flex-1"
                  >
                    <Calculator className="h-4 w-4 mr-1" />
                    Recalculate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingRecipe(recipe)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteRecipe(recipe._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredRecipes.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">
              <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No recipes found</h3>
              <p className="mb-4">
                {searchQuery || selectedCategory
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first recipe"}
              </p>
              {!searchQuery && !selectedCategory && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Recipe
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingRecipe}
        onOpenChange={(open) => !open && setEditingRecipe(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Recipe</DialogTitle>
          </DialogHeader>
          {editingRecipe && (
            <RecipeForm
              onSubmit={handleUpdateRecipe}
              isLoading={updating}
              initialData={editingRecipe}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
