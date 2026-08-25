// Centralized Order Status Constants & Helpers for BuyZo Cross-Portal Synchronization

export const ORDER_STATUSES = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED',
  REFUNDED: 'REFUNDED'
};

export const ORDER_STATUS_LABELS = {
  PENDING: 'Pending Payment',
  CONFIRMED: 'Order Confirmed',
  PROCESSING: 'Processing in Warehouse',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned',
  REFUNDED: 'Refunded'
};

export const ORDER_STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  PROCESSING: 'bg-purple-100 text-purple-800 border-purple-200',
  SHIPPED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  OUT_FOR_DELIVERY: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-rose-100 text-rose-800 border-rose-200',
  RETURNED: 'bg-orange-100 text-orange-800 border-orange-200',
  REFUNDED: 'bg-gray-100 text-gray-800 border-gray-200'
};

export function getOrderStatusLabel(status = '') {
  const normalized = (status || '').toUpperCase();
  return ORDER_STATUS_LABELS[normalized] || status || 'Confirmed';
}

export function getOrderStatusColor(status = '') {
  const normalized = (status || '').toUpperCase();
  return ORDER_STATUS_COLORS[normalized] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function canCustomerCancelOrder(status = '') {
  const normalized = (status || '').toUpperCase();
  return ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(normalized);
}
