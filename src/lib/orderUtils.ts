// src/lib/orderUtils.ts
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}${random}`;
}

export function calculateOrderTotal(
  items: Array<{ price: number; quantity: number }>,
  taxRate: number = 0.08,
  discountAmount: number = 0
) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const taxes = discountedSubtotal * taxRate;
  const total = discountedSubtotal + taxes;

  return {
    subtotal,
    taxes: Number(taxes.toFixed(2)),
    total: Number(total.toFixed(2))
  };
}

export function getOrderStatusColor(status: string): string {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
    preparing: 'bg-orange-100 text-orange-800 border-orange-300',
    ready: 'bg-purple-100 text-purple-800 border-purple-300',
    served: 'bg-green-100 text-green-800 border-green-300',
    completed: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300'
  };

  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-300';
}

export function getOrderTypeLabel(orderType: string): string {
  const labels = {
    dine_in: 'Dine In',
    takeout: 'Takeout',
    delivery: 'Delivery'
  };

  return labels[orderType as keyof typeof labels] || orderType;
}

export function calculateOrderProgress(order: {
  status: string;
  timestamps: {
    ordered: Date;
    confirmed?: Date;
    preparing?: Date;
    ready?: Date;
    served?: Date;
    completed?: Date;
  };
}): number {
  const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed'];
  const currentIndex = statusOrder.indexOf(order.status);
  
  if (currentIndex === -1) return 0;
  
  return Math.round(((currentIndex + 1) / statusOrder.length) * 100);
}

export function getEstimatedCompletionTime(
  orderTime: Date,
  items: Array<{ preparationTime?: number; quantity: number }>
): Date {
  const totalPrepTime = items.reduce((total, item) => {
    return total + ((item.preparationTime || 10) * item.quantity);
  }, 0);
  
  // Add 5 minutes buffer time
  const estimatedMinutes = totalPrepTime + 5;
  
  return new Date(orderTime.getTime() + estimatedMinutes * 60000);
}

export function isOrderDelayed(
  orderTime: Date,
  currentTime: Date,
  estimatedTime: number
): boolean {
  const elapsedMinutes = (currentTime.getTime() - orderTime.getTime()) / 60000;
  return elapsedMinutes > estimatedTime + 5; // 5 minute buffer
}

export function formatOrderDuration(startTime: Date, endTime?: Date): string {
  const end = endTime || new Date();
  const durationMs = end.getTime() - startTime.getTime();
  const minutes = Math.floor(durationMs / 60000);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  
  return `${minutes}m`;
}

export function getOrderPriorityLevel(order: {
  orderType: string;
  estimatedTime: number;
  orderTime: Date;
  customerType?: 'vip' | 'regular';
}): 'low' | 'normal' | 'high' | 'urgent' {
  const currentTime = new Date();
  const elapsedMinutes = (currentTime.getTime() - order.orderTime.getTime()) / 60000;
  
  // VIP customers get higher priority
  if (order.customerType === 'vip') {
    return 'high';
  }
  
  // Delivery orders that are late become urgent
  if (order.orderType === 'delivery' && elapsedMinutes > order.estimatedTime + 10) {
    return 'urgent';
  }
  
  // Orders running late get high priority
  if (elapsedMinutes > order.estimatedTime) {
    return 'high';
  }
  
  // Quick orders (< 15 min) get normal priority
  if (order.estimatedTime <= 15) {
    return 'normal';
  }
  
  return 'low';
}