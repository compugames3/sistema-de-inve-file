import { useState } from 'react';
import { Product, OrderItem, OrderType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash, Plus, ShoppingCart, Package, X } from '@phosphor-icons/react';
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

  const calculateSubtotal = () => {
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
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <div className="flex-1 grid grid-cols-[1fr_28rem] gap-0 overflow-hidden">
        <div className="flex flex-col overflow-hidden bg-muted/30">
          <div className="shrink-0 px-8 py-6 border-b bg-card/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary rounded-xl shadow-lg">
                  <Package className="w-8 h-8 text-primary-foreground" weight="duotone" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Productos</h3>
                  <p className="text-sm text-muted-foreground">
                    {items.length} {items.length === 1 ? 'producto agregado' : 'productos agregados'}
                  </p>
                </div>
              </div>
              <Button 
                type="button" 
                onClick={addItem}
                size="lg"
                className="h-12 px-8 text-base font-semibold shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" weight="bold" />
                Agregar Producto
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-6">
            {items.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Card className="p-20 text-center border-dashed border-2 bg-card/50 max-w-2xl">
                  <div className="p-8 bg-muted rounded-full mb-6 w-fit mx-auto">
                    <ShoppingCart className="w-20 h-20 text-muted-foreground" weight="duotone" />
                  </div>
                  <h4 className="text-2xl font-bold mb-3">No hay productos agregados</h4>
                  <p className="text-muted-foreground text-lg mb-8">
                    Comienza agregando productos a tu {type === 'sale' ? 'venta' : 'compra'}
                  </p>
                  <Button 
                    type="button" 
                    onClick={addItem}
                    size="lg"
                    className="h-14 px-8 text-lg"
                  >
                    <Plus className="w-5 h-5 mr-2" weight="bold" />
                    Agregar Primer Producto
                  </Button>
                </Card>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {items.map((item, index) => {
                  const product = products.find(p => p.id === item.productId);
                  const subtotal = item.quantity * item.unitPrice;
                  const stockWarning = type === 'sale' && product && item.quantity > product.quantity;

                  return (
                    <Card key={index} className="p-6 shadow-md hover:shadow-lg transition-all border-2 hover:border-primary/50">
                      <div className="flex items-start gap-6">
                        <div className="flex-1 grid grid-cols-12 gap-5 items-end">
                          <div className="col-span-5">
                            <Label htmlFor={`product-${index}`} className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-3 block">
                              Producto
                            </Label>
                            <Select
                              value={item.productId}
                              onValueChange={(value) => updateItem(index, 'productId', value)}
                            >
                              <SelectTrigger 
                                id={`product-${index}`} 
                                className="h-14 text-base font-semibold border-2 focus:border-primary"
                              >
                                <SelectValue placeholder="Seleccionar producto" />
                              </SelectTrigger>
                              <SelectContent className="max-h-80">
                                {products.map((p) => (
                                  <SelectItem key={p.id} value={p.id} className="py-4">
                                    <div className="flex flex-col gap-1">
                                      <span className="font-bold text-base">{p.name}</span>
                                      <span className="text-xs text-muted-foreground font-mono">
                                        {p.sku} · {p.quantity} disponibles · {formatCurrency(p.price)}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {stockWarning && (
                              <p className="text-xs text-destructive mt-2 font-bold flex items-center gap-1">
                                ⚠ Stock insuficiente (Solo {product.quantity} disponibles)
                              </p>
                            )}
                          </div>

                          <div className="col-span-2">
                            <Label htmlFor={`quantity-${index}`} className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-3 block">
                              Cantidad
                            </Label>
                            <Input
                              id={`quantity-${index}`}
                              type="number"
                              min="1"
                              max={type === 'sale' && product ? product.quantity : undefined}
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                              className="h-14 text-lg font-bold text-center border-2 focus:border-primary"
                            />
                          </div>

                          <div className="col-span-2">
                            <Label htmlFor={`price-${index}`} className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-3 block">
                              Precio Unit.
                            </Label>
                            <Input
                              id={`price-${index}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="h-14 text-lg font-bold border-2 focus:border-primary"
                            />
                          </div>

                          <div className="col-span-3">
                            <Label className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-3 block">
                              Subtotal
                            </Label>
                            <div className="h-14 flex items-center">
                              <span className="font-bold text-3xl text-primary">{formatCurrency(subtotal)}</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          className="h-14 w-14 text-destructive hover:text-destructive hover:bg-destructive/20 shrink-0 border-2 border-transparent hover:border-destructive/50"
                        >
                          <Trash className="w-6 h-6" weight="bold" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col border-l-2 bg-card shadow-2xl">
          <div className="shrink-0 px-6 py-6 border-b-2 bg-gradient-to-br from-primary/10 to-accent/10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent rounded-xl shadow-lg">
                <ShoppingCart className="w-7 h-7 text-accent-foreground" weight="duotone" />
              </div>
              <h3 className="text-2xl font-bold">
                {type === 'sale' ? 'Resumen de Venta' : 'Resumen de Compra'}
              </h3>
            </div>
          </div>

          <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">
            <div>
              <Label htmlFor={type === 'sale' ? 'client' : 'supplier'} className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-3 block">
                {type === 'sale' ? 'Cliente' : 'Proveedor'}
              </Label>
              <Input
                id={type === 'sale' ? 'client' : 'supplier'}
                value={type === 'sale' ? client : supplier}
                onChange={(e) => type === 'sale' ? setClient(e.target.value) : setSupplier(e.target.value)}
                placeholder={type === 'sale' ? 'Nombre del cliente' : 'Nombre del proveedor'}
                className="h-14 text-lg font-semibold border-2 focus:border-primary"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-3 block">
                Notas (Opcional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones o comentarios adicionales..."
                rows={5}
                className="text-base resize-none border-2 focus:border-primary"
              />
            </div>

            <Separator className="my-6" />

            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-semibold text-base">Total de artículos:</span>
                <span className="font-bold text-2xl">{totalItems}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-semibold text-base">Productos únicos:</span>
                <span className="font-bold text-2xl">{items.length}</span>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-bold text-lg">Subtotal:</span>
                <span className="font-bold text-2xl">{formatCurrency(calculateSubtotal())}</span>
              </div>
            </div>

            <Card className="p-8 bg-gradient-to-br from-primary via-primary to-accent border-0 shadow-2xl">
              <div className="text-center text-primary-foreground">
                <p className="text-base font-bold mb-3 opacity-95 tracking-wider">TOTAL A PAGAR</p>
                <p className="text-6xl font-black tracking-tight">{formatCurrency(calculateTotal())}</p>
              </div>
            </Card>
          </div>

          <div className="shrink-0 px-6 py-6 border-t-2 bg-muted/30 space-y-3">
            <Button 
              type="submit" 
              disabled={!isValidForm} 
              size="lg" 
              className="w-full h-16 text-xl font-bold shadow-xl"
            >
              <ShoppingCart className="w-6 h-6 mr-3" weight="bold" />
              Completar {type === 'sale' ? 'Venta' : 'Compra'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              size="lg" 
              className="w-full h-16 text-xl font-bold border-2"
            >
              <X className="w-6 h-6 mr-3" />
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
