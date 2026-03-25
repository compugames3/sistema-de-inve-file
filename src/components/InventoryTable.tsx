import { useState } from 'react';
import { Product } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PencilSimple, Trash, MagnifyingGlass, Package } from '@phosphor-icons/react';
import { getStockStatus, getStockBadgeStyles, getStockLabel, formatCurrency } from '@/lib/inventory-utils';
import { Card } from '@/components/ui/card';

interface InventoryTableProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export function InventoryTable({ products, onEdit, onDelete }: InventoryTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

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
                  <TableHead className="text-right">Precio</TableHead>
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
                  return (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground">{product.category}</TableCell>
                      <TableCell className="text-right font-mono">{product.quantity}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(product.price)}
                      </TableCell>
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
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => onEdit(product)}
                                className="h-8 w-8"
                              >
                                <PencilSimple className="w-4 h-4" />
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => onDelete(product.id)}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
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
