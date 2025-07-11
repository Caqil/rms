import { useState, useEffect } from 'react';
import { useApi, useApiMutation } from './useApi';

interface Recipe {
  _id: string;
  name: string;
  description: string;
  category: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Array<{
    inventoryItemId: string;
    itemName: string;
    quantity: number;
    unit: string;
    cost: number;
    notes?: string;
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
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useRecipes() {
  const { data: recipesData, loading, refetch } = useApi<{
    recipes: Recipe[];
    categories: string[];
  }>('/api/recipes');

  const { mutate: createRecipeAPI, loading: creating } = useApiMutation('/api/recipes', 'POST');
  const { mutate: updateRecipeAPI, loading: updating } = useApiMutation('/api/recipes', 'PATCH');
  const { mutate: deleteRecipeAPI } = useApiMutation('/api/recipes', 'DELETE');
  const { mutate: calculateCostAPI } = useApiMutation('/api/recipes/calculate-cost', 'POST');

  const recipes = recipesData?.recipes || [];
  const categories = recipesData?.categories || [];

  const createRecipe = async (data: any) => {
    const result = await createRecipeAPI(data);
    if (result) {
      refetch();
    }
    return result;
  };

  const updateRecipe = async (recipeId: string, data: any) => {
    const result = await updateRecipeAPI({ recipeId, ...data });
    if (result) {
      refetch();
    }
    return result;
  };

  const deleteRecipe = async (recipeId: string) => {
    const result = await deleteRecipeAPI({ recipeId });
    if (result) {
      refetch();
    }
    return result;
  };

  const calculateRecipeCost = async (recipeId: string) => {
    const result = await calculateCostAPI({ recipeId });
    if (result) {
      refetch();
    }
    return result;
  };

  return {
    recipes,
    categories,
    isLoading: loading,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    calculateRecipeCost,
    refetchRecipes: refetch,
    creating,
    updating,
  };
}

// app/api/recipes/route.ts - Recipes API endpoints
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';
import mongoose, { Schema, Document } from 'mongoose';

// Recipe model
interface IRecipe extends Document {
  _id: string;
  name: string;
  description: string;
  category: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Array<{
    inventoryItemId: string;
    itemName: string;
    quantity: number;
    unit: string;
    cost: number;
    notes?: string;
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
  restaurantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecipeSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  servings: { type: Number, required: true, min: 1 },
  prepTime: { type: Number, required: true, min: 1 },
  cookTime: { type: Number, required: true, min: 0 },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'],
    required: true 
  },
  ingredients: [{
    inventoryItemId: { type: Schema.Types.ObjectId, ref: 'Inventory', required: true },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0.01 },
    unit: { type: String, required: true },
    cost: { type: Number, required: true, min: 0 },
    notes: { type: String }
  }],
  instructions: [{
    step: { type: Number, required: true },
    instruction: { type: String, required: true },
    time: { type: Number, min: 0 }
  }],
  nutritionalInfo: {
    calories: { type: Number, min: 0 },
    protein: { type: Number, min: 0 },
    carbs: { type: Number, min: 0 },
    fat: { type: Number, min: 0 }
  },
  costPerServing: { type: Number, required: true, min: 0 },
  totalCost: { type: Number, required: true, min: 0 },
  menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

RecipeSchema.index({ restaurantId: 1, category: 1 });
RecipeSchema.index({ name: 'text', description: 'text' });

const Recipe = mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', RecipeSchema);

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const recipes = await Recipe.find({
      restaurantId: token.restaurantId,
      isActive: true
    })
    .populate('ingredients.inventoryItemId', 'itemName unit cost')
    .sort({ category: 1, name: 1 });

    // Get unique categories
    const categories = [...new Set(recipes.map(recipe => recipe.category))];

    return NextResponse.json({
      success: true,
      data: {
        recipes,
        categories,
      },
    });
  } catch (error: any) {
    console.error('Get recipes error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userPermissions = token.permissions as string[] || [];
    if (!hasPermission(userPermissions, PERMISSIONS.MENU_CREATE)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Add step numbers to instructions
    const instructionsWithSteps = body.instructions.map((instruction: any, index: number) => ({
      ...instruction,
      step: index + 1
    }));

    const recipeData = {
      ...body,
      instructions: instructionsWithSteps,
      restaurantId: token.restaurantId,
    };

    await connectToDatabase();

    const recipe = new Recipe(recipeData);
    await recipe.save();

    const populatedRecipe = await Recipe.findById(recipe._id)
      .populate('ingredients.inventoryItemId', 'itemName unit cost');

    return NextResponse.json({
      success: true,
      message: 'Recipe created successfully',
      data: populatedRecipe,
    });
  } catch (error: any) {
    console.error('Create recipe error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userPermissions = token.permissions as string[] || [];
    if (!hasPermission(userPermissions, PERMISSIONS.MENU_UPDATE)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { recipeId, ...updateData } = body;

    if (!recipeId) {
      return NextResponse.json(
        { success: false, message: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Add step numbers to instructions if they exist
    if (updateData.instructions) {
      updateData.instructions = updateData.instructions.map((instruction: any, index: number) => ({
        ...instruction,
        step: index + 1
      }));
    }

    await connectToDatabase();

    const recipe = await Recipe.findOneAndUpdate(
      { 
        _id: recipeId, 
        restaurantId: token.restaurantId,
        isActive: true 
      },
      updateData,
      { new: true }
    ).populate('ingredients.inventoryItemId', 'itemName unit cost');

    if (!recipe) {
      return NextResponse.json(
        { success: false, message: 'Recipe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Recipe updated successfully',
      data: recipe,
    });
  } catch (error: any) {
    console.error('Update recipe error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userPermissions = token.permissions as string[] || [];
    if (!hasPermission(userPermissions, PERMISSIONS.MENU_DELETE)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { recipeId } = body;

    if (!recipeId) {
      return NextResponse.json(
        { success: false, message: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Soft delete by setting isActive to false
    const recipe = await Recipe.findOneAndUpdate(
      { 
        _id: recipeId, 
        restaurantId: token.restaurantId 
      },
      { isActive: false },
      { new: true }
    );

    if (!recipe) {
      return NextResponse.json(
        { success: false, message: 'Recipe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Recipe deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete recipe error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// app/api/recipes/calculate-cost/route.ts - Recipe cost calculation
