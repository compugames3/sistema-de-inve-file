import { useState } from 'react';
import { Product, OrderItem, OrderType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Trash, CurrencyDollar, Check } from '@phosphor-icons/react';
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
    <div className="min-h-screen bg-[#0a0e1a] text-white flex items-center justify-center p-8">
      <form onSubmit={handleSubmit} className="w-full max-w-6xl">
        <Card className="bg-[#151b2e] border-[#1f2937] shadow-2xl rounded-3xl overflow-hidden">
          <div className="p-12 space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center border border-emerald-500/30">
                <CurrencyDollar className="w-10 h-10 text-emerald-400" weight="duotone" />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-white">
                  Registrar Nueva {type === 'sale' ? 'Venta' : 'Compra'}
                </h2>
                <p className="text-gray-400 text-lg mt-2">
                  Completa los datos para generar una nueva orden de {type === 'sale' ? 'venta' : 'compra'}.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                {type === 'sale' ? 'Nombre del Cliente' : 'Nombre del Proveedor'}
              </Label>
              <Input
                value={type === 'sale' ? client : supplier}
                onChange={(e) => type === 'sale' ? setClient(e.target.value) : setSupplier(e.target.value)}
                placeholder={type === 'sale' ? 'Ej: Juan Pérez' : 'Ej: Proveedor ABC'}
                className="h-14 bg-[#0a0e1a] border-[#2d3748] text-white placeholder:text-gray-500 text-base focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,auto] gap-4 items-end">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                  Seleccionar Producto
                </Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="h-14 bg-[#0a0e1a] border-[#d97706] border-2 text-white text-base focus:ring-amber-500/20 rounded-xl">
                    <SelectValue placeholder="Selecciona un producto disponible..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151b2e] border-[#2d3748]">
                    {products.map((p) => (
                      <SelectItem 
                        key={p.id} 
                        value={p.id} 
                        className="text-white hover:bg-[#0a0e1a] focus:bg-[#0a0e1a] py-3"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold">{p.name}</span>
                          <span className="text-xs text-gray-400">
                            {p.sku} · Stock: {p.quantity} · {formatCurrency(p.price)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                  Cantidad (UDS.)
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="h-14 w-32 bg-[#0a0e1a] border-[#2d3748] text-white text-center text-lg font-semibold focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
                />
              </div>

              <Button
                type="button"
                onClick={addItem}
                disabled={!selectedProduct}
                className="h-14 px-8 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-base rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Añadir
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-300">Resumen de la Venta</h3>
              
              {items.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-gray-400 text-lg">
                    La lista está vacía. Selecciona un producto y presiona "+ Añadir".
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    const subtotal = item.quantity * item.unitPrice;

                    return (
                      <div 
                        key={index} 
                        className="bg-[#0a0e1a] border border-[#2d3748] rounded-xl p-5 flex items-center justify-between hover:border-emerald-500/30 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-lg">{product?.name}</h4>
                          <p className="text-sm text-gray-400 mt-1">{product?.sku}</p>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-3">
                            <Label className="text-gray-400 text-sm">Cantidad:</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                              className="h-10 w-20 bg-[#151b2e] border-[#2d3748] text-white text-center font-semibold rounded-lg"
                            />
                          </div>

                          <div className="text-right min-w-[120px]">
                            <p className="text-sm text-gray-400">Subtotal</p>
                            <p className="text-xl font-bold text-emerald-400">{formatCurrency(subtotal)}</p>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            className="h-10 w-10 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash className="w-5 h-5" weight="bold" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#0a0e1a] border-t border-[#2d3748] p-8 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="h-14 px-10 text-white hover:bg-[#151b2e] text-base font-medium rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isValidForm}
              className="h-14 px-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold text-lg rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            >
              Procesar {type === 'sale' ? 'Venta' : 'Compra'}
              <Check className="w-5 h-5" weight="bold" />
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
