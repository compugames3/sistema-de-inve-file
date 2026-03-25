import { User, Product, ProductPermission } from '@/lib/types';

export function hasProductPermission(
  user: User | null,
  product: Product,
  permission: ProductPermission
): boolean {
  if (!user) return false;
  
  if (user.isAdmin) return true;
  
  if (!user.productPermissions || user.productPermissions.length === 0) {
    return false;
  }
  
  const productPerms = user.productPermissions.find((p) => p.productId === product.id);
  return productPerms?.permissions.includes(permission) ?? false;
}

export function canViewProduct(user: User | null, product: Product): boolean {
  return hasProductPermission(user, product, 'view');
}

export function canEditProduct(user: User | null, product: Product): boolean {
  return hasProductPermission(user, product, 'edit');
}

export function canDeleteProduct(user: User | null, product: Product): boolean {
  return hasProductPermission(user, product, 'delete');
}

export function filterVisibleProducts(user: User | null, products: Product[]): Product[] {
  if (!user) return [];
  
  if (user.isAdmin) return products;
  
  if (!user.productPermissions || user.productPermissions.length === 0) {
    return [];
  }
  
  return products.filter((product) => canViewProduct(user, product));
}
