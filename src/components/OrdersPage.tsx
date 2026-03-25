import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Order, OrderType, Product, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { OrderForm } from '@/components/OrderForm';
import { Plus, ShoppingCart, ShoppingBag, Eye, CheckCircle, XCircle, Receipt } from '@phosphor-icons/react';
import { generateOrderNumber, getOrderStatusBadgeVariant, getOrderStatusLabel, getOrderTypeLabel } from '@/lib/order-utils';
import { generateId, formatCurrency } from '@/lib/inventory-utils';
import { toast } from 'sonner';

interface OrdersPageProps {
  products: Product[];
  currentUser: User;
  onUpdateProducts: (updater: (products: Product[]) => Product[]) => void;
}

export function OrdersPage({ products, currentUser, onUpdateProducts }: OrdersPageProps) {
  const [orders, setOrders] = useKV<Order[]>('system-orders', []);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('sale');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [completingOrderId, setCompletingOrderId] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  const safeOrders = orders || [];
  const isAdmin = currentUser?.isAdmin ?? false;

  const openCreateDialog = (type: OrderType) => {
    setOrderType(type);
    setIsCreateDialogOpen(true);
  };

  const handleCreateOrder = (data: {
    items: Order['items'];
    total: number;
    client?: string;
    supplier?: string;
    notes?: string;
  }) => {
    const newOrder: Order = {
      id: generateId(),
      type: orderType,
      status: 'pending',
      orderNumber: generateOrderNumber(orderType),
      items: data.items,
      total: data.total,
      client: data.client,
      supplier: data.supplier,
      notes: data.notes,
      createdBy: currentUser?.username || 'unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders((current) => [...(current || []), newOrder]);
    setIsCreateDialogOpen(false);
    toast.success(`${orderType === 'sale' ? 'Venta' : 'Compra'} creada exitosamente - ${newOrder.orderNumber}`);
  };

  const handleCompleteOrder = () => {
    if (!completingOrderId) return;

    const order = safeOrders.find((o) => o.id === completingOrderId);
    if (!order) return;

    if (order.type === 'sale') {
      const productsToUpdate = [...(products || [])];
      let hasError = false;

      for (const item of order.items) {
        const product = productsToUpdate.find((p) => p.id === item.productId);
        if (!product) {
          toast.error(`Producto ${item.productName} no encontrado`);
          hasError = true;
          break;
        }

        if (product.quantity < item.quantity) {
          toast.error(`Stock insuficiente para ${product.name}. Disponible: ${product.quantity}, Requerido: ${item.quantity}`);
          hasError = true;
          break;
        }
      }

      if (hasError) {
        setCompletingOrderId(null);
        return;
      }

      onUpdateProducts((currentProducts) => 
        currentProducts.map((p) => {
          const orderItem = order.items.find((item) => item.productId === p.id);
          if (orderItem) {
            return {
              ...p,
              quantity: p.quantity - orderItem.quantity,
              updatedAt: new Date().toISOString(),
            };
          }
          return p;
        })
      );
    }

    if (order.type === 'purchase') {
      onUpdateProducts((currentProducts) => 
        currentProducts.map((p) => {
          const orderItem = order.items.find((item) => item.productId === p.id);
          if (orderItem) {
            return {
              ...p,
              quantity: p.quantity + orderItem.quantity,
              updatedAt: new Date().toISOString(),
            };
          }
          return p;
        })
      );
    }

    setOrders((current) =>
      (current || []).map((o) =>
        o.id === completingOrderId
          ? {
              ...o,
              status: 'completed' as const,
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );

    setCompletingOrderId(null);
    const orderTypeLabel = order.type === 'sale' ? 'Venta' : 'Compra';
    const inventoryAction = order.type === 'sale' ? 'descontada del' : 'agregada al';
    toast.success(`${orderTypeLabel} completada exitosamente y ${inventoryAction} inventario`);
  };

  const handleCancelOrder = () => {
    if (!cancellingOrderId) return;

    setOrders((current) =>
      (current || []).map((o) =>
        o.id === cancellingOrderId
          ? {
              ...o,
              status: 'cancelled' as const,
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );

    setCancellingOrderId(null);
    toast.success('Orden cancelada');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrdersTable = (type: OrderType) => {
    const filteredOrders = safeOrders.filter((o) => o.type === type);

    if (filteredOrders.length === 0) {
      return (
        <Card className="p-12 text-center">
          <Receipt className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No hay {type === 'sale' ? 'ventas' : 'compras'} registradas</h3>
          <p className="text-muted-foreground mb-6">
            Comienza creando tu primera {type === 'sale' ? 'venta' : 'compra'}
          </p>
          <Button onClick={() => openCreateDialog(type)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva {type === 'sale' ? 'Venta' : 'Compra'}
          </Button>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => openCreateDialog(type)}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva {type === 'sale' ? 'Venta' : 'Compra'}
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Orden</TableHead>
                <TableHead>{type === 'sale' ? 'Cliente' : 'Proveedor'}</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono font-semibold">{order.orderNumber}</TableCell>
                  <TableCell>{order.client || order.supplier || '-'}</TableCell>
                  <TableCell>{order.items.length} producto(s)</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant={getOrderStatusBadgeVariant(order.status)}>
                      {getOrderStatusLabel(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {isAdmin && order.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCompletingOrderId(order.id)}
                          >
                            <CheckCircle className="w-4 h-4 text-success" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCancellingOrderId(order.id)}
                          >
                            <XCircle className="w-4 h-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    );
  };

  const salesOrders = safeOrders.filter((o) => o.type === 'sale');
  const purchaseOrders = safeOrders.filter((o) => o.type === 'purchase');
  const totalSales = salesOrders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);
  const totalPurchases = purchaseOrders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);
  const pendingSales = salesOrders.filter((o) => o.status === 'pending').length;
  const pendingPurchases = purchaseOrders.filter((o) => o.status === 'pending').length;

  const completingOrder = safeOrders.find((o) => o.id === completingOrderId);
  const cancellingOrder = safeOrders.find((o) => o.id === cancellingOrderId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-success/10">
              <ShoppingCart className="w-6 h-6 text-success" weight="duotone" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Ventas</p>
              <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-accent/10">
              <ShoppingBag className="w-6 h-6 text-accent" weight="duotone" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Compras</p>
              <p className="text-2xl font-bold">{formatCurrency(totalPurchases)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-warning/10">
              <Receipt className="w-6 h-6 text-warning" weight="duotone" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ventas Pendientes</p>
              <p className="text-2xl font-bold">{pendingSales}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Receipt className="w-6 h-6 text-primary" weight="duotone" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Compras Pendientes</p>
              <p className="text-2xl font-bold">{pendingPurchases}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="sales">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Ventas ({salesOrders.length})
          </TabsTrigger>
          <TabsTrigger value="purchases">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Compras ({purchaseOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-6">
          {renderOrdersTable('sale')}
        </TabsContent>

        <TabsContent value="purchases" className="mt-6">
          {renderOrdersTable('purchase')}
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] m-0 rounded-none p-0 gap-0 overflow-hidden">
          <OrderForm
            type={orderType}
            products={products}
            onSubmit={handleCreateOrder}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingOrder} onOpenChange={(open) => !open && setViewingOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de {getOrderTypeLabel(viewingOrder?.type || 'sale')}</DialogTitle>
            <DialogDescription>
              Orden {viewingOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge variant={getOrderStatusBadgeVariant(viewingOrder.status)} className="mt-1">
                    {getOrderStatusLabel(viewingOrder.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {viewingOrder.type === 'sale' ? 'Cliente' : 'Proveedor'}
                  </p>
                  <p className="font-semibold">{viewingOrder.client || viewingOrder.supplier || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Creado por</p>
                  <p className="font-semibold">{viewingOrder.createdBy}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de creación</p>
                  <p className="font-semibold">{formatDate(viewingOrder.createdAt)}</p>
                </div>
                {viewingOrder.completedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de completado</p>
                    <p className="font-semibold">{formatDate(viewingOrder.completedAt)}</p>
                  </div>
                )}
              </div>

              {viewingOrder.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notas</p>
                  <Card className="p-3">
                    <p className="text-sm">{viewingOrder.notes}</p>
                  </Card>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-3">Productos</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio Unit.</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingOrder.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">{item.productSku}</TableCell>
                        <TableCell className="font-semibold">{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(item.subtotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-3xl font-bold">{formatCurrency(viewingOrder.total)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isAdmin && (
        <>
          <AlertDialog open={!!completingOrderId} onOpenChange={(open) => !open && setCompletingOrderId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Completar orden?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción marcará la orden <span className="font-semibold">{completingOrder?.orderNumber}</span> como completada.
                  {completingOrder?.type === 'sale' && ' El inventario se actualizará restando los productos vendidos.'}
                  {completingOrder?.type === 'purchase' && ' El inventario se actualizará sumando los productos comprados.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleCompleteOrder}>
                  Completar Orden
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={!!cancellingOrderId} onOpenChange={(open) => !open && setCancellingOrderId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Cancelar orden?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción marcará la orden <span className="font-semibold">{cancellingOrder?.orderNumber}</span> como cancelada.
                  El inventario no se verá afectado.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Volver</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelOrder}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Cancelar Orden
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
