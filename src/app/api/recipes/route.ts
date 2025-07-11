import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';
import RecipeModel from '@/models/Recipe';

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

    const recipes = await RecipeModel.find({
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

    const recipe = new RecipeModel(recipeData);
    await recipe.save();

    const populatedRecipe = await RecipeModel.findById(recipe._id)
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

    const recipe = await RecipeModel.findOneAndUpdate(
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
    const recipe = await RecipeModel.findOneAndUpdate(
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