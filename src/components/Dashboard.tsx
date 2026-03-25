import { useState, useRef, useEffect, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { Product, User, AuditLog } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/components/StatsCard';
import { ProductForm } from '@/components/ProductForm';
import { InventoryTable } from '@/components/InventoryTable';
import { StatisticsPanel } from '@/components/StatisticsPanel';
import { CriticalStockAlert } from '@/components/CriticalStockAlert';
import { OrdersPage } from '@/components/OrdersPage';
import { DailyClose } from '@/components/DailyClose';
import { UserManagement } from '@/components/UserManagement';
import { Plus, SignOut, Download, Package, Warning, CurrencyDollar, ShieldCheck, User as UserIcon, Database, Upload, ClockCounterClockwise, CheckCircle, Bell, Receipt, CalendarBlank, Users, LockKey } from '@phosphor-icons/react';
import { generateId, exportToCSV, formatCurrency, getStockStatus } from '@/lib/inventory-utils';
import { exportDatabase, importDatabase, createBackup } from '@/lib/database';
import { filterVisibleProducts, canEditProduct, canDeleteProduct, canAccessTab, getAccessibleTabs } from '@/lib/permissions-utils';
import { useAudit } from '@/hooks/use-audit';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DashboardProps {
  onLogout: () => void;
}

type ViewType = 'inventory' | 'orders' | 'dailyclose' | 'users';

const getTabLabel = (tab: ViewType): string => {
  const labels: Record<ViewType, string> = {
    inventory: 'Inventario',
    orders: 'Órdenes',
    dailyclose: 'Cierre del Día',
    users: 'Usuarios',
  };
  return labels[tab];
};

export function Dashboard({ onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<ViewType>('inventory');
  const [products, setProducts] = useKV<Product[]>('inventory-products', []);
  const [currentUser] = useKV<User | null>('current-user', null);
  const [users] = useKV<User[]>('system-users', []);
  const [dismissedAlerts, setDismissedAlerts] = useKV<string[]>('dismissed-stock-alerts', []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    auditLogs,
    logProductCreate,
    logProductUpdate,
    logProductDelete,
    logBackupRestore,
  } = useAudit();

  const isAdmin = currentUser?.isAdmin ?? false;
  const safeProducts = products || [];
  const accessibleTabs = useMemo(
    () => getAccessibleTabs(currentUser ?? null),
    [currentUser]
  );
  
  const visibleProducts = useMemo(
    () => filterVisibleProducts(currentUser ?? null, safeProducts),
    [currentUser, safeProducts]
  );

  useEffect(() => {
    if (!canAccessTab(currentUser ?? null, currentView)) {
      const firstAccessibleTab = accessibleTabs[0];
      if (firstAccessibleTab) {
        setCurrentView(firstAccessibleTab);
        toast.info(`Cambiado a ${getTabLabel(firstAccessibleTab)} - acceso restringido`);
      }
    }
  }, [currentUser, currentView, accessibleTabs]);

  useEffect(() => {
    const checkAutoBackup = async () => {
      const lastBackup = await window.spark.kv.get<string>('last-auto-backup');
      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;

      if (!lastBackup || (now - new Date(lastBackup).getTime()) >= dayInMs) {
        if (safeProducts.length > 0) {
          const safeUsers = (users || []).map(({ password, ...user }) => user);
          const backup = createBackup(safeProducts, safeUsers, auditLogs);
          exportDatabase(backup);
          await window.spark.kv.set('last-auto-backup', new Date().toISOString());
          toast.success('Backup automático de la base de datos realizado');
        }
      }
    };

    if (isAdmin) {
      checkAutoBackup();
    }
  }, [isAdmin, safeProducts.length]);

  const handleAddProduct = (data: {
    sku: string;
    name: string;
    category: string;
    quantity: number;
    price: number;
    supplier: string;
    description?: string;
  }) => {
    const newProduct: Product = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProducts((current) => [...(current || []), newProduct]);
    logProductCreate(newProduct);
    setIsAddDialogOpen(false);
    toast.success('Producto agregado y registrado en auditoría');
  };

  const handleEditProduct = (data: {
    sku: string;
    name: string;
    category: string;
    quantity: number;
    price: number;
    supplier: string;
    description?: string;
  }) => {
    if (!editingProduct) return;

    const oldProduct = editingProduct;
    const updatedProduct = { ...oldProduct, ...data, updatedAt: new Date().toISOString() };

    setProducts((current) =>
      (current || []).map((p) =>
        p.id === editingProduct.id ? updatedProduct : p
      )
    );
    
    logProductUpdate(oldProduct, updatedProduct);
    setEditingProduct(null);
    toast.success('Producto actualizado y cambios registrados');
  };

  const handleDeleteProduct = () => {
    if (!deletingProductId) return;

    const productToDelete = safeProducts.find((p) => p.id === deletingProductId);
    if (productToDelete) {
      logProductDelete(productToDelete);
    }

    setProducts((current) => (current || []).filter((p) => p.id !== deletingProductId));
    setDeletingProductId(null);
    toast.success('Producto eliminado y registrado en auditoría');
  };

  const handleExport = () => {
    if (safeProducts.length === 0) {
      toast.error('No hay productos para exportar');
      return;
    }
    exportToCSV(safeProducts);
    toast.success('Inventario exportado a CSV exitosamente');
  };

  const handleBackupDatabase = () => {
    const safeUsers = (users || []).map(({ password, ...user }) => user);
    const backup = createBackup(safeProducts, safeUsers, auditLogs);
    
    exportDatabase(backup);
    toast.success('Base de datos completa guardada en el computador con verificación de integridad');
  };

  const handleRestoreDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const backup = await importDatabase(file);
      
      setProducts(backup.products || []);
      logBackupRestore(file.name);
      
      toast.success(`Base de datos restaurada: ${backup.metadata?.productsCount || 0} productos, verificación de integridad exitosa`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al restaurar: ${errorMsg}`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleDismissAlert = (productId: string) => {
    setDismissedAlerts((current) => [...(current || []), productId]);
    toast.success('Alerta ocultada para este producto');
  };

  const totalProducts = visibleProducts.length;
  const lowStockProducts = visibleProducts.filter((p) => {
    const status = getStockStatus(p.quantity);
    return status === 'low-stock' || status === 'out-of-stock';
  }).length;
  const activeCriticalAlerts = visibleProducts.filter((p) => {
    const status = getStockStatus(p.quantity);
    return (status === 'low-stock' || status === 'out-of-stock') && !(dismissedAlerts || []).includes(p.id);
  }).length;
  const totalValue = visibleProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const existingSkus = safeProducts.map((p) => p.sku);
  const deletingProduct = safeProducts.find((p) => p.id === deletingProductId);
  
  const productsWithLimitedAccess = !isAdmin && visibleProducts.length < safeProducts.length;

  const formatAuditDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAuditActionColor = (action: AuditLog['action']) => {
    switch (action) {
      case 'CREATE':
        return 'text-success';
      case 'UPDATE':
        return 'text-accent';
      case 'DELETE':
        return 'text-destructive';
      case 'RESTORE':
        return 'text-primary';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="border-b bg-gradient-to-r from-card via-card to-primary/5 shrink-0 shadow-sm">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent blur-md opacity-40" />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-primary-foreground" weight="duotone" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Sistema de Inventario
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                  <Database className="w-3.5 h-3.5" weight="duotone" />
                  Base de datos persistente · Auditoría completa
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {activeCriticalAlerts > 0 && currentView === 'inventory' && (
                <div className="relative animate-pulse">
                  <Button
                    variant="outline"
                    size="icon"
                    className="relative border-warning/50 hover:bg-warning/10 hover:border-warning shadow-lg shadow-warning/20"
                  >
                    <Bell className="w-5 h-5 text-warning" weight="fill" />
                    {activeCriticalAlerts > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-bold shadow-lg">
                        {activeCriticalAlerts > 9 ? '9+' : activeCriticalAlerts}
                      </span>
                    )}
                  </Button>
                </div>
              )}
              {currentUser && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-br from-secondary/80 to-secondary/50 border border-border/50 shadow-sm">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isAdmin ? 'bg-primary/10' : 'bg-muted'}`}>
                      {isAdmin ? (
                        <ShieldCheck className="w-6 h-6 text-primary" weight="duotone" />
                      ) : (
                        <UserIcon className="w-6 h-6 text-muted-foreground" weight="duotone" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{currentUser.username}</span>
                      <Badge variant={isAdmin ? "default" : "secondary"} className="w-fit text-xs mt-0.5 shadow-sm">
                        {isAdmin ? "Administrador" : "Visitante"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
              <Button variant="outline" onClick={onLogout} className="shadow-sm hover:shadow-md transition-shadow">
                <SignOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6">
        <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as ViewType)} className="w-full">
          <TabsList className={`grid w-full max-w-4xl mb-8 h-14 bg-muted/50 p-1.5 shadow-sm`} style={{ gridTemplateColumns: `repeat(${accessibleTabs.length}, 1fr)` }}>
            {canAccessTab(currentUser ?? null, 'inventory') && (
              <TabsTrigger 
                value="inventory"
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 font-semibold"
              >
                <Package className="w-5 h-5 mr-2" weight="duotone" />
                Inventario
              </TabsTrigger>
            )}
            {canAccessTab(currentUser ?? null, 'orders') && (
              <TabsTrigger 
                value="orders"
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-accent data-[state=active]:to-accent/80 data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg transition-all duration-300 font-semibold"
              >
                <Receipt className="w-5 h-5 mr-2" weight="duotone" />
                Órdenes
              </TabsTrigger>
            )}
            {canAccessTab(currentUser ?? null, 'dailyclose') && (
              <TabsTrigger 
                value="dailyclose"
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-success data-[state=active]:to-success/80 data-[state=active]:text-success-foreground data-[state=active]:shadow-lg transition-all duration-300 font-semibold"
              >
                <CalendarBlank className="w-5 h-5 mr-2" weight="duotone" />
                Cierre del Día
              </TabsTrigger>
            )}
            {canAccessTab(currentUser ?? null, 'users') && (
              <TabsTrigger 
                value="users"
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-warning data-[state=active]:to-warning/80 data-[state=active]:text-warning-foreground data-[state=active]:shadow-lg transition-all duration-300 font-semibold"
              >
                <Users className="w-5 h-5 mr-2" weight="duotone" />
                Usuarios
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="inventory" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatsCard
            title="Total de Productos"
            value={totalProducts}
            icon={Package}
            iconColor="text-primary"
          />
          <StatsCard
            title="Stock Bajo / Agotado"
            value={lowStockProducts}
            icon={Warning}
            iconColor="text-warning"
          />
          <StatsCard
            title="Valor Total del Inventario"
            value={formatCurrency(totalValue)}
            icon={CurrencyDollar}
            iconColor="text-success"
          />
        </div>

        {!isAdmin && safeProducts.length > 0 && (
          <div className="mb-4 p-4 bg-accent/10 border border-accent rounded-lg">
            <div className="flex items-start gap-3">
              <LockKey className="w-5 h-5 text-accent shrink-0 mt-0.5" weight="duotone" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-accent-foreground">
                  Permisos Granulares Activos
                </p>
                <p className="text-sm text-muted-foreground">
                  Puede ver {visibleProducts.length} de {safeProducts.length} productos. 
                  Sus permisos de edición y eliminación son específicos por producto.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <StatisticsPanel products={visibleProducts} />
        </div>

        <CriticalStockAlert
          products={visibleProducts}
          onDismiss={handleDismissAlert}
          dismissedAlerts={dismissedAlerts || []}
        />

        <div className="mb-6 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold">Productos en Base de Datos</h2>
            <p className="text-sm text-muted-foreground">
              Persistencia local automática · Backups con verificación de integridad
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {isAdmin && (
              <Button variant="outline" onClick={() => setShowAuditDialog(true)}>
                <ClockCounterClockwise className="w-4 h-4 mr-2" />
                Auditoría ({auditLogs.length})
              </Button>
            )}
            <Button variant="outline" onClick={handleBackupDatabase}>
              <Database className="w-4 h-4 mr-2" />
              Guardar BD
            </Button>
            {isAdmin && (
              <>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Cargar BD
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.sib"
                  onChange={handleRestoreDatabase}
                  className="hidden"
                />
              </>
            )}
            <Button variant="outline" onClick={handleExport} disabled={visibleProducts.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            {isAdmin && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Producto
              </Button>
            )}
          </div>
        </div>

        <InventoryTable
          products={visibleProducts}
          currentUser={currentUser}
          onEdit={
            isAdmin
              ? setEditingProduct
              : currentUser
              ? (product) => {
                  if (canEditProduct(currentUser, product)) {
                    setEditingProduct(product);
                  } else {
                    toast.error('No tiene permisos para editar este producto');
                  }
                }
              : undefined
          }
          onDelete={
            isAdmin
              ? setDeletingProductId
              : currentUser
              ? (productId) => {
                  const product = safeProducts.find((p) => p.id === productId);
                  if (product && canDeleteProduct(currentUser, product)) {
                    setDeletingProductId(productId);
                  } else {
                    toast.error('No tiene permisos para eliminar este producto');
                  }
                }
              : undefined
          }
        />
          </TabsContent>

          <TabsContent value="orders">
            {currentUser && (
              <OrdersPage 
                products={safeProducts} 
                currentUser={currentUser}
                onUpdateProducts={(updater) => setProducts((current) => updater(current || []))}
              />
            )}
          </TabsContent>

          <TabsContent value="dailyclose">
            {currentUser && (
              <DailyClose
                products={safeProducts}
                currentUser={currentUser}
              />
            )}
          </TabsContent>

          <TabsContent value="users">
            {currentUser && isAdmin && (
              <UserManagement currentUser={currentUser} />
            )}
          </TabsContent>
        </Tabs>
      </main>

      {isAdmin && (
        <>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                <DialogDescription>
                  Complete el formulario para agregar un nuevo producto al inventario
                </DialogDescription>
              </DialogHeader>
              <ProductForm
                onSubmit={handleAddProduct}
                onCancel={() => setIsAddDialogOpen(false)}
                existingSkus={existingSkus}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Producto</DialogTitle>
                <DialogDescription>
                  Modifique la información del producto
                </DialogDescription>
              </DialogHeader>
              {editingProduct && (
                <ProductForm
                  product={editingProduct}
                  onSubmit={handleEditProduct}
                  onCancel={() => setEditingProduct(null)}
                />
              )}
            </DialogContent>
          </Dialog>

          <AlertDialog open={!!deletingProductId} onOpenChange={(open) => !open && setDeletingProductId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará permanentemente el producto{' '}
                  <span className="font-semibold">{deletingProduct?.name}</span> del inventario.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dialog open={showAuditDialog} onOpenChange={setShowAuditDialog}>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Registro de Auditoría</DialogTitle>
                <DialogDescription>
                  Historial completo de cambios en la base de datos
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[500px] pr-4">
                {auditLogs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ClockCounterClockwise className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay registros de auditoría aún</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {auditLogs.slice().reverse().map((log) => (
                      <div key={log.id} className="p-4 border rounded-lg bg-card">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className={`w-5 h-5 ${getAuditActionColor(log.action)}`} weight="fill" />
                            <span className={`font-semibold ${getAuditActionColor(log.action)}`}>
                              {log.action}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {log.entityType}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatAuditDate(log.timestamp)}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-muted-foreground">Usuario:</span>{' '}
                            <span className="font-medium">{log.username}</span>
                          </p>
                          <p>
                            <span className="text-muted-foreground">Entidad:</span>{' '}
                            <span className="font-medium">{log.entityName}</span>
                          </p>
                          {log.changes && log.changes.length > 0 && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-xs text-muted-foreground mb-1">Cambios:</p>
                              <div className="space-y-1">
                                {log.changes.map((change, idx) => (
                                  <div key={idx} className="text-xs font-mono bg-muted/50 p-2 rounded">
                                    <span className="font-semibold">{change.field}:</span>{' '}
                                    <span className="text-destructive">{String(change.oldValue)}</span>
                                    {' → '}
                                    <span className="text-success">{String(change.newValue)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </>
      )}

    </div>
  );
}
