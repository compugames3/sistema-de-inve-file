import { useState } from 'react';
import { Product, OrderItem, OrderType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash, Plus, X } from '@phosphor-icons/react';
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

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

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
    <div className="h-full flex flex-col bg-background">
      <div className="shrink-0 px-6 py-5 border-b flex items-center justify-between bg-card">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Nueva {type === 'sale' ? 'Venta' : 'Compra'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Complete el formulario para crear una nueva {type === 'sale' ? 'venta' : 'compra'}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-10 w-10"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor={type === 'sale' ? 'client' : 'supplier'} className="text-sm font-semibold text-foreground">
                  {type === 'sale' ? 'Cliente *' : 'Proveedor *'}
                </Label>
                <Input
                  id={type === 'sale' ? 'client' : 'supplier'}
                  value={type === 'sale' ? client : supplier}
                  onChange={(e) => type === 'sale' ? setClient(e.target.value) : setSupplier(e.target.value)}
                  placeholder={type === 'sale' ? 'Nombre del cliente' : 'Nombre del proveedor'}
                  className="h-11 bg-background border-input text-base focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-semibold text-foreground">
                  Notas (Opcional)
                </Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observaciones o comentarios..."
                  className="h-11 bg-background border-input text-base focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Productos</h3>
                <Button
                  type="button"
                  onClick={addItem}
                  size="sm"
                  className="h-10 px-4 font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" weight="bold" />
                  Agregar Producto
                </Button>
              </div>

              {items.length === 0 ? (
                <Card className="p-16 text-center border-dashed border-2 bg-muted/30">
                  <p className="text-lg font-semibold text-muted-foreground mb-2">
                    No hay productos agregados
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Comienza agregando productos a tu {type === 'sale' ? 'venta' : 'compra'}
                  </p>
                  <Button
                    type="button"
                    onClick={addItem}
                    size="lg"
                    variant="outline"
                  >
                    <Plus className="w-5 h-5 mr-2" weight="bold" />
                    Agregar Primer Producto
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    const subtotal = item.quantity * item.unitPrice;
                    const stockWarning = type === 'sale' && product && item.quantity > product.quantity;

                    return (
                      <Card key={index} className="p-5 bg-card border-input">
                        <div className="grid grid-cols-12 gap-4 items-end">
                          <div className="col-span-5">
                            <Label htmlFor={`product-${index}`} className="text-sm font-semibold text-foreground mb-2 block">
                              Producto *
                            </Label>
                            <Select
                              value={item.productId}
                              onValueChange={(value) => updateItem(index, 'productId', value)}
                            >
                              <SelectTrigger
                                id={`product-${index}`}
                                className="h-11 bg-background border-input text-base focus:border-primary focus:ring-1 focus:ring-primary"
                              >
                                <SelectValue placeholder="Seleccionar producto" />
                              </SelectTrigger>
                              <SelectContent className="max-h-80">
                                {products.map((p) => (
                                  <SelectItem key={p.id} value={p.id} className="py-3">
                                    <div className="flex flex-col gap-1">
                                      <span className="font-semibold">{p.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {p.sku} · Stock: {p.quantity} · {formatCurrency(p.price)}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {stockWarning && (
                              <p className="text-xs text-destructive mt-1 font-semibold">
                                ⚠ Stock insuficiente (Solo {product.quantity} disponibles)
                              </p>
                            )}
                          </div>

                          <div className="col-span-2">
                            <Label htmlFor={`quantity-${index}`} className="text-sm font-semibold text-foreground mb-2 block">
                              Cantidad *
                            </Label>
                            <Input
                              id={`quantity-${index}`}
                              type="number"
                              min="1"
                              max={type === 'sale' && product ? product.quantity : undefined}
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                              className="h-11 text-base font-semibold text-center bg-background border-input focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                          </div>

                          <div className="col-span-2">
                            <Label htmlFor={`price-${index}`} className="text-sm font-semibold text-foreground mb-2 block">
                              Precio Unit. *
                            </Label>
                            <Input
                              id={`price-${index}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="h-11 text-base font-semibold bg-background border-input focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                          </div>

                          <div className="col-span-2">
                            <Label className="text-sm font-semibold text-foreground mb-2 block">
                              Subtotal
                            </Label>
                            <div className="h-11 flex items-center">
                              <span className="font-bold text-xl text-primary">{formatCurrency(subtotal)}</span>
                            </div>
                          </div>

                          <div className="col-span-1 flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                              className="h-11 w-11 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash className="w-5 h-5" weight="bold" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex justify-between items-center text-base">
                <span className="text-muted-foreground font-semibold">Total de artículos:</span>
                <span className="font-bold text-lg">{totalItems}</span>
              </div>

              <div className="flex justify-between items-center text-base">
                <span className="text-muted-foreground font-semibold">Productos únicos:</span>
                <span className="font-bold text-lg">{items.length}</span>
              </div>

              <Separator />

              <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-foreground">TOTAL A PAGAR</span>
                  <span className="text-3xl font-black text-primary">{formatCurrency(calculateTotal())}</span>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex justify-end gap-3 px-6 py-5 border-t bg-muted/30">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            size="lg"
            className="h-11 px-6 text-base font-medium border-input hover:bg-background"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!isValidForm}
            size="lg"
            className="h-11 px-8 text-base font-semibold bg-primary hover:bg-primary/90"
          >
            Completar {type === 'sale' ? 'Venta' : 'Compra'}
          </Button>
        </div>
      </form>
    </div>
  );
}
