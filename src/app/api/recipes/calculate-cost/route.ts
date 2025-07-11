import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import RecipeModel from '@/models/Recipe';

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
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

    const recipe = await RecipeModel.findOne({
      _id: recipeId,
      restaurantId: token.restaurantId,
      isActive: true
    }).populate('ingredients.inventoryItemId', 'cost');

    if (!recipe) {
      return NextResponse.json(
        { success: false, message: 'Recipe not found' },
        { status: 404 }
      );
    }

    // Recalculate costs based on current inventory prices
    let totalCost = 0;
    const updatedIngredients = recipe.ingredients.map(ingredient => {
      const inventoryItem = ingredient.inventoryItemId as any;
      const cost = inventoryItem.cost * ingredient.quantity;
      totalCost += cost;
      
      return {
        ...ingredient.toObject(),
        cost
      };
    });

    const costPerServing = recipe.servings > 0 ? totalCost / recipe.servings : 0;

    // Update the recipe with new costs
    const updatedRecipe = await RecipeModel.findByIdAndUpdate(
      recipeId,
      {
        ingredients: updatedIngredients,
        totalCost: Math.round(totalCost * 100) / 100,
        costPerServing: Math.round(costPerServing * 100) / 100
      },
      { new: true }
    ).populate('ingredients.inventoryItemId', 'itemName unit cost');

    return NextResponse.json({
      success: true,
      message: 'Recipe cost recalculated successfully',
      data: updatedRecipe,
    });
  } catch (error: any) {
    console.error('Calculate recipe cost error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}