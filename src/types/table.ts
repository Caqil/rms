export interface Table {
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
  createdAt: string;
  updatedAt: string;
}
