import { useState, useRef, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Product, User, AuditLog } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { StatsCard } from '@/components/StatsCard';
import { ProductForm } from '@/components/ProductForm';
import { InventoryTable } from '@/components/InventoryTable';
import { StatisticsPanel } from '@/components/StatisticsPanel';
import { Plus, SignOut, Download, Package, Warning, CurrencyDollar, ShieldCheck, User as UserIcon, Database, Upload, ClockCounterClockwise, CheckCircle } from '@phosphor-icons/react';
import { generateId, exportToCSV, formatCurrency, getStockStatus } from '@/lib/inventory-utils';
import { exportDatabase, importDatabase, createBackup } from '@/lib/database';
import { useAudit } from '@/hooks/use-audit';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [products, setProducts] = useKV<Product[]>('inventory-products', []);
  const [currentUser] = useKV<User | null>('current-user', null);
  const [users] = useKV<User[]>('system-users', []);
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
  
  const totalProducts = safeProducts.length;
  const lowStockProducts = safeProducts.filter((p) => {
    const status = getStockStatus(p.quantity);
    return status === 'low-stock' || status === 'out-of-stock';
  }).length;
  const totalValue = safeProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const existingSkus = safeProducts.map((p) => p.sku);
  const deletingProduct = safeProducts.find((p) => p.id === deletingProductId);

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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Sistema de Inventario Profesional</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gestión con base de datos persistente y auditoría completa
              </p>
            </div>
            <div className="flex items-center gap-4">
              {currentUser && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
                    {isAdmin ? (
                      <ShieldCheck className="w-5 h-5 text-primary" weight="duotone" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-muted-foreground" weight="duotone" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{currentUser.username}</span>
                      <Badge variant={isAdmin ? "default" : "secondary"} className="w-fit text-xs">
                        {isAdmin ? "Administrador" : "Visitante"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
              <Button variant="outline" onClick={onLogout}>
                <SignOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6">
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
          <div className="mb-4 p-4 bg-muted/50 border border-border rounded-lg">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span>Acceso de solo lectura. No puede agregar, editar o eliminar productos.</span>
            </p>
          </div>
        )}

        <div className="mb-6">
          <StatisticsPanel products={safeProducts} />
        </div>

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
            <Button variant="outline" onClick={handleExport} disabled={safeProducts.length === 0}>
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
          products={safeProducts}
          onEdit={isAdmin ? setEditingProduct : undefined}
          onDelete={isAdmin ? setDeletingProductId : undefined}
        />
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
