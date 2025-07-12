import mongoose, { Schema, Document } from "mongoose";
export interface IRestaurant extends Document {
  _id: string;
  name: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  // Keep backward compatibility with old field names
  phone: string;
  email: string;
  businessHours: {
    monday: { open: string; close: string; isClosed: boolean };
    tuesday: { open: string; close: string; isClosed: boolean };
    wednesday: { open: string; close: string; isClosed: boolean };
    thursday: { open: string; close: string; isClosed: boolean };
    friday: { open: string; close: string; isClosed: boolean };
    saturday: { open: string; close: string; isClosed: boolean };
    sunday: { open: string; close: string; isClosed: boolean };
  };
  // Keep backward compatibility
  operatingHours: {
    monday?: { open: string; close: string; isClosed?: boolean; };
    tuesday?: { open: string; close: string; isClosed?: boolean; };
    wednesday?: { open: string; close: string; isClosed?: boolean; };
    thursday?: { open: string; close: string; isClosed?: boolean; };
    friday?: { open: string; close: string; isClosed?: boolean; };
    saturday?: { open: string; close: string; isClosed?: boolean; };
    sunday?: { open: string; close: string; isClosed?: boolean; };
  };
  cuisine: string[];
  priceRange: 'budget' | 'mid' | 'upscale' | 'fine_dining';
  capacity: number;
  averageRating: number;
  totalReviews: number;
  features: string[];
  paymentMethods: string[];
  deliveryOptions: string[];
  taxRate: number;
  serviceChargeRate: number;
  // Keep backward compatibility
  taxRates: {
    salesTax: number;
    serviceTax?: number;
    vat?: number;
  };
  settings: {
    currency: string;
    timezone: string;
    language: string;
    dateFormat: string;
  };
  currency: string;
  timezone: string;
  ownerId: string;
  staffCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  contactInfo: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String }
  },
  // Keep backward compatibility
  phone: { type: String, required: true },
  email: { type: String, required: true },
  businessHours: {
    monday: { open: { type: String, default: '09:00' }, close: { type: String, default: '22:00' }, isClosed: { type: Boolean, default: false } },
    tuesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '22:00' }, isClosed: { type: Boolean, default: false } },
    wednesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '22:00' }, isClosed: { type: Boolean, default: false } },
    thursday: { open: { type: String, default: '09:00' }, close: { type: String, default: '22:00' }, isClosed: { type: Boolean, default: false } },
    friday: { open: { type: String, default: '09:00' }, close: { type: String, default: '22:00' }, isClosed: { type: Boolean, default: false } },
    saturday: { open: { type: String, default: '09:00' }, close: { type: String, default: '22:00' }, isClosed: { type: Boolean, default: false } },
    sunday: { open: { type: String, default: '09:00' }, close: { type: String, default: '22:00' }, isClosed: { type: Boolean, default: false } }
  },
  // Keep backward compatibility
  operatingHours: {
    monday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    friday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, isClosed: { type: Boolean, default: false } }
  },
  cuisine: [{ type: String }],
  priceRange: { 
    type: String, 
    enum: ['budget', 'mid', 'upscale', 'fine_dining'],
    default: 'mid'
  },
  capacity: { type: Number, default: 50 },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  features: [{ type: String }],
  paymentMethods: [{ type: String, default: ['cash', 'card'] }],
  deliveryOptions: [{ type: String, default: ['pickup'] }],
  taxRate: { type: Number, default: 8.5, min: 0, max: 100 },
  serviceChargeRate: { type: Number, default: 0, min: 0, max: 100 },
  // Keep backward compatibility
  taxRates: {
    salesTax: { type: Number, default: 0.085, min: 0, max: 1 },
    serviceTax: { type: Number, default: 0, min: 0, max: 1 },
    vat: { type: Number, default: 0, min: 0, max: 1 }
  },
  settings: {
    currency: { type: String, default: 'USD' },
    timezone: { type: String, default: 'America/New_York' },
    language: { type: String, default: 'en' },
    dateFormat: { type: String, default: 'MM/dd/yyyy' }
  },
  currency: { type: String, default: 'USD' },
  timezone: { type: String, default: 'America/New_York' },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  staffCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Create indexes for better query performance
RestaurantSchema.index({ ownerId: 1 });
RestaurantSchema.index({ 'address.city': 1 });
RestaurantSchema.index({ 'address.state': 1 });
RestaurantSchema.index({ cuisine: 1 });
RestaurantSchema.index({ isActive: 1 });

// Pre-save middleware to sync contactInfo with backward compatibility fields
RestaurantSchema.pre('save', function(next) {
  if (this.contactInfo) {
    this.phone = this.contactInfo.phone;
    this.email = this.contactInfo.email;
  }
  
  // Sync businessHours with operatingHours for backward compatibility
  if (this.businessHours) {
    this.operatingHours = this.businessHours;
  }
  
  next();
});

export default mongoose.models.Restaurant || mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
