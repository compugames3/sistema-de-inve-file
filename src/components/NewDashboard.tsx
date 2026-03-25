import { useState, useRef } from 'react';
import { useKV } from '@github/spark/hooks';
import { Product, User, Category, Supplier, InventoryMovement, DatabaseBackup } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/components/StatsCard';
import { InventoryTable } from '@/components/InventoryTable';
import { Plus, SignOut, Download, Package, Warning, CurrencyDollar, ShieldCheck, User as UserIcon, Database, Upload, ClockClockwise, FolderOpen, Tag, Truck } from '@phosphor-icons/react';
import { generateId, formatCurrency, getStockStatus } from '@/lib/inventory-utils';
import { exportDatabase, importDatabase, DEFAULT_CATEGORIES, DEFAULT_SUPPLIERS } from '@/lib/database';
import { toast } from 'sonner';

interface DashboardProps {
  onLogout: () => void;
}

export function NewDashboard({ onLogout }: DashboardProps) {
  const [products, setProducts] = useKV<Product[]>('inventory-products', []);
  const [categories, setCategories] = useKV<Category[]>('system-categories', DEFAULT_CATEGORIES);
  const [suppliers, setSuppliers] = useKV<Supplier[]>('system-suppliers', DEFAULT_SUPPLIERS);
  const [movements, setMovements] = useKV<InventoryMovement[]>('inventory-movements', []);
  const [currentUser] = useKV<User | null>('current-user', null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('inventory');

  const isAdmin = currentUser?.isAdmin ?? false;

  const handleAddProduct = (data: {
    sku: string;
    name: string;
    categoryId: string;
    quantity: number;
    minStock: number;
    price: number;
    cost: number;
    supplierId: string;
    location?: string;
    barcode?: string;
    description?: string;
  }) => {
    const newProduct: Product = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProducts((current) => [...(current || []), newProduct]);
    
    const movement: InventoryMovement = {
      id: generateId(),
      productId: newProduct.id,
      type: 'entrada',
      quantity: data.quantity,
      previousQuantity: 0,
      newQuantity: data.quantity,
      reason: 'Producto nuevo agregado',
      userId: currentUser?.id || 'unknown',
      createdAt: new Date().toISOString(),
    };
    setMovements((current) => [...(current || []), movement]);

    setIsAddDialogOpen(false);
    toast.success('Producto agregado exitosamente');
  };

  const handleEditProduct = (data: {
    sku: string;
    name: string;
    categoryId: string;
    quantity: number;
    minStock: number;
    price: number;
    cost: number;
    supplierId: string;
    location?: string;
    barcode?: string;
    description?: string;
  }) => {
    if (!editingProduct) return;

    const previousQuantity = editingProduct.quantity;
    const newQuantity = data.quantity;

    setProducts((current) =>
      (current || []).map((p) =>
        p.id === editingProduct.id
          ? { ...p, ...data, updatedAt: new Date().toISOString() }
          : p
      )
    );

    if (previousQuantity !== newQuantity) {
      const movement: InventoryMovement = {
        id: generateId(),
        productId: editingProduct.id,
        type: newQuantity > previousQuantity ? 'entrada' : 'salida',
        quantity: Math.abs(newQuantity - previousQuantity),
        previousQuantity,
        newQuantity,
        reason: 'Ajuste manual',
        userId: currentUser?.id || 'unknown',
        createdAt: new Date().toISOString(),
      };
      setMovements((current) => [...(current || []), movement]);
    }

    setEditingProduct(null);
    toast.success('Producto actualizado exitosamente');
  };

  const handleDeleteProduct = () => {
    if (!deletingProductId) return;

    setProducts((current) => (current || []).filter((p) => p.id !== deletingProductId));
    setMovements((current) => (current || []).filter((m) => m.productId !== deletingProductId));
    setDeletingProductId(null);
    toast.success('Producto eliminado exitosamente');
  };

  const handleBackupDatabase = () => {
    const backup: DatabaseBackup = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      products: products || [],
      categories: categories || DEFAULT_CATEGORIES,
      suppliers: suppliers || DEFAULT_SUPPLIERS,
      movements: movements || [],
      users: [],
    };

    exportDatabase(backup);
    toast.success('Base de datos exportada exitosamente');
  };

  const handleRestoreDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const backup = await importDatabase(file);
      
      setProducts(backup.products || []);
      setCategories(backup.categories || DEFAULT_CATEGORIES);
      setSuppliers(backup.suppliers || DEFAULT_SUPPLIERS);
      setMovements(backup.movements || []);
      
      toast.success('Base de datos restaurada exitosamente');
    } catch (error) {
      toast.error('Error al restaurar la base de datos');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const safeProducts = products || [];
  const safeCategories = categories || DEFAULT_CATEGORIES;
  const safeSuppliers = suppliers || DEFAULT_SUPPLIERS;
  const safeMovements = movements || [];
  
  const totalProducts = safeProducts.length;
  const lowStockProducts = safeProducts.filter((p) => {
    const status = getStockStatus(p.quantity, p.minStock);
    return status === 'low-stock' || status === 'out-of-stock';
  }).length;
  const totalValue = safeProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const totalCost = safeProducts.reduce((sum, p) => sum + (p.cost || 0) * p.quantity, 0);
  const potentialProfit = totalValue - totalCost;

  const existingSkus = safeProducts.map((p) => p.sku);
  const deletingProduct = safeProducts.find((p) => p.id === deletingProductId);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Sistema de Inventario Profesional</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Base de datos completa con historial y respaldo automático
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
          <StatsCard
            title="Ganancia Potencial"
            value={formatCurrency(potentialProfit)}
            icon={CurrencyDollar}
            iconColor="text-accent"
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full md:w-auto grid-cols-4 md:grid-cols-4">
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Inventario</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">Categorías</span>
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">Proveedores</span>
            </TabsTrigger>
            <TabsTrigger value="movements" className="flex items-center gap-2">
              <ClockClockwise className="w-4 h-4" />
              <span className="hidden sm:inline">Historial</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <h2 className="text-2xl font-semibold">Productos</h2>
              <div className="flex gap-3 flex-wrap">
                <Button variant="outline" onClick={handleBackupDatabase}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar BD
                </Button>
                {isAdmin && (
                  <>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Importar BD
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/json"
                      onChange={handleRestoreDatabase}
                      className="hidden"
                    />
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Producto
                    </Button>
                  </>
                )}
              </div>
            </div>

            <InventoryTable
              products={safeProducts}
              categories={safeCategories}
              suppliers={safeSuppliers}
              onEdit={isAdmin ? setEditingProduct : undefined}
              onDelete={isAdmin ? setDeletingProductId : undefined}
            />
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Categorías</h2>
              <Badge variant="outline">{safeCategories.length} categorías</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {safeCategories.map((category) => {
                const productsInCategory = safeProducts.filter(p => p.categoryId === category.id).length;
                return (
                  <div
                    key={category.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: category.color }}
                        />
                        <h3 className="font-semibold">{category.name}</h3>
                      </div>
                      <Badge variant="secondary">{productsInCategory}</Badge>
                    </div>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Proveedores</h2>
              <Badge variant="outline">{safeSuppliers.length} proveedores</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeSuppliers.map((supplier) => {
                const productsFromSupplier = safeProducts.filter(p => p.supplierId === supplier.id).length;
                return (
                  <div
                    key={supplier.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{supplier.name}</h3>
                        <p className="text-sm text-muted-foreground">Contacto: {supplier.contact}</p>
                      </div>
                      <Badge variant="secondary">{productsFromSupplier} productos</Badge>
                    </div>
                    {supplier.email && (
                      <p className="text-sm text-muted-foreground mt-2">Email: {supplier.email}</p>
                    )}
                    {supplier.phone && (
                      <p className="text-sm text-muted-foreground">Teléfono: {supplier.phone}</p>
                    )}
                    {supplier.address && (
                      <p className="text-sm text-muted-foreground">Dirección: {supplier.address}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="movements" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Historial de Movimientos</h2>
              <Badge variant="outline">{safeMovements.length} movimientos</Badge>
            </div>
            
            <div className="space-y-3">
              {safeMovements.length === 0 ? (
                <div className="p-12 text-center border rounded-lg">
                  <ClockClockwise className="w-12 h-12 mx-auto mb-4 text-muted-foreground" weight="duotone" />
                  <p className="text-muted-foreground">No hay movimientos registrados</p>
                </div>
              ) : (
                safeMovements.slice().reverse().map((movement) => {
                  const product = safeProducts.find(p => p.id === movement.productId);
                  return (
                    <div
                      key={movement.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              className={
                                movement.type === 'entrada'
                                  ? 'bg-success text-success-foreground'
                                  : movement.type === 'salida'
                                  ? 'bg-warning text-warning-foreground'
                                  : 'bg-muted text-muted-foreground'
                              }
                            >
                              {movement.type.toUpperCase()}
                            </Badge>
                            <span className="font-semibold">{product?.name || 'Producto eliminado'}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {movement.reason} • Cantidad: {movement.quantity} • 
                            {movement.previousQuantity} → {movement.newQuantity}
                          </p>
                          {movement.notes && (
                            <p className="text-sm text-muted-foreground mt-1">Notas: {movement.notes}</p>
                          )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {new Date(movement.createdAt).toLocaleString('es-ES')}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
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
              {/* ProductForm will be updated to handle new fields */}
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
              {/* ProductForm will be updated to handle new fields */}
            </DialogContent>
          </Dialog>

          <AlertDialog open={!!deletingProductId} onOpenChange={(open) => !open && setDeletingProductId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Esto eliminará permanentemente el producto{' '}
                  <span className="font-semibold">{deletingProduct?.name}</span> del inventario y su historial asociado.
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
        </>
      )}
    </div>
  );
}
