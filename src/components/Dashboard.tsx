import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { StatsCard } from '@/components/StatsCard';
import { ProductForm } from '@/components/ProductForm';
import { InventoryTable } from '@/components/InventoryTable';
import { Plus, SignOut, Download, Package, Warning, CurrencyDollar } from '@phosphor-icons/react';
import { generateId, exportToCSV, formatCurrency, getStockStatus } from '@/lib/inventory-utils';
import { toast } from 'sonner';

interface DashboardProps {
  onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [products, setProducts] = useKV<Product[]>('inventory-products', []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

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
    setIsAddDialogOpen(false);
    toast.success('Producto agregado exitosamente');
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

    setProducts((current) =>
      (current || []).map((p) =>
        p.id === editingProduct.id
          ? { ...p, ...data, updatedAt: new Date().toISOString() }
          : p
      )
    );
    setEditingProduct(null);
    toast.success('Producto actualizado exitosamente');
  };

  const handleDeleteProduct = () => {
    if (!deletingProductId) return;

    setProducts((current) => (current || []).filter((p) => p.id !== deletingProductId));
    setDeletingProductId(null);
    toast.success('Producto eliminado exitosamente');
  };

  const handleExport = () => {
    if (safeProducts.length === 0) {
      toast.error('No hay productos para exportar');
      return;
    }
    exportToCSV(safeProducts);
    toast.success('Inventario exportado exitosamente');
  };

  const safeProducts = products || [];
  
  const totalProducts = safeProducts.length;
  const lowStockProducts = safeProducts.filter((p) => {
    const status = getStockStatus(p.quantity);
    return status === 'low-stock' || status === 'out-of-stock';
  }).length;
  const totalValue = safeProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const existingSkus = safeProducts.map((p) => p.sku);
  const deletingProduct = safeProducts.find((p) => p.id === deletingProductId);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Sistema de Inventario</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gestión profesional de inventario
              </p>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <SignOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
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

        <div className="mb-6 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <h2 className="text-2xl font-semibold">Productos</h2>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExport} disabled={safeProducts.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Producto
            </Button>
          </div>
        </div>

        <InventoryTable
          products={safeProducts}
          onEdit={setEditingProduct}
          onDelete={setDeletingProductId}
        />
      </main>

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
    </div>
  );
}
