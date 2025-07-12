
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectToDatabase } from "@/lib/db";
import MenuItem from "@/models/Menu";
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  paginationSchema,
} from "@/lib/validations";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const { page, limit, sortBy, sortOrder } = paginationSchema.parse({
      page: queryParams.page ? parseInt(queryParams.page) : 1,
      limit: queryParams.limit ? parseInt(queryParams.limit) : 50,
      sortBy: queryParams.sortBy ? String(queryParams.sortBy) : "category",
      sortOrder: queryParams.sortOrder || "asc",
    });

    await connectToDatabase();

    // Build query
    const query: any = { isActive: true };
    if (token.restaurantId) query.restaurantId = token.restaurantId;
    if (queryParams.category) query.category = queryParams.category;
    if (queryParams.availability !== undefined)
      query.availability = queryParams.availability === "true";
    if (queryParams.search) {
      query.$or = [
        { name: { $regex: queryParams.search, $options: "i" } },
        { description: { $regex: queryParams.search, $options: "i" } },
      ];
    }

    const total = await MenuItem.countDocuments(query);
    const items = await MenuItem.find(query)
      .populate("ingredients.ingredientId", "itemName unit")
      .sort({ [String(sortBy)]: sortOrder === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get categories
    const categories = await MenuItem.distinct("category", {
      restaurantId: token.restaurantId,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        items,
        categories,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("Get menu items error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('🍽️ [MENU API] POST request started');
  
  try {
    const token = await getToken({ req: request });
    console.log('🍽️ [MENU API] Token retrieved:', {
      hasToken: !!token,
      userId: token?.sub,
      role: token?.role,
      restaurantId: token?.restaurantId,
      permissionsLength: Array.isArray(token?.permissions) ? token.permissions.length : 0
    });
    
    if (!token) {
      console.log('🍽️ [MENU API] ❌ No token found');
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const userPermissions = (token.permissions as string[]) || [];
    console.log('🍽️ [MENU API] User permissions:', userPermissions);
    console.log('🍽️ [MENU API] Required permission:', PERMISSIONS.MENU_CREATE);
    
    const hasCreatePermission = hasPermission(userPermissions, PERMISSIONS.MENU_CREATE);
    console.log('🍽️ [MENU API] Has create permission:', hasCreatePermission);
    
    if (!hasCreatePermission) {
      console.log('🍽️ [MENU API] ❌ Insufficient permissions');
      return NextResponse.json(
        { success: false, message: "Insufficient permissions", debug: { userPermissions, required: PERMISSIONS.MENU_CREATE } },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('🍽️ [MENU API] Request body:', JSON.stringify(body, null, 2));
    
    // Ensure restaurantId is provided
    console.log('🍽️ [MENU API] Checking restaurant ID:', { tokenRestaurantId: token.restaurantId, bodyRestaurantId: body.restaurantId });
    
    if (!token.restaurantId && !body.restaurantId) {
      console.log('🍽️ [MENU API] ❌ No restaurant ID found');
      return NextResponse.json(
        { success: false, message: "Restaurant ID is required" },
        { status: 400 }
      );
    }
    
    const dataToValidate = {
      ...body,
      restaurantId: token.restaurantId || body.restaurantId,
    };
    console.log('🍽️ [MENU API] Data to validate:', JSON.stringify(dataToValidate, null, 2));
    
    const validatedData = createMenuItemSchema.parse(dataToValidate);
    console.log('🍽️ [MENU API] ✅ Data validation passed');

    console.log('🍽️ [MENU API] Connecting to database...');
    await connectToDatabase();
    console.log('🍽️ [MENU API] ✅ Database connected');

    console.log('🍽️ [MENU API] Creating menu item...');
    const menuItem = new MenuItem(validatedData);
    await menuItem.save();
    console.log('🍽️ [MENU API] ✅ Menu item saved:', menuItem._id);

    console.log('🍽️ [MENU API] Populating menu item...');
    const populatedItem = await MenuItem.findById(menuItem._id).populate(
      "ingredients.ingredientId",
      "itemName unit"
    );
    console.log('🍽️ [MENU API] ✅ Menu item populated');

    console.log('🍽️ [MENU API] ✅ SUCCESS - Menu item created successfully');
    return NextResponse.json({
      success: true,
      message: "Menu item created successfully",
      data: populatedItem,
    });
  } catch (error: any) {
    console.error("🍽️ [MENU API] ❌ ERROR:", error);
    console.error("🍽️ [MENU API] Error stack:", error.stack);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const userPermissions = (token.permissions as string[]) || [];
    if (!hasPermission(userPermissions, PERMISSIONS.MENU_UPDATE)) {
      return NextResponse.json(
        { success: false, message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { itemId, ...updateData } = body;

    if (!itemId) {
      return NextResponse.json(
        { success: false, message: "Item ID is required" },
        { status: 400 }
      );
    }

    // Validate update data (excluding itemId)
    const validatedData = updateMenuItemSchema.parse(updateData);

    await connectToDatabase();

    const menuItem = await MenuItem.findOneAndUpdate(
      {
        _id: itemId,
        restaurantId: token.restaurantId,
        isActive: true,
      },
      validatedData,
      { new: true }
    ).populate("ingredients.ingredientId", "itemName unit");

    if (!menuItem) {
      return NextResponse.json(
        { success: false, message: "Menu item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Menu item updated successfully",
      data: menuItem,
    });
  } catch (error: any) {
    console.error("Update menu item error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const userPermissions = (token.permissions as string[]) || [];
    if (!hasPermission(userPermissions, PERMISSIONS.MENU_DELETE)) {
      return NextResponse.json(
        { success: false, message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json(
        { success: false, message: "Item ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Soft delete by setting isActive to false
    const menuItem = await MenuItem.findOneAndUpdate(
      {
        _id: itemId,
        restaurantId: token.restaurantId,
      },
      { isActive: false },
      { new: true }
    );

    if (!menuItem) {
      return NextResponse.json(
        { success: false, message: "Menu item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete menu item error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
