import { useOrderStore } from '@/stores/orderStore';
import { useApiMutation } from './useApi';
import { CreateOrderInput } from '@/lib/validations';

export function useOrders() {
  const orderStore = useOrderStore();
  
  const { mutate: createOrder, loading: creatingOrder } = useApiMutation<CreateOrderInput, any>(
    '/api/orders',
    'POST'
  );

  const processOrder = async (paymentInfo: any) => {
    const orderData: CreateOrderInput = {
      restaurantId: '', // Will be set by API from session
      items: orderStore.currentOrder.items.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price,
        specialInstructions: item.specialInstructions,
        modifications: item.modifications,
      })),
      orderType: orderStore.currentOrder.orderType,
      tableNumber: orderStore.currentOrder.tableNumber,
      customerInfo: orderStore.currentOrder.customerInfo,
      discounts: orderStore.currentOrder.discounts,
      tips: orderStore.currentOrder.tips,
      paymentInfo,
      customerNotes: '',
    };

    const result = await createOrder(orderData);
    
    if (result) {
      orderStore.clearOrder();
      return result;
    }
    
    return null;
  };

  return {
    ...orderStore,
    processOrder,
    creatingOrder,
  };
}