import mongoose, { Schema, Document } from 'mongoose';

export interface ITable extends Document {
  _id: string;
  number: string;
  capacity: number;
  section?: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  currentOrderId?: string;
  reservationId?: string;
  estimatedDuration?: number;
  restaurantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema({
  number: { type: String, required: true },
  capacity: { type: Number, required: true, min: 1, max: 20 },
  section: { type: String },
  status: { 
    type: String, 
    enum: ['available', 'occupied', 'reserved', 'cleaning'],
    default: 'available'
  },
  currentOrderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  reservationId: { type: Schema.Types.ObjectId, ref: 'Reservation' },
  estimatedDuration: { type: Number },
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

TableSchema.index({ restaurantId: 1, number: 1 }, { unique: true });
TableSchema.index({ status: 1 });

export default mongoose.models.Table || mongoose.model<ITable>('Table', TableSchema);
