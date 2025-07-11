import mongoose, { Schema } from "mongoose";

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
    menuItemId: string;
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
  customerNotes: { type: String }
}, {
  timestamps: true
});

OrderSchema.index({ restaurantId: 1, status: 1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
