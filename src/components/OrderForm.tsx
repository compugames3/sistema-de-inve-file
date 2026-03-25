import { useState } from 'react';
import { Product, OrderItem, OrderType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Trash, Plus, Check } from '@phosphor-icons/react';
import { formatCurrency } from '@/lib/inventory-utils';

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

  const addItem = () => {
    if (!selectedProduct) return;
    
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const existingIndex = items.findIndex(item => item.productId === selectedProduct);
    
    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity += quantity;
      setItems(newItems);
    } else {
      setItems([...items, { 
        productId: selectedProduct, 
        quantity: quantity, 
        unitPrice: product.price 
      }]);
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
      client: type === 'sale' ? client : undefined,
      supplier: type === 'purchase' ? supplier : undefined,
      notes: undefined,
    });
  };

  const isValidForm = items.length > 0 && (type === 'sale' ? client : supplier);

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
            <div className="space-y-3">
              {items.map((item, index) => {
                const product = products.find(p => p.id === item.productId);
                const subtotal = item.quantity * item.unitPrice;

                return (
                  <div 
                    key={index} 
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base truncate">{product?.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{product?.sku}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                        <Label className="text-xs sm:text-sm whitespace-nowrap">Cantidad:</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                          className="w-16 sm:w-20 text-center text-sm sm:text-base"
                        />
                      </div>

                      <div className="text-right min-w-[80px] sm:min-w-[100px]">
                        <p className="text-xs sm:text-sm text-muted-foreground">Subtotal</p>
                        <p className="font-semibold text-sm sm:text-base">{formatCurrency(subtotal)}</p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="h-8 w-8 sm:h-10 sm:w-10"
                      >
                        <Trash className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-end pt-4 border-t">
                <div className="text-right">
                  <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
                  <p className="text-xl sm:text-2xl font-bold">{formatCurrency(calculateTotal())}</p>
                </div>
              </div>
            </div>
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
