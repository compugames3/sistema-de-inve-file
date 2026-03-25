export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplier: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductPermission = 'view' | 'edit' | 'delete';

export interface UserProductPermissions {
  productId: string;
  permissions: ProductPermission[];
}

export type TabPermission = 'inventory' | 'orders' | 'dailyclose' | 'users';

export interface User {
  username: string;
  password: string;
  isAdmin: boolean;
  productPermissions?: UserProductPermissions[];
  tabPermissions?: TabPermission[];
}

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';

export interface AuditLog {
  id: string;
  timestamp: string;
  username: string;
  action: AuditAction;
  entityType: 'product' | 'user' | 'backup';
  entityId: string;
  entityName: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export interface DatabaseBackup {
  version: string;
  timestamp: string;
  products: Product[];
  users: Omit<User, 'password'>[];
  auditLogs?: AuditLog[];
  checksum?: string;
  metadata?: {
    productsCount: number;
    usersCount: number;
    totalValue: number;
    categories: string[];
  };
}

export interface BackupMetadata {
  filename: string;
  timestamp: string;
  size: number;
  productsCount: number;
  checksum: string;
}

export type OrderType = 'sale' | 'purchase';
export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  type: OrderType;
  status: OrderStatus;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  client?: string;
  supplier?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface DailyCloseReport {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  closedBy: string;
  
  sales: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    totalItems: number;
    averageOrderValue: number;
  };
  
  purchases: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    totalCost: number;
    totalItems: number;
    averageOrderValue: number;
  };
  
  inventory: {
    totalProducts: number;
    totalValue: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    categoriesCount: number;
  };
  
  financial: {
    grossRevenue: number;
    totalCosts: number;
    netProfit: number;
    profitMargin: number;
  };
  
  topProducts: {
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }[];
}
