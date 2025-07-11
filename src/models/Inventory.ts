import mongoose, { Schema, Document } from "mongoose";
export interface IInventory extends Document {
  _id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  cost: number;
  supplierInfo: {
    name: string;
    contact: string;
    email?: string;
    phone?: string;
  };
  expirationDate?: Date;
  reorderLevel: number;
  maxStock: number;
  barcode?: string;
  location?: string; // Ensure this matches the schema (string | undefined)
  restaurantId: string;
  lastUpdated: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema({
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },
  cost: { type: Number, required: true, min: 0 },
  supplierInfo: {
    name: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String },
    phone: { type: String }
  },
  expirationDate: { type: Date },
  reorderLevel: { type: Number, required: true, min: 0 },
  maxStock: { type: Number, required: true, min: 0 },
  barcode: { type: String },
  location: { type: String },
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  lastUpdated: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

InventorySchema.index({ restaurantId: 1, category: 1 });
InventorySchema.index({ itemName: 'text' });
InventorySchema.index({ quantity: 1, reorderLevel: 1 });

export default mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', InventorySchema);
