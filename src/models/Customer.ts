import mongoose, { Schema } from "mongoose";

export interface ICustomer extends Document {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  dateOfBirth?: Date;
  orderHistory: string[];
  preferences: {
    favoriteItems: string[];
    dietaryRestrictions: string[];
    spiceLevel?: number;
    notes?: string;
  };
  loyaltyPoints: number;
  totalSpent: number;
  visitFrequency: number;
  lastVisit?: Date;
  marketingOptIn: boolean;
  restaurantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String }
  },
  dateOfBirth: { type: Date },
  orderHistory: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
  preferences: {
    favoriteItems: [{ type: Schema.Types.ObjectId, ref: 'MenuItem' }],
    dietaryRestrictions: [{ type: String }],
    spiceLevel: { type: Number, min: 0, max: 10 },
    notes: { type: String }
  },
  loyaltyPoints: { type: Number, default: 0, min: 0 },
  totalSpent: { type: Number, default: 0, min: 0 },
  visitFrequency: { type: Number, default: 0, min: 0 },
  lastVisit: { type: Date },
  marketingOptIn: { type: Boolean, default: false },
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

CustomerSchema.index({ restaurantId: 1 });
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ phone: 1 });

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);