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

export interface User {
  username: string;
  password: string;
  isAdmin: boolean;
}

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface DatabaseBackup {
  version: string;
  timestamp: string;
  products: Product[];
  users: Omit<User, 'password'>[];
}
