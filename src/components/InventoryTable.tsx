import { useState } from 'react';
import { Product, User } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PencilSimple, Trash, MagnifyingGlass, Package, Lock } from '@phosphor-icons/react';
import { getStockStatus, getStockBadgeStyles, getStockLabel, formatCurrency } from '@/lib/inventory-utils';
import { canEditProduct, canDeleteProduct } from '@/lib/permissions-utils';
import { Card } from '@/components/ui/card';

interface InventoryTableProps {
  products: Product[];
  currentUser?: User | null;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export function InventoryTable({ products, currentUser, onEdit, onDelete }: InventoryTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const isAdmin = currentUser?.isAdmin ?? false;

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.supplier.toLowerCase().includes(query)
    );
  });

  if (products.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <Package className="w-10 h-10 text-muted-foreground" weight="duotone" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">No hay productos en el inventario</h3>
            <p className="text-sm text-muted-foreground">
              Comience agregando su primer producto usando el botón "Agregar Producto"
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          id="search-inventory"
          type="text"
          placeholder="Buscar por nombre, SKU, categoría o proveedor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No se encontraron productos que coincidan con "{searchQuery}"
          </p>
        </Card>
      ) : (
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">SKU</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Estado</TableHead>
                  {(onEdit || onDelete) && (
                    <TableHead className="text-right w-[120px]">Acciones</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product.quantity);
                  const canEdit = isAdmin || (currentUser && canEditProduct(currentUser, product));
                  const canDelete = isAdmin || (currentUser && canDeleteProduct(currentUser, product));
                  
                  return (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{product.category}</TableCell>
                      <TableCell className="text-right font-mono">{product.quantity}</TableCell>
                      <TableCell className="text-muted-foreground">{product.supplier}</TableCell>
                      <TableCell>
                        <Badge className={getStockBadgeStyles(status)}>
                          {getStockLabel(status)}
                        </Badge>
                      </TableCell>
                      {(onEdit || onDelete) && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {onEdit && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => onEdit(product)}
                                      className={`h-8 w-8 ${!canEdit ? 'opacity-40' : ''}`}
                                      disabled={!canEdit && !isAdmin}
                                    >
                                      {!canEdit && !isAdmin ? (
                                        <Lock className="w-4 h-4 text-muted-foreground" />
                                      ) : (
                                        <PencilSimple className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  {!canEdit && !isAdmin && (
                                    <TooltipContent>
                                      <p>Sin permiso de edición</p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            {onDelete && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => onDelete(product.id)}
                                      className={`h-8 w-8 ${!canDelete ? 'opacity-40' : 'text-destructive hover:text-destructive'}`}
                                      disabled={!canDelete && !isAdmin}
                                    >
                                      {!canDelete && !isAdmin ? (
                                        <Lock className="w-4 h-4 text-muted-foreground" />
                                      ) : (
                                        <Trash className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  {!canDelete && !isAdmin && (
                                    <TooltipContent>
                                      <p>Sin permiso de eliminación</p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Mostrando {filteredProducts.length} de {products.length} productos
      </p>
    </div>
  );
}
