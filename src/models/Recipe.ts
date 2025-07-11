import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipe extends Document {
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

export default mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', RecipeSchema);
