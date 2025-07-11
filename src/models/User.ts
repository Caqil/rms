import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'super_admin' | 'manager' | 'cashier' | 'kitchen_staff' | 'server' | 'delivery';
  permissions: string[];
  restaurantId?: string;
  shiftSchedule?: {
    monday?: { start: string; end: string; };
    tuesday?: { start: string; end: string; };
    wednesday?: { start: string; end: string; };
    thursday?: { start: string; end: string; };
    friday?: { start: string; end: string; };
    saturday?: { start: string; end: string; };
    sunday?: { start: string; end: string; };
  };
  hourlyRate?: number;
  hireDate?: Date;
  certifications?: string[];
  performanceMetrics?: {
    ordersProcessed: number;
    averageOrderTime: number;
    customerRating: number;
    punctuality: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['super_admin', 'manager', 'cashier', 'kitchen_staff', 'server', 'delivery'],
    required: true 
  },
  permissions: [{ type: String }],
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
  shiftSchedule: {
    monday: { start: String, end: String },
    tuesday: { start: String, end: String },
    wednesday: { start: String, end: String },
    thursday: { start: String, end: String },
    friday: { start: String, end: String },
    saturday: { start: String, end: String },
    sunday: { start: String, end: String }
  },
  hourlyRate: { type: Number, min: 0 },
  hireDate: { type: Date },
  certifications: [{ type: String }],
  performanceMetrics: {
    ordersProcessed: { type: Number, default: 0 },
    averageOrderTime: { type: Number, default: 0 },
    customerRating: { type: Number, default: 0 },
    punctuality: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, restaurantId: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
