import { Product, StockStatus } from './types';

export const getStockStatus = (quantity: number): StockStatus => {
  if (quantity === 0) return 'out-of-stock';
  if (quantity < 3) return 'low-stock';
  return 'in-stock';
};

export const getStockBadgeStyles = (status: StockStatus) => {
  switch (status) {
    case 'out-of-stock':
      return 'bg-destructive text-destructive-foreground';
    case 'low-stock':
      return 'bg-warning text-warning-foreground';
    case 'in-stock':
      return 'bg-success text-success-foreground';
  }
};

export const getStockLabel = (status: StockStatus): string => {
  switch (status) {
    case 'out-of-stock':
      return 'Sin Stock';
    case 'low-stock':
      return 'Stock Bajo';
    case 'in-stock':
      return 'En Stock';
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const exportToCSV = (products: Product[]): void => {
  const headers = ['SKU', 'Nombre', 'Categoría', 'Cantidad', 'Precio', 'Proveedor', 'Descripción'];
  const rows = products.map(p => [
    p.sku,
    p.name,
    p.category,
    p.quantity.toString(),
    p.price.toString(),
    p.supplier,
    p.description || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `inventario_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};
