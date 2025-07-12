// lib/validations.ts
import { z } from 'zod';

// User Validation Schemas
export const userRoles = ['super_admin', 'manager', 'cashier', 'kitchen_staff', 'server', 'delivery'] as const;

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(userRoles),
  permissions: z.array(z.string()).optional(),
  restaurantId: z.string().optional(),
  hourlyRate: z.number().min(0).optional(),
  hireDate: z.string().or(z.date()).optional(),
  certifications: z.array(z.string()).optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Restaurant Validation Schemas
export const createRestaurantSchema = z.object({
  name: z.string().min(2, 'Restaurant name must be at least 2 characters'),
  address: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().min(5, 'Valid zip code is required'),
    country: z.string().min(2, 'Country is required'),
  }),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Invalid email address'),
  settings: z.object({
    currency: z.string().default('USD'),
    timezone: z.string().default('UTC'),
    language: z.string().default('en'),
    dateFormat: z.string().default('MM/dd/yyyy'),
  }).optional(),
  taxRates: z.object({
    salesTax: z.number().min(0).max(1),
    serviceTax: z.number().min(0).max(1).optional(),
    vat: z.number().min(0).max(1).optional(),
  }),
  paymentMethods: z.array(z.string()).min(1, 'At least one payment method is required'),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();
export const createMenuItemSchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(2, 'Category is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  cost: z.number().min(0, 'Cost must be 0 or greater'),
  image: z.string().optional(), // Made optional and removed URL validation for now
  availability: z.boolean(),
  preparationTime: z.number().min(1, 'Preparation time must be at least 1 minute'),
  allergens: z.array(z.string()).optional(),
  nutritionalInfo: z.object({
    calories: z.number().min(0),
    protein: z.number().min(0),
    carbs: z.number().min(0),
    fat: z.number().min(0),
    fiber: z.number().min(0),
  }).optional(),
  ingredients: z.array(z.object({
    ingredientId: z.string(),
    quantity: z.number().min(0.01),
    unit: z.string().min(1),
  })).optional(), // Made optional
  seasonalAvailability: z.object({
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
  }).optional(),
  restaurantId: z.string(), // Required and set by API
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

// Order Validation Schemas
export const orderStatus = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'] as const;
export const orderTypes = ['dine_in', 'takeout', 'delivery'] as const;
export const paymentMethods = ['cash', 'credit_card', 'debit_card', 'mobile_payment', 'gift_card'] as const;
export const paymentStatus = ['pending', 'completed', 'failed', 'refunded'] as const;

export const createOrderSchema = z.object({
  restaurantId: z.string(),
  tableNumber: z.string().optional(),
  customerId: z.string().optional(),
  customerInfo: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  }).optional(),
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0),
    specialInstructions: z.string().optional(),
    modifications: z.array(z.object({
      type: z.enum(['add', 'remove', 'substitute']),
      item: z.string(),
      price: z.number(),
    })).optional(),
  })).min(1, 'Order must contain at least one item'),
  orderType: z.enum(orderTypes),
  discounts: z.array(z.object({
    type: z.string(),
    amount: z.number().min(0),
    description: z.string(),
  })).optional(),
  tips: z.number().min(0).default(0),
  paymentInfo: z.object({
    method: z.string(),
    amount: z.number().min(0),
  }),
  deliveryInfo: z.object({
    address: z.string(),
    estimatedTime: z.string().or(z.date()),
    deliveryFee: z.number().min(0).default(0),
  }).optional(),
  customerNotes: z.string().optional(),
});

export const updateOrderSchema = z.object({
  status: z.enum(orderStatus).optional(),
  kitchenNotes: z.string().optional(),
  paymentInfo: z.object({
    status: z.enum(paymentStatus),
    transactionId: z.string().optional(),
  }).optional(),
});

// Inventory Validation Schemas
export const createInventorySchema = z.object({
  itemName: z.string().min(2, 'Item name must be at least 2 characters'),
  category: z.string().min(2, 'Category is required'),
  currentStock: z.number().min(0, 'Current stock must be 0 or greater'),
  minStockLevel: z.number().min(0, 'Min stock level must be 0 or greater'),
  maxStockLevel: z.number().min(1, 'Max stock level must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  cost: z.number().min(0, 'Cost must be 0 or greater'),
  supplier: z.string().optional(),
  expirationDate: z.string().or(z.date()).optional(),
  location: z.string().optional(),
  barcode: z.string().optional(),
  restaurantId: z.string(),
});

export const updateInventorySchema = createInventorySchema.partial();

export const stockAdjustmentSchema = z.object({
  type: z.enum(['add', 'remove', 'set']),
  quantity: z.number().min(0),
  reason: z.string().min(5, 'Reason is required'),
  notes: z.string().optional(),
});

// Customer Validation Schemas
export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
  }).optional(),
  dateOfBirth: z.string().or(z.date()).optional(),
  preferences: z.object({
    favoriteItems: z.array(z.string()).optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    spiceLevel: z.number().min(0).max(10).optional(),
    notes: z.string().optional(),
  }).optional(),
  marketingOptIn: z.boolean(),
  restaurantId: z.string(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

// Report and Analytics Schemas
export const reportPeriodSchema = z.object({
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
});

export const salesReportSchema = z.object({
  ...reportPeriodSchema.shape,
  restaurantId: z.string().optional(),
  includeItems: z.boolean().default(false),
  includeStaff: z.boolean().default(false),
  groupBy: z.enum(['day', 'week', 'month', 'category', 'staff']).optional(),
});

// Table Management Schemas
export const createTableSchema = z.object({
  number: z.string(),
  capacity: z.number().min(1).max(20),
  section: z.string().optional(),
  isActive: z.boolean().default(true),
  restaurantId: z.string(),
});

export const tableReservationSchema = z.object({
  tableId: z.string(),
  customerId: z.string().optional(),
  customerName: z.string(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional(),
  reservationTime: z.string().or(z.date()),
  duration: z.number().min(30).max(480), // 30 minutes to 8 hours
  partySize: z.number().min(1).max(20),
  specialRequests: z.string().optional(),
  restaurantId: z.string(),
});

// API Response Schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional(),
  errors: z.array(z.object({
    field: z.string(),
    message: z.string(),
  })).optional(),
});

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// File Upload Schema
export const fileUploadSchema = z.object({
  file: z.any(),
  type: z.enum(['menu_image', 'receipt', 'document']),
  category: z.string().optional(),
});

// Settings Schema
export const restaurantSettingsSchema = z.object({
  general: z.object({
    name: z.string().min(2),
    phone: z.string(),
    email: z.string().email(),
    website: z.string().url().optional(),
  }),
  business: z.object({
    currency: z.string(),
    timezone: z.string(),
    language: z.string(),
    dateFormat: z.string(),
  }),
  pos: z.object({
    autoConfirmOrders: z.boolean().default(false),
    printReceipts: z.boolean().default(true),
    askForTips: z.boolean().default(true),
    defaultTipPercentages: z.array(z.number()).default([15, 18, 20]),
  }),
  kitchen: z.object({
    autoAcceptOrders: z.boolean().default(false),
    estimatePreparationTime: z.boolean().default(true),
    kitchenPrinter: z.boolean().default(true),
  }),
  notifications: z.object({
    emailNotifications: z.boolean().default(true),
    smsNotifications: z.boolean().default(false),
    lowStockAlerts: z.boolean().default(true),
    newOrderAlerts: z.boolean().default(true),
  }),
});

// Type exports for TypeScript
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type SalesReportInput = z.infer<typeof salesReportSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;