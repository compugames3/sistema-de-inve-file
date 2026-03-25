import { useState } from 'react';
import { Product, OrderItem, OrderType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Trash, Plus, Check } from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/inventory-utils';
import { toast } from 'sonner';

interface OrderFormProps {
  type: OrderType;
  products: Product[];
  onSubmit: (data: {
    items: OrderItem[];
    total: number;
    client?: string;
    supplier?: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

interface FormOrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export function OrderForm({ type, products, onSubmit, onCancel }: OrderFormProps) {
  const [items, setItems] = useState<FormOrderItem[]>([]);
  const [client, setClient] = useState('');
  const [supplier, setSupplier] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [amountPaid, setAmountPaid] = useState<string>('');

  const addItem = () => {
    if (!selectedProduct) {
      toast.error('Seleccione un producto');
      return;
    }
    
    if (quantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }
    
    const product = products.find(p => p.id === selectedProduct);
    if (!product) {
      toast.error('Producto no encontrado');
      return;
    }

    const existingIndex = items.findIndex(item => item.productId === selectedProduct);
    
    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity += quantity;
      setItems(newItems);
      toast.success(`Cantidad actualizada para ${product.name}`);
    } else {
      setItems([...items, { 
        productId: selectedProduct, 
        quantity: quantity, 
        unitPrice: product.price 
      }]);
      toast.success(`${product.name} agregado`);
    }

    setSelectedProduct('');
    setQuantity(1);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItemQuantity = (index: number, newQuantity: number) => {
    const newItems = [...items];
    newItems[index].quantity = newQuantity;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Agregue al menos un producto a la orden');
      return;
    }

    const clientOrSupplier = type === 'sale' ? client.trim() : supplier.trim();
    if (!clientOrSupplier) {
      toast.error(`Ingrese el nombre del ${type === 'sale' ? 'cliente' : 'proveedor'}`);
      return;
    }

    const orderItems: OrderItem[] = items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: product?.name || '',
        productSku: product?.sku || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice,
      };
    });

    onSubmit({
      items: orderItems,
      total: calculateTotal(),
      client: type === 'sale' ? client.trim() : undefined,
      supplier: type === 'purchase' ? supplier.trim() : undefined,
      notes: undefined,
    });
  };

  const isValidForm = items.length > 0 && (type === 'sale' ? client.trim() : supplier.trim());

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-6xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Nueva {type === 'sale' ? 'Venta' : 'Compra'}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Registra una nueva {type === 'sale' ? 'venta' : 'compra'} en el sistema
            </p>
          </div>
        </div>

        <Card className="p-4 sm:p-6">
          <div className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="client-supplier" className="text-sm sm:text-base">
                {type === 'sale' ? 'Cliente' : 'Proveedor'}
              </Label>
              <Input
                id="client-supplier"
                value={type === 'sale' ? client : supplier}
                onChange={(e) => type === 'sale' ? setClient(e.target.value) : setSupplier(e.target.value)}
                placeholder={type === 'sale' ? 'Nombre del cliente' : 'Nombre del proveedor'}
                className="text-sm sm:text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr,auto,auto] gap-3 sm:gap-4 items-end">
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label htmlFor="product" className="text-sm sm:text-base">Producto</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger id="product" className="text-sm sm:text-base">
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-sm sm:text-base">
                        {p.name} - {p.sku} (Stock: {p.quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm sm:text-base">Cantidad</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full sm:w-24 text-sm sm:text-base"
                />
              </div>

              <Button
                type="button"
                onClick={addItem}
                disabled={!selectedProduct}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Items de la {type === 'sale' ? 'Venta' : 'Compra'}</h3>
          
          {items.length === 0 ? (
            <div className="py-8 sm:py-12 text-center text-muted-foreground text-sm sm:text-base">
              No hay items agregados. Selecciona un producto y haz clic en "Añadir".
            </div>
          ) : (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm">Producto</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">SKU</th>
                      <th className="text-center py-3 px-4 font-semibold text-sm">Cantidad</th>
                      <th className="text-right py-3 px-4 font-semibold text-sm">Precio</th>
                      <th className="text-right py-3 px-4 font-semibold text-sm">Subtotal</th>
                      <th className="text-center py-3 px-4 font-semibold text-sm">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const product = products.find(p => p.id === item.productId);
                      const subtotal = item.quantity * item.unitPrice;

                      return (
                        <tr 
                          key={index} 
                          className="border-b hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <p className="font-medium text-sm">{product?.name}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-muted-foreground font-mono">{product?.sku}</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                className="w-20 text-center text-sm"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right text-sm">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <p className="font-semibold text-sm">{formatCurrency(subtotal)}</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(index)}
                                className="h-9 w-9"
                              >
                                <Trash className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden space-y-3">
                {items.map((item, index) => {
                  const product = products.find(p => p.id === item.productId);
                  const subtotal = item.quantity * item.unitPrice;

                  return (
                    <div 
                      key={index} 
                      className="border rounded-lg p-3 sm:p-4 space-y-3 hover:bg-muted/50 transition-colors bg-card shadow-sm"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm sm:text-base">{product?.name}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-mono">{product?.sku}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
                        >
                          <Trash className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Precio</Label>
                          <p className="text-sm sm:text-base font-medium">{formatCurrency(item.unitPrice)}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Cantidad</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                            className="w-full text-center text-sm sm:text-base h-8 sm:h-9"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">Subtotal</span>
                          <span className="font-bold text-base sm:text-lg">{formatCurrency(subtotal)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t mt-4 space-y-4">
                <div className="flex justify-end">
                  <div className="text-right">
                    <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
                    <p className="text-xl sm:text-2xl font-bold">{formatCurrency(calculateTotal())}</p>
                  </div>
                </div>
                
                {type === 'sale' && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 justify-end">
                    <div className="w-full sm:w-64 space-y-2">
                      <Label htmlFor="amount-paid" className="text-sm">
                        Dinero Recibido
                      </Label>
                      <Input
                        id="amount-paid"
                        type="number"
                        min="0"
                        step="0.01"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        placeholder="0.00"
                        className="text-base"
                      />
                    </div>
                    
                    {amountPaid && parseFloat(amountPaid) > 0 && (
                      <div className="text-right">
                        <p className="text-xs sm:text-sm text-muted-foreground">Cambio</p>
                        <p className={`text-lg sm:text-xl font-semibold ${
                          parseFloat(amountPaid) >= calculateTotal() 
                            ? 'text-success' 
                            : 'text-destructive'
                        }`}>
                          {formatCurrency(Math.max(0, parseFloat(amountPaid) - calculateTotal()))}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </Card>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sticky bottom-0 sm:static bg-background pt-4 pb-2 sm:pb-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto text-sm sm:text-base"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!isValidForm}
            className="w-full sm:w-auto text-sm sm:text-base"
          >
            <Check className="w-4 h-4 mr-2" />
            Guardar {type === 'sale' ? 'Venta' : 'Compra'}
          </Button>
        </div>
      </form>
    </div>
  );
}
