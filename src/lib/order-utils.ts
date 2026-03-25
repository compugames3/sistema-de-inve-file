import { Order, OrderType, OrderStatus } from './types';

export function generateOrderNumber(type: OrderType): string {
  const prefix = type === 'sale' ? 'VNT' : 'CMP';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function getOrderStatusBadgeVariant(status: OrderStatus): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'completed':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
  }
}

export function getOrderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'completed':
      return 'Completada';
    case 'pending':
      return 'Pendiente';
    case 'cancelled':
      return 'Cancelada';
  }
}

export function getOrderTypeLabel(type: OrderType): string {
  return type === 'sale' ? 'Venta' : 'Compra';
}

export function calculateOrderTotal(items: { quantity: number; unitPrice: number }[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}
