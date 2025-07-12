import mongoose, { Schema, Document } from "mongoose";
import { IMenuItem } from "./Menu";

export interface IOrder extends Document {
  _id: string;
  orderNumber: string;
  restaurantId: string;
  tableNumber?: string;
  customerId?: string;
  customerInfo?: {
    name: string;
    phone?: string;
    email?: string;
  };
  items: Array<{
    menuItemId: string | IMenuItem;
    quantity: number;
    price: number;
    specialInstructions?: string;
    modifications?: Array<{
      type: 'add' | 'remove' | 'substitute';
      item: string;
      price: number;
    }>;
  }>;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  orderType: 'dine_in' | 'takeout' | 'delivery';
  subtotal: number;
  taxes: number;
  discounts: Array<{
    type: string;
    amount: number;
    description: string;
  }>;
  tips: number;
  total: number;
  paymentInfo: {
    method: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId?: string;
    amount: number;
  };
  deliveryInfo?: {
    address: string;
    estimatedTime: Date;
    driverId?: string;
    deliveryFee: number;
  };
  timestamps: {
    ordered: Date;
    confirmed?: Date;
    preparing?: Date;
    ready?: Date;
    served?: Date;
    completed?: Date;
  };
  staffId: string;
  kitchenNotes?: string;
  customerNotes?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  estimatedCompletionTime?: Date;
  actualCompletionTime?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  cancelledBy?: string;
  refundAmount?: number;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  tableNumber: { type: String },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  customerInfo: {
    name: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  items: [{
    menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    specialInstructions: { type: String },
    modifications: [{
      type: { type: String, enum: ['add', 'remove', 'substitute'] },
      item: { type: String },
      price: { type: Number }
    }]
  }],
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
    default: 'pending'
  },
  orderType: { 
    type: String, 
    enum: ['dine_in', 'takeout', 'delivery'],
    required: true 
  },
  subtotal: { type: Number, required: true, min: 0 },
  taxes: { type: Number, required: true, min: 0 },
  discounts: [{
    type: { type: String },
    amount: { type: Number },
    description: { type: String }
  }],
  tips: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  paymentInfo: {
    method: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: { type: String },
    amount: { type: Number, required: true }
  },
  deliveryInfo: {
    address: { type: String },
    estimatedTime: { type: Date },
    driverId: { type: Schema.Types.ObjectId, ref: 'User' },
    deliveryFee: { type: Number, default: 0 }
  },
  timestamps: {
    ordered: { type: Date, default: Date.now },
    confirmed: { type: Date },
    preparing: { type: Date },
    ready: { type: Date },
    served: { type: Date },
    completed: { type: Date }
  },
  staffId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  kitchenNotes: { type: String },
  customerNotes: { type: String },
  priority: { 
    type: String, 
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  estimatedCompletionTime: { type: Date },
  actualCompletionTime: { type: Date },
  cancelledAt: { type: Date },
  cancellationReason: { type: String },
  cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
  refundAmount: { type: Number },
  refundReason: { type: String }
}, {
  timestamps: true
});

// Indexes for better query performance
OrderSchema.index({ restaurantId: 1, status: 1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'timestamps.ordered': -1 });
OrderSchema.index({ tableNumber: 1 });
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ staffId: 1 });

// Pre-save middleware to calculate estimated completion time
OrderSchema.pre('save', function(next) {
  if (this.isNew && !this.estimatedCompletionTime) {
    // Calculate estimated completion time based on item preparation times
    // This would require populated menu items to get preparation times
    const baseTime = 15; // 15 minute default
    const itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
    const estimatedMinutes = Math.max(baseTime, itemCount * 3); // 3 minutes per item minimum
    
    this.estimatedCompletionTime = new Date(Date.now() + estimatedMinutes * 60000);
  }
  next();
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);