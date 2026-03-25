import { Product } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Warning, X, Package, TrendDown } from '@phosphor-icons/react';
import { getStockStatus, formatCurrency } from '@/lib/inventory-utils';
import { motion, AnimatePresence } from 'framer-motion';

interface CriticalStockAlertProps {
  products: Product[];
  onDismiss: (productId: string) => void;
  dismissedAlerts: string[];
}

export function CriticalStockAlert({ products, onDismiss, dismissedAlerts }: CriticalStockAlertProps) {
  const criticalProducts = products.filter((p) => {
    const status = getStockStatus(p.quantity);
    return (status === 'low-stock' || status === 'out-of-stock') && !dismissedAlerts.includes(p.id);
  });

  if (criticalProducts.length === 0) return null;

  const outOfStock = criticalProducts.filter((p) => p.quantity === 0);
  const lowStock = criticalProducts.filter((p) => p.quantity > 0 && p.quantity < 3);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="mb-6 border-warning bg-warning/5">
          <div className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                <Warning className="w-6 h-6 text-warning" weight="fill" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      Alerta de Stock Crítico
                      <Badge variant="outline" className="bg-warning text-warning-foreground">
                        {criticalProducts.length} {criticalProducts.length === 1 ? 'producto' : 'productos'}
                      </Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {outOfStock.length > 0 && (
                        <span className="text-destructive font-medium">
                          {outOfStock.length} sin stock
                        </span>
                      )}
                      {outOfStock.length > 0 && lowStock.length > 0 && ' · '}
                      {lowStock.length > 0 && (
                        <span className="text-warning font-medium">
                          {lowStock.length} con stock bajo
                        </span>
                      )}
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Warning className="w-5 h-5 text-warning" weight="fill" />
                          Productos con Stock Crítico
                        </DialogTitle>
                        <DialogDescription>
                          Revise y gestione los productos que requieren atención inmediata
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-3">
                          {outOfStock.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <TrendDown className="w-5 h-5 text-destructive" weight="bold" />
                                <h4 className="font-semibold text-destructive">Sin Stock ({outOfStock.length})</h4>
                              </div>
                              <div className="space-y-2 mb-6">
                                {outOfStock.map((product) => (
                                  <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-3 border-l-4 border-destructive bg-destructive/5 rounded-r-lg"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <Package className="w-4 h-4 text-destructive" weight="duotone" />
                                          <p className="font-semibold">{product.name}</p>
                                          <Badge variant="outline" className="text-xs font-mono">
                                            {product.sku}
                                          </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-0.5">
                                          <p>Categoría: {product.category}</p>
                                          <p>Proveedor: {product.supplier}</p>
                                          <p>Precio: {formatCurrency(product.price)}</p>
                                        </div>
                                        <Badge className="mt-2 bg-destructive text-destructive-foreground">
                                          AGOTADO - Reabastecer urgentemente
                                        </Badge>
                                      </div>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => onDismiss(product.id)}
                                        className="h-8 w-8 flex-shrink-0"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {lowStock.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Warning className="w-5 h-5 text-warning" weight="fill" />
                                <h4 className="font-semibold text-warning">Stock Bajo ({lowStock.length})</h4>
                              </div>
                              <div className="space-y-2">
                                {lowStock.map((product) => (
                                  <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-3 border-l-4 border-warning bg-warning/5 rounded-r-lg"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <Package className="w-4 h-4 text-warning" weight="duotone" />
                                          <p className="font-semibold">{product.name}</p>
                                          <Badge variant="outline" className="text-xs font-mono">
                                            {product.sku}
                                          </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-0.5">
                                          <p>Categoría: {product.category}</p>
                                          <p>Proveedor: {product.supplier}</p>
                                          <p>Precio: {formatCurrency(product.price)}</p>
                                        </div>
                                        <Badge className="mt-2 bg-warning text-warning-foreground">
                                          Quedan {product.quantity} unidades
                                        </Badge>
                                      </div>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => onDismiss(product.id)}
                                        className="h-8 w-8 flex-shrink-0"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {criticalProducts.slice(0, 3).map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between p-2 bg-card rounded-lg border text-sm"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Package className={`w-4 h-4 flex-shrink-0 ${product.quantity === 0 ? 'text-destructive' : 'text-warning'}`} weight="duotone" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.quantity} unidades</p>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDismiss(product.id)}
                        className="h-6 w-6 flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
                {criticalProducts.length > 3 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Y {criticalProducts.length - 3} productos más con stock crítico
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
