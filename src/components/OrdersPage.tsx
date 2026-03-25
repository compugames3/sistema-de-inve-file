import { useState, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { Order, OrderType, Product, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { OrderForm } from '@/components/OrderForm';
import { Plus, ShoppingCart, ShoppingBag, Eye, CheckCircle, XCircle, Receipt, FilePdf, CalendarBlank, User as UserIconPh, Package, CaretUp, CaretDown, CaretUpDown, Trash } from '@phosphor-icons/react';
import { generateOrderNumber, getOrderStatusBadgeVariant, getOrderStatusLabel, getOrderTypeLabel } from '@/lib/order-utils';
import { generateId, formatCurrency } from '@/lib/inventory-utils';
import { generateSalesPDF, generateRestockPDF } from '@/lib/pdf-utils';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface OrdersPageProps {
  products: Product[];
  currentUser: User;
  onUpdateProducts: (updater: (products: Product[]) => Product[]) => void;
}

type SortField = 'orderNumber' | 'client' | 'supplier' | 'items' | 'total' | 'status' | 'date';
type SortDirection = 'asc' | 'desc';

export function OrdersPage({ products, currentUser, onUpdateProducts }: OrdersPageProps) {
  const [orders, setOrders] = useKV<Order[]>('system-orders', []);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('sale');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [completingOrderId, setCompletingOrderId] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showFinalDeleteConfirmation, setShowFinalDeleteConfirmation] = useState(false);

  const safeOrders = orders || [];
  const isAdmin = currentUser?.isAdmin ?? false;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <CaretUpDown className="w-4 h-4 ml-1 text-muted-foreground" />;
    }
    return sortDirection === 'asc' 
      ? <CaretUp className="w-4 h-4 ml-1" weight="fill" />
      : <CaretDown className="w-4 h-4 ml-1" weight="fill" />;
  };

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
    paymentMethod?: Order['paymentMethod'];
    amountReceived?: number;
    changeGiven?: number;
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
      paymentMethod: data.paymentMethod,
      amountReceived: data.amountReceived,
      changeGiven: data.changeGiven,
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

  const handleDeleteOrder = () => {
    if (!deletingOrderId) return;

    const order = safeOrders.find((o) => o.id === deletingOrderId);
    
    setOrders((current) =>
      (current || []).filter((o) => o.id !== deletingOrderId)
    );

    setDeletingOrderId(null);
    toast.success(`Orden ${order?.orderNumber} eliminada permanentemente`);
  };

  const handleToggleSelectOrder = (orderId: string) => {
    setSelectedOrderIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleToggleSelectAll = (type: OrderType) => {
    const filteredOrders = safeOrders.filter((o) => o.type === type);
    const allIds = filteredOrders.map((o) => o.id);
    const allSelected = allIds.every((id) => selectedOrderIds.has(id));

    if (allSelected) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(allIds));
    }
  };

  const handleDeleteMultiple = () => {
    if (selectedOrderIds.size === 0) return;
    setShowDeleteConfirmation(true);
  };

  const handleConfirmFirstStep = () => {
    setShowDeleteConfirmation(false);
    setShowFinalDeleteConfirmation(true);
  };

  const handleFinalDeleteConfirm = () => {
    const ordersToDelete = Array.from(selectedOrderIds);
    const deletedOrders = safeOrders.filter((o) => ordersToDelete.includes(o.id));
    
    setOrders((current) =>
      (current || []).filter((o) => !ordersToDelete.includes(o.id))
    );

    setSelectedOrderIds(new Set());
    setShowFinalDeleteConfirmation(false);
    
    toast.success(`${deletedOrders.length} orden${deletedOrders.length !== 1 ? 'es' : ''} eliminada${deletedOrders.length !== 1 ? 's' : ''} permanentemente`);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setShowFinalDeleteConfirmation(false);
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

  const isMobile = useIsMobile();

  const renderOrdersTable = (type: OrderType) => {
    const filteredOrders = useMemo(() => {
      const filtered = safeOrders.filter((o) => o.type === type);
      
      return filtered.sort((a, b) => {
        let comparison = 0;

        switch (sortField) {
          case 'orderNumber':
            comparison = a.orderNumber.localeCompare(b.orderNumber);
            break;
          case 'client':
            comparison = (a.client || a.supplier || '').localeCompare(b.client || b.supplier || '');
            break;
          case 'supplier':
            comparison = (a.supplier || a.client || '').localeCompare(b.supplier || b.client || '');
            break;
          case 'items':
            comparison = a.items.length - b.items.length;
            break;
          case 'total':
            comparison = a.total - b.total;
            break;
          case 'status':
            const statusOrder: Record<string, number> = { pending: 0, completed: 1, cancelled: 2 };
            comparison = statusOrder[a.status] - statusOrder[b.status];
            break;
          case 'date':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }, [safeOrders, type, sortField, sortDirection]);

    const selectedCount = Array.from(selectedOrderIds).filter(id => 
      filteredOrders.some(o => o.id === id)
    ).length;
    const allSelected = filteredOrders.length > 0 && selectedCount === filteredOrders.length;

    if (filteredOrders.length === 0) {
      return (
        <Card className="p-8 sm:p-12 text-center">
          <Receipt className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-base sm:text-lg font-semibold mb-2">No hay {type === 'sale' ? 'ventas' : 'compras'} registradas</h3>
          <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
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
      <div className="space-y-3 sm:space-y-4">
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            {isAdmin && selectedCount > 0 && (
              <Button
                variant="destructive"
                size={isMobile ? "sm" : "default"}
                onClick={handleDeleteMultiple}
              >
                <Trash className="w-4 h-4 mr-2" />
                Eliminar ({selectedCount})
              </Button>
            )}
          </div>
          <Button onClick={() => openCreateDialog(type)} size={isMobile ? "sm" : "default"}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva {type === 'sale' ? 'Venta' : 'Compra'}
          </Button>
        </div>

        {isMobile ? (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono font-bold text-sm text-primary mb-1">
                        {order.orderNumber}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getOrderStatusBadgeVariant(order.status)}>
                          {getOrderStatusLabel(order.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold text-foreground">
                        {formatCurrency(order.total)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <div className="flex items-start gap-2">
                      <UserIconPh className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" weight="duotone" />
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground">{type === 'sale' ? 'Cliente' : 'Proveedor'}</div>
                        <div className="text-sm font-medium truncate">{order.client || order.supplier || '-'}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CalendarBlank className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" weight="duotone" />
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground">Fecha</div>
                        <div className="text-sm font-medium truncate">{formatDate(order.createdAt)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingOrder(order)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver
                    </Button>
                    {isAdmin && order.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCompletingOrderId(order.id)}
                          className="flex-1 text-success hover:bg-success/10"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCancellingOrderId(order.id)}
                          className="flex-1 text-destructive hover:bg-destructive/10"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingOrderId(order.id)}
                        className="flex-1 text-destructive hover:bg-destructive/10"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin && (
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={() => handleToggleSelectAll(type)}
                        aria-label="Seleccionar todas las órdenes"
                      />
                    </TableHead>
                  )}
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 hover:bg-transparent font-semibold"
                      onClick={() => handleSort('orderNumber')}
                    >
                      N° Orden
                      <SortIcon field="orderNumber" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 hover:bg-transparent font-semibold"
                      onClick={() => handleSort(type === 'sale' ? 'client' : 'supplier')}
                    >
                      {type === 'sale' ? 'Cliente' : 'Proveedor'}
                      <SortIcon field={type === 'sale' ? 'client' : 'supplier'} />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 hover:bg-transparent font-semibold"
                      onClick={() => handleSort('items')}
                    >
                      Items
                      <SortIcon field="items" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 hover:bg-transparent font-semibold"
                      onClick={() => handleSort('total')}
                    >
                      Total
                      <SortIcon field="total" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 hover:bg-transparent font-semibold"
                      onClick={() => handleSort('status')}
                    >
                      Estado
                      <SortIcon field="status" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 hover:bg-transparent font-semibold"
                      onClick={() => handleSort('date')}
                    >
                      Fecha
                      <SortIcon field="date" />
                    </Button>
                  </TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    {isAdmin && (
                      <TableCell>
                        <Checkbox
                          checked={selectedOrderIds.has(order.id)}
                          onCheckedChange={() => handleToggleSelectOrder(order.id)}
                          aria-label={`Seleccionar orden ${order.orderNumber}`}
                        />
                      </TableCell>
                    )}
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
                        {isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingOrderId(order.id)}
                          >
                            <Trash className="w-4 h-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    );
  };

  const salesOrders = safeOrders.filter((o) => o.type === 'sale');
  const purchaseOrders = safeOrders.filter((o) => o.type === 'purchase');

  const completingOrder = safeOrders.find((o) => o.id === completingOrderId);
  const cancellingOrder = safeOrders.find((o) => o.id === cancellingOrderId);
  const deletingOrder = safeOrders.find((o) => o.id === deletingOrderId);

  const handleGenerateSalesPDF = () => {
    generateSalesPDF(safeOrders);
    toast.success('Reporte de ventas generado en PDF');
  };

  const handleGenerateRestockPDF = () => {
    generateRestockPDF(safeOrders, products);
    toast.success('Reporte de restock/compras generado en PDF');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Órdenes y Reportes</h2>
          <p className="text-sm text-muted-foreground mt-1">Gestión de ventas, compras y generación de reportes PDF</p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleGenerateSalesPDF}
            size={isMobile ? "sm" : "default"}
            className="border-2 hover:bg-success/5 hover:border-success/50 transition-all shadow-sm font-semibold flex-1 sm:flex-none"
          >
            <FilePdf className="w-4 h-4 sm:mr-2" weight="duotone" />
            <span className="hidden sm:inline">Reporte Ventas PDF</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleGenerateRestockPDF}
            size={isMobile ? "sm" : "default"}
            className="border-2 hover:bg-primary/5 hover:border-primary/50 transition-all shadow-sm font-semibold flex-1 sm:flex-none"
          >
            <FilePdf className="w-4 h-4 sm:mr-2" weight="duotone" />
            <span className="hidden sm:inline">Reporte Restock PDF</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-auto">
          <TabsTrigger value="sales" className="text-xs sm:text-sm">
            <ShoppingCart className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Ventas ({salesOrders.length})</span>
            <span className="sm:hidden">({salesOrders.length})</span>
          </TabsTrigger>
          <TabsTrigger value="purchases" className="text-xs sm:text-sm">
            <ShoppingBag className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Compras ({purchaseOrders.length})</span>
            <span className="sm:hidden">({purchaseOrders.length})</span>
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

          <AlertDialog open={!!deletingOrderId} onOpenChange={(open) => !open && setDeletingOrderId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar orden permanentemente?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente la orden <span className="font-semibold">{deletingOrder?.orderNumber}</span>.
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Volver</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteOrder}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Eliminar Orden
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={showDeleteConfirmation} onOpenChange={(open) => !open && handleCancelDelete()}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>⚠️ Primera Confirmación</AlertDialogTitle>
                <AlertDialogDescription>
                  Está a punto de eliminar <span className="font-semibold text-destructive">{selectedOrderIds.size} orden{selectedOrderIds.size !== 1 ? 'es' : ''}</span> permanentemente.
                  <br /><br />
                  Esta es una acción <span className="font-semibold">irreversible</span>. ¿Está seguro de que desea continuar?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleCancelDelete}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmFirstStep}
                  className="bg-warning text-warning-foreground hover:bg-warning/90"
                >
                  Continuar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={showFinalDeleteConfirmation} onOpenChange={(open) => !open && handleCancelDelete()}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>🚨 Confirmación Final</AlertDialogTitle>
                <AlertDialogDescription>
                  <span className="font-bold text-destructive">ÚLTIMA ADVERTENCIA:</span> Va a eliminar permanentemente <span className="font-semibold">{selectedOrderIds.size} orden{selectedOrderIds.size !== 1 ? 'es' : ''}</span>.
                  <br /><br />
                  Los datos eliminados <span className="font-semibold underline">NO se podrán recuperar</span>.
                  <br /><br />
                  ¿Confirma que desea eliminar estas órdenes de forma permanente?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleCancelDelete}>No, volver atrás</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleFinalDeleteConfirm}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Sí, eliminar permanentemente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
