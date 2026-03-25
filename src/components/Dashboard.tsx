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
import { CriticalStockAlert } from '@/components/CriticalStockAlert';
import { OrdersPage } from '@/components/OrdersPage';
import { DailyClose } from '@/components/DailyClose';
import { UserManagement } from '@/components/UserManagement';
import { JosimarLogo } from '@/components/JosimarLogo';
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
      <header className="border-b bg-white shrink-0 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <div className="relative px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 min-w-0 flex-1">
              <div className="relative group shrink-0">
                <JosimarLogo size="clamp(40px, 8vw, 64px)" />
              </div>
              <div className="flex flex-col min-w-0">
                <h1 className="text-base sm:text-xl lg:text-2xl xl:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent truncate">
                  Josimar Cell
                </h1>
                <div className="hidden sm:flex items-center gap-2 lg:gap-3 mt-1 lg:mt-1.5">
                  <div className="flex items-center gap-1 lg:gap-1.5 text-xs font-medium text-muted-foreground">
                    <Database className="w-3 lg:w-3.5 h-3 lg:h-3.5 text-primary" weight="duotone" />
                    <span className="hidden md:inline">Sistema de Inventario</span>
                    <span className="md:hidden">Inventario</span>
                  </div>
                  <div className="hidden md:block w-1 h-1 rounded-full bg-border" />
                  <div className="hidden md:flex items-center gap-1 lg:gap-1.5 text-xs font-medium text-muted-foreground">
                    <CheckCircle className="w-3 lg:w-3.5 h-3 lg:h-3.5 text-success" weight="duotone" />
                    <span>Gestión Profesional</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4 shrink-0">
              {activeCriticalAlerts > 0 && currentView === 'inventory' && (
                <div className="relative">
                  <Button
                    variant="outline"
                    size="icon"
                    className="relative h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12 border-2 border-warning/30 hover:bg-warning/10 hover:border-warning transition-all duration-200 shadow-lg shadow-warning/10"
                  >
                    <Bell className="w-4 sm:w-4.5 lg:w-5 h-4 sm:h-4.5 lg:h-5 text-warning" weight="fill" />
                    {activeCriticalAlerts > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-gradient-to-br from-destructive to-destructive/80 text-white text-xs font-bold shadow-lg animate-pulse">
                        {activeCriticalAlerts > 9 ? '9+' : activeCriticalAlerts}
                      </span>
                    )}
                  </Button>
                </div>
              )}
              {currentUser && (
                <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 px-2 sm:px-3 lg:px-5 py-1.5 sm:py-2 lg:py-3 rounded-xl lg:rounded-2xl bg-gradient-to-br from-card to-secondary/30 border-2 border-border/50 shadow-md">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg lg:rounded-xl flex items-center justify-center ${isAdmin ? 'bg-gradient-to-br from-primary/20 to-accent/20' : 'bg-muted'} shadow-inner`}>
                    {isAdmin ? (
                      <ShieldCheck className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 text-primary" weight="duotone" />
                    ) : (
                      <UserIcon className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 text-muted-foreground" weight="duotone" />
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-sm lg:text-base font-bold text-foreground truncate max-w-[100px] lg:max-w-none">{currentUser.username}</span>
                    <Badge variant={isAdmin ? "default" : "secondary"} className="w-fit text-xs mt-0.5 lg:mt-1 px-1.5 lg:px-2 py-0.5 shadow-sm">
                      {isAdmin ? "Admin" : "Visitante"}
                    </Badge>
                  </div>
                </div>
              )}
              <Button 
                variant="outline" 
                onClick={onLogout} 
                className="h-9 sm:h-10 lg:h-12 px-2 sm:px-3 lg:px-5 border-2 hover:bg-destructive/5 hover:border-destructive/30 hover:text-destructive transition-all duration-200 shadow-sm font-medium"
              >
                <SignOut className="w-4 sm:w-4.5 lg:w-5 h-4 sm:h-4.5 lg:h-5 sm:mr-2" weight="bold" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as ViewType)} className="w-full">
          <TabsList className={`grid w-full max-w-5xl mx-auto mb-6 sm:mb-8 lg:mb-10 h-auto sm:h-14 lg:h-16 bg-white/60 backdrop-blur-sm p-1 sm:p-1.5 lg:p-2 shadow-lg border-2 border-border/30 rounded-xl sm:rounded-2xl`} style={{ gridTemplateColumns: `repeat(${accessibleTabs.length}, 1fr)` }}>
            {canAccessTab(currentUser ?? null, 'inventory') && (
              <TabsTrigger 
                value="inventory"
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-primary/30 transition-all duration-300 font-bold text-xs sm:text-sm lg:text-base rounded-lg sm:rounded-xl py-2 sm:py-2.5 lg:py-3 px-2 sm:px-3 lg:px-4"
              >
                <Package className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 sm:mr-1.5 lg:mr-2.5" weight="duotone" />
                <span className="hidden sm:inline">Inventario</span>
              </TabsTrigger>
            )}
            {canAccessTab(currentUser ?? null, 'orders') && (
              <TabsTrigger 
                value="orders"
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-accent data-[state=active]:to-accent/90 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-accent/30 transition-all duration-300 font-bold text-xs sm:text-sm lg:text-base rounded-lg sm:rounded-xl py-2 sm:py-2.5 lg:py-3 px-2 sm:px-3 lg:px-4"
              >
                <Receipt className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 sm:mr-1.5 lg:mr-2.5" weight="duotone" />
                <span className="hidden sm:inline">Órdenes</span>
              </TabsTrigger>
            )}
            {canAccessTab(currentUser ?? null, 'dailyclose') && (
              <TabsTrigger 
                value="dailyclose"
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-success data-[state=active]:to-success/90 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-success/30 transition-all duration-300 font-bold text-xs sm:text-sm lg:text-base rounded-lg sm:rounded-xl py-2 sm:py-2.5 lg:py-3 px-2 sm:px-3 lg:px-4"
              >
                <CalendarBlank className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 sm:mr-1.5 lg:mr-2.5" weight="duotone" />
                <span className="hidden sm:inline">Cierre del Día</span>
              </TabsTrigger>
            )}
            {canAccessTab(currentUser ?? null, 'users') && (
              <TabsTrigger 
                value="users"
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-warning data-[state=active]:to-warning/90 data-[state=active]:text-warning-foreground data-[state=active]:shadow-xl data-[state=active]:shadow-warning/30 transition-all duration-300 font-bold text-xs sm:text-sm lg:text-base rounded-lg sm:rounded-xl py-2 sm:py-2.5 lg:py-3 px-2 sm:px-3 lg:px-4"
              >
                <Users className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 sm:mr-1.5 lg:mr-2.5" weight="duotone" />
                <span className="hidden sm:inline">Usuarios</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="inventory" className="space-y-8 animate-slide-up">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group hover:scale-105 transition-transform duration-300">
            <StatsCard
              title="Total de Productos"
              value={totalProducts}
              icon={Package}
              iconColor="text-primary"
            />
          </div>
          <div className="group hover:scale-105 transition-transform duration-300">
            <StatsCard
              title="Stock Bajo / Agotado"
              value={lowStockProducts}
              icon={Warning}
              iconColor="text-warning"
            />
          </div>
          <div className="group hover:scale-105 transition-transform duration-300">
            <StatsCard
              title="Valor Total del Inventario"
              value={formatCurrency(totalValue)}
              icon={CurrencyDollar}
              iconColor="text-success"
            />
          </div>
        </div>

        {!isAdmin && safeProducts.length > 0 && (
          <div className="p-5 bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/30 rounded-2xl shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                <LockKey className="w-6 h-6 text-accent" weight="duotone" />
              </div>
              <div className="space-y-2">
                <p className="text-base font-bold text-accent-foreground">
                  Permisos Granulares Activos
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Puede ver {visibleProducts.length} de {safeProducts.length} productos. 
                  Sus permisos de edición y eliminación son específicos por producto.
                </p>
              </div>
            </div>
          </div>
        )}

        <CriticalStockAlert
          products={visibleProducts}
          onDismiss={handleDismissAlert}
          dismissedAlerts={dismissedAlerts || []}
        />

        <div className="bg-white rounded-2xl shadow-lg border-2 border-border/30 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-card to-secondary/20 border-b-2 border-border/30">
            <div className="flex flex-col sm:flex-row gap-5 justify-between items-start sm:items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1.5">Productos en Base de Datos</h2>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Database className="w-4 h-4" weight="duotone" />
                  Persistencia local automática · Backups verificados
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAuditDialog(true)}
                    className="border-2 hover:bg-accent/5 hover:border-accent/50 transition-all shadow-sm font-semibold"
                  >
                    <ClockCounterClockwise className="w-4 h-4 mr-2" weight="duotone" />
                    Auditoría ({auditLogs.length})
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={handleBackupDatabase}
                  className="border-2 hover:bg-primary/5 hover:border-primary/50 transition-all shadow-sm font-semibold"
                >
                  <Database className="w-4 h-4 mr-2" weight="duotone" />
                  Guardar BD
                </Button>
                {isAdmin && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 hover:bg-success/5 hover:border-success/50 transition-all shadow-sm font-semibold"
                    >
                      <Upload className="w-4 h-4 mr-2" weight="duotone" />
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
                <Button 
                  variant="outline" 
                  onClick={handleExport} 
                  disabled={visibleProducts.length === 0}
                  className="border-2 hover:bg-accent/5 hover:border-accent/50 transition-all shadow-sm font-semibold"
                >
                  <Download className="w-4 h-4 mr-2" weight="duotone" />
                  Exportar CSV
                </Button>
                {isAdmin && (
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all font-bold"
                  >
                    <Plus className="w-5 h-5 mr-2" weight="bold" />
                    Agregar Producto
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
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
          </div>
        </div>
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
            <DialogContent className="max-w-3xl h-[85vh] p-0 gap-0 overflow-hidden">
              <ProductForm
                onSubmit={handleAddProduct}
                onCancel={() => setIsAddDialogOpen(false)}
                existingSkus={existingSkus}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
            <DialogContent className="max-w-3xl h-[85vh] p-0 gap-0 overflow-hidden">
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
