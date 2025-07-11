import mongoose, { Schema } from "mongoose";
export interface IRestaurant extends Document {
  _id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  email: string;
  settings: {
    currency: string;
    timezone: string;
    language: string;
    dateFormat: string;
  };
  operatingHours: {
    monday?: { open: string; close: string; isClosed?: boolean; };
    tuesday?: { open: string; close: string; isClosed?: boolean; };
    wednesday?: { open: string; close: string; isClosed?: boolean; };
    thursday?: { open: string; close: string; isClosed?: boolean; };
    friday?: { open: string; close: string; isClosed?: boolean; };
    saturday?: { open: string; close: string; isClosed?: boolean; };
    sunday?: { open: string; close: string; isClosed?: boolean; };
  };
  taxRates: {
    salesTax: number;
    serviceTax?: number;
    vat?: number;
  };
  paymentMethods: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSchema = new Schema({
  name: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  settings: {
    currency: { type: String, default: 'USD' },
    timezone: { type: String, default: 'UTC' },
    language: { type: String, default: 'en' },
    dateFormat: { type: String, default: 'MM/dd/yyyy' }
  },
  operatingHours: {
    monday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    friday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, isClosed: { type: Boolean, default: false } }
  },
  taxRates: {
    salesTax: { type: Number, required: true, min: 0, max: 1 },
    serviceTax: { type: Number, min: 0, max: 1 },
    vat: { type: Number, min: 0, max: 1 }
  },
  paymentMethods: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.models.Restaurant || mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
