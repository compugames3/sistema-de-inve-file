import { useState } from 'react';
import { Product, User } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PencilSimple, Trash, MagnifyingGlass, Package, Lock, Barcode, Tag, Stack, User as UserIconPh } from '@phosphor-icons/react';
import { getStockStatus, getStockBadgeStyles, getStockLabel, formatCurrency } from '@/lib/inventory-utils';
import { canEditProduct, canDeleteProduct } from '@/lib/permissions-utils';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

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

  const isMobile = useIsMobile();

  if (products.length === 0) {
    return (
      <Card className="p-8 sm:p-12 text-center">
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted flex items-center justify-center">
            <Package className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" weight="duotone" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-1">No hay productos en el inventario</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Comience agregando su primer producto usando el botón "Agregar Producto"
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          id="search-inventory"
          type="text"
          placeholder={isMobile ? "Buscar..." : "Buscar por nombre, SKU, categoría o proveedor..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-10 sm:h-11"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <Card className="p-6 sm:p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No se encontraron productos que coincidan con "{searchQuery}"
          </p>
        </Card>
      ) : (
        <>
          {isMobile ? (
            <div className="space-y-3">
              {filteredProducts.map((product) => {
                const status = getStockStatus(product.quantity);
                const canEdit = isAdmin || (currentUser && canEditProduct(currentUser, product));
                const canDelete = isAdmin || (currentUser && canDeleteProduct(currentUser, product));
                
                return (
                  <Card key={product.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-base text-foreground truncate mb-1">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={getStockBadgeStyles(status)}>
                              {getStockLabel(status)}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">
                              SKU: {product.sku}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-bold font-mono text-foreground">
                            {product.quantity}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            unidades
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                        <div className="flex items-start gap-2">
                          <Tag className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" weight="duotone" />
                          <div className="min-w-0">
                            <div className="text-xs text-muted-foreground">Categoría</div>
                            <div className="text-sm font-medium truncate">{product.category}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <UserIconPh className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" weight="duotone" />
                          <div className="min-w-0">
                            <div className="text-xs text-muted-foreground">Proveedor</div>
                            <div className="text-sm font-medium truncate">{product.supplier}</div>
                          </div>
                        </div>
                      </div>

                      {(onEdit || onDelete) && (
                        <div className="flex gap-2 pt-2 border-t">
                          {onEdit && (
                            <Button
                              variant={canEdit ? "outline" : "ghost"}
                              size="sm"
                              onClick={() => onEdit(product)}
                              className="flex-1"
                              disabled={!canEdit && !isAdmin}
                            >
                              {!canEdit && !isAdmin ? (
                                <>
                                  <Lock className="w-4 h-4 mr-2" />
                                  Sin permiso
                                </>
                              ) : (
                                <>
                                  <PencilSimple className="w-4 h-4 mr-2" />
                                  Editar
                                </>
                              )}
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant={canDelete ? "outline" : "ghost"}
                              size="sm"
                              onClick={() => onDelete(product.id)}
                              className={`flex-1 ${canDelete ? 'text-destructive hover:bg-destructive/10' : ''}`}
                              disabled={!canDelete && !isAdmin}
                            >
                              {!canDelete && !isAdmin ? (
                                <>
                                  <Lock className="w-4 h-4 mr-2" />
                                  Bloqueado
                                </>
                              ) : (
                                <>
                                  <Trash className="w-4 h-4 mr-2" />
                                  Eliminar
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
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
        </>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Mostrando {filteredProducts.length} de {products.length} productos
      </p>
    </div>
  );
}
