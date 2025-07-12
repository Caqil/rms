import mongoose, { Schema, Document } from "mongoose";
export interface IMenuItem extends Document {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  image?: string;
  availability: boolean;
  preparationTime: number; // in minutes
  allergens: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  ingredients: Array<{
    ingredientId: string;
    quantity: number;
    unit: string;
  }>;
  seasonalAvailability?: {
    startDate: Date;
    endDate: Date;
  };
  restaurantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  cost: { type: Number, required: true, min: 0 },
  image: { type: String },
  availability: { type: Boolean, default: true },
  preparationTime: { type: Number, required: true, min: 0 },
  allergens: [{ type: String }],
  nutritionalInfo: {
    calories: { type: Number, min: 0 },
    protein: { type: Number, min: 0 },
    carbs: { type: Number, min: 0 },
    fat: { type: Number, min: 0 },
    fiber: { type: Number, min: 0 }
  },
  ingredients: [{
    ingredientId: { type: Schema.Types.ObjectId, ref: 'Inventory', required: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true }
  }],
  seasonalAvailability: {
    startDate: { type: Date },
    endDate: { type: Date }
  },
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

MenuItemSchema.index({ restaurantId: 1, category: 1 });
MenuItemSchema.index({ name: 'text', description: 'text' });

export default mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
