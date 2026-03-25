import { useState } from 'react';
import { Product, OrderItem, OrderType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Trash, Plus } from '@phosphor-icons/react';
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
  const [notes, setNotes] = useState('');

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof FormOrderItem, value: string | number) => {
    const newItems = [...items];
    if (field === 'productId' && typeof value === 'string') {
      const product = products.find(p => p.id === value);
      if (product) {
        newItems[index] = {
          ...newItems[index],
          productId: value,
          unitPrice: product.price,
        };
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
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
      notes: notes || undefined,
    });
  };

  const isValidForm = items.length > 0 && items.every(item => item.productId && item.quantity > 0);

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <div className="flex-1 grid grid-cols-[1fr_400px] gap-8 min-h-0">
        <div className="flex flex-col space-y-4 min-h-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Productos</h3>
            <Button type="button" onClick={addItem}>
              <Plus className="w-5 h-5 mr-2" />
              Agregar Producto
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 min-h-0">
            {items.length === 0 ? (
              <Card className="p-12 text-center flex flex-col items-center justify-center h-full">
                <p className="text-lg text-muted-foreground">No hay productos agregados</p>
                <p className="text-sm text-muted-foreground mt-2">Haz clic en "Agregar Producto" para comenzar</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => {
                  const product = products.find(p => p.id === item.productId);
                  const subtotal = item.quantity * item.unitPrice;

                  return (
                    <Card key={index} className="p-5">
                      <div className="grid grid-cols-12 gap-4 items-end">
                        <div className="col-span-5">
                          <Label htmlFor={`product-${index}`} className="text-sm font-semibold">Producto</Label>
                          <Select
                            value={item.productId}
                            onValueChange={(value) => updateItem(index, 'productId', value)}
                          >
                            <SelectTrigger id={`product-${index}`} className="h-11 text-base">
                              <SelectValue placeholder="Seleccionar producto" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name} - {p.sku} ({p.quantity} disponibles)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="col-span-2">
                          <Label htmlFor={`quantity-${index}`} className="text-sm font-semibold">Cantidad</Label>
                          <Input
                            id={`quantity-${index}`}
                            type="number"
                            min="1"
                            max={type === 'sale' && product ? product.quantity : undefined}
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="h-11 text-base"
                          />
                        </div>

                        <div className="col-span-2">
                          <Label htmlFor={`price-${index}`} className="text-sm font-semibold">Precio Unit.</Label>
                          <Input
                            id={`price-${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="h-11 text-base"
                          />
                        </div>

                        <div className="col-span-2">
                          <Label className="text-sm font-semibold">Subtotal</Label>
                          <div className="font-bold text-xl pt-2">{formatCurrency(subtotal)}</div>
                        </div>

                        <div className="col-span-1 flex justify-center">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeItem(index)}
                            className="h-11 w-11"
                          >
                            <Trash className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-6 border-l pl-8">
          <div className="space-y-6 flex-1">
            <div>
              <h3 className="text-xl font-semibold mb-4">Información de {type === 'sale' ? 'Venta' : 'Compra'}</h3>
              
              {type === 'sale' ? (
                <div>
                  <Label htmlFor="client" className="text-sm font-semibold">Cliente</Label>
                  <Input
                    id="client"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="Nombre del cliente"
                    className="h-11 text-base mt-2"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="supplier" className="text-sm font-semibold">Proveedor</Label>
                  <Input
                    id="supplier"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="Nombre del proveedor"
                    className="h-11 text-base mt-2"
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-semibold">Notas (Opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones adicionales"
                rows={4}
                className="text-base mt-2 resize-none"
              />
            </div>

            <Card className="p-6 bg-muted">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Total</p>
                <p className="text-5xl font-bold">{formatCurrency(calculateTotal())}</p>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t">
            <Button type="submit" disabled={!isValidForm} size="lg" className="h-14 text-lg">
              Crear {type === 'sale' ? 'Venta' : 'Compra'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} size="lg" className="h-14 text-lg">
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
