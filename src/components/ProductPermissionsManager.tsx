import { useState, useMemo } from 'react';
import { Product, User, ProductPermission, UserProductPermissions } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lock, Package, Eye, Pencil, Trash, CheckSquare, Square, MagnifyingGlass } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface ProductPermissionsManagerProps {
  user: User;
  products: Product[];
  onUpdatePermissions: (permissions: UserProductPermissions[]) => void;
  onClose: () => void;
}

export function ProductPermissionsManager({
  user,
  products,
  onUpdatePermissions,
  onClose,
}: ProductPermissionsManagerProps) {
  const [permissions, setPermissions] = useState<UserProductPermissions[]>(
    user.productPermissions || []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const hasPermission = (productId: string, permission: ProductPermission): boolean => {
    const productPerms = permissions.find((p) => p.productId === productId);
    return productPerms?.permissions.includes(permission) ?? false;
  };

  const togglePermission = (productId: string, permission: ProductPermission) => {
    setPermissions((current) => {
      const existing = current.find((p) => p.productId === productId);
      
      if (existing) {
        if (existing.permissions.includes(permission)) {
          const updatedPerms = existing.permissions.filter((p) => p !== permission);
          if (updatedPerms.length === 0) {
            return current.filter((p) => p.productId !== productId);
          }
          return current.map((p) =>
            p.productId === productId ? { ...p, permissions: updatedPerms } : p
          );
        } else {
          return current.map((p) =>
            p.productId === productId
              ? { ...p, permissions: [...p.permissions, permission] }
              : p
          );
        }
      } else {
        return [...current, { productId, permissions: [permission] }];
      }
    });
  };

  const toggleAllPermissions = (permission: ProductPermission, checked: boolean) => {
    if (checked) {
      const newPermissions = [...permissions];
      filteredProducts.forEach((product) => {
        const existing = newPermissions.find((p) => p.productId === product.id);
        if (existing) {
          if (!existing.permissions.includes(permission)) {
            existing.permissions = [...existing.permissions, permission];
          }
        } else {
          newPermissions.push({ productId: product.id, permissions: [permission] });
        }
      });
      setPermissions(newPermissions);
    } else {
      setPermissions((current) => {
        const productIds = new Set(filteredProducts.map((p) => p.id));
        return current
          .map((p) => {
            if (productIds.has(p.productId)) {
              return {
                ...p,
                permissions: p.permissions.filter((perm) => perm !== permission),
              };
            }
            return p;
          })
          .filter((p) => p.permissions.length > 0);
      });
    }
  };

  const grantAllAccess = () => {
    const allPermissions: UserProductPermissions[] = filteredProducts.map((product) => ({
      productId: product.id,
      permissions: ['view', 'edit', 'delete'] as ProductPermission[],
    }));
    setPermissions(allPermissions);
    toast.success('Acceso total concedido a todos los productos visibles');
  };

  const revokeAllAccess = () => {
    const productIds = new Set(filteredProducts.map((p) => p.id));
    setPermissions((current) => current.filter((p) => !productIds.has(p.productId)));
    toast.success('Todos los permisos revocados de los productos visibles');
  };

  const handleSave = () => {
    onUpdatePermissions(permissions);
    toast.success(`Permisos actualizados para ${user.username}`);
    onClose();
  };

  const productsWithAnyPermission = permissions.length;
  const productsWithEditPermission = permissions.filter((p) =>
    p.permissions.includes('edit')
  ).length;
  const productsWithDeletePermission = permissions.filter((p) =>
    p.permissions.includes('delete')
  ).length;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" weight="duotone" />
            Permisos Granulares para {user.username}
          </DialogTitle>
          <DialogDescription>
            Configure qué productos puede ver, editar o eliminar este usuario
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Con permisos</p>
                  <p className="text-lg font-semibold">{productsWithAnyPermission}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Puede editar</p>
                  <p className="text-lg font-semibold">{productsWithEditPermission}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Trash className="w-4 h-4 text-destructive" />
                <div>
                  <p className="text-xs text-muted-foreground">Puede eliminar</p>
                  <p className="text-lg font-semibold">{productsWithDeletePermission}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos por nombre, SKU o categoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" onClick={grantAllAccess}>
              <CheckSquare className="w-4 h-4 mr-2" />
              Conceder Todo
            </Button>
            <Button variant="outline" size="sm" onClick={revokeAllAccess}>
              <Square className="w-4 h-4 mr-2" />
              Revocar Todo
            </Button>
          </div>

          <div className="rounded-lg border">
            <div className="grid grid-cols-12 gap-4 p-3 bg-muted/50 border-b font-semibold text-sm">
              <div className="col-span-5">Producto</div>
              <div className="col-span-2 text-center flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                Ver
              </div>
              <div className="col-span-2 text-center flex items-center justify-center gap-2">
                <Pencil className="w-4 h-4" />
                Editar
              </div>
              <div className="col-span-2 text-center flex items-center justify-center gap-2">
                <Trash className="w-4 h-4" />
                Eliminar
              </div>
              <div className="col-span-1"></div>
            </div>

            <div className="border-b p-3 bg-secondary/30">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-5 text-sm font-medium">
                  Seleccionar todo ({filteredProducts.length} productos)
                </div>
                <div className="col-span-2 flex justify-center">
                  <Checkbox
                    checked={filteredProducts.every((p) => hasPermission(p.id, 'view'))}
                    onCheckedChange={(checked) =>
                      toggleAllPermissions('view', checked === true)
                    }
                  />
                </div>
                <div className="col-span-2 flex justify-center">
                  <Checkbox
                    checked={filteredProducts.every((p) => hasPermission(p.id, 'edit'))}
                    onCheckedChange={(checked) =>
                      toggleAllPermissions('edit', checked === true)
                    }
                  />
                </div>
                <div className="col-span-2 flex justify-center">
                  <Checkbox
                    checked={filteredProducts.every((p) => hasPermission(p.id, 'delete'))}
                    onCheckedChange={(checked) =>
                      toggleAllPermissions('delete', checked === true)
                    }
                  />
                </div>
              </div>
            </div>

            <ScrollArea className="h-[350px]">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No se encontraron productos</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-muted/30 transition-colors">
                      <div className="col-span-5">
                        <div className="flex items-start gap-2">
                          <Package className="w-4 h-4 mt-1 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{product.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                                {product.sku}
                              </code>
                              <Badge variant="outline" className="text-xs">
                                {product.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <Checkbox
                          checked={hasPermission(product.id, 'view')}
                          onCheckedChange={() => togglePermission(product.id, 'view')}
                        />
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <Checkbox
                          checked={hasPermission(product.id, 'edit')}
                          onCheckedChange={() => togglePermission(product.id, 'edit')}
                        />
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <Checkbox
                          checked={hasPermission(product.id, 'delete')}
                          onCheckedChange={() => togglePermission(product.id, 'delete')}
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        {permissions.find((p) => p.productId === product.id)?.permissions.length ===
                          3 && (
                          <Badge variant="default" className="text-xs">
                            Total
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Los usuarios sin permisos específicos no podrán ver, editar ni eliminar esos productos.
              Los administradores siempre tienen acceso completo.
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Lock className="w-4 h-4 mr-2" />
            Guardar Permisos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
