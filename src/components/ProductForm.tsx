import { useForm } from 'react-hook-form';
import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductFormData {
  sku: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplier: string;
  description?: string;
}

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  existingSkus?: string[];
}

const CATEGORIES = [
  'Electrónica',
  'Ropa',
  'Alimentos',
  'Muebles',
  'Herramientas',
  'Oficina',
  'Deportes',
  'Juguetes',
  'Otro',
];

export function ProductForm({ product, onSubmit, onCancel, existingSkus = [] }: ProductFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: product ? {
      sku: product.sku,
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      price: product.price,
      supplier: product.supplier,
      description: product.description || '',
    } : {
      sku: '',
      name: '',
      category: 'Electrónica',
      quantity: 0,
      price: 0,
      supplier: '',
      description: '',
    }
  });

  const category = watch('category');

  const onFormSubmit = (data: ProductFormData) => {
    if (!product && existingSkus.includes(data.sku)) {
      return;
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sku">SKU *</Label>
          <Input
            id="sku"
            {...register('sku', { required: 'SKU es requerido' })}
            placeholder="PROD-001"
            disabled={!!product}
            className="font-mono"
          />
          {errors.sku && <p className="text-xs text-destructive">{errors.sku.message}</p>}
          {!product && existingSkus.includes(watch('sku')) && (
            <p className="text-xs text-destructive">Este SKU ya existe</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nombre del Producto *</Label>
          <Input
            id="name"
            {...register('name', { required: 'Nombre es requerido' })}
            placeholder="Laptop Dell XPS 13"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoría *</Label>
          <Select value={category} onValueChange={(value) => setValue('category', value)}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">Proveedor *</Label>
          <Input
            id="supplier"
            {...register('supplier', { required: 'Proveedor es requerido' })}
            placeholder="Tech Supplies Inc."
          />
          {errors.supplier && <p className="text-xs text-destructive">{errors.supplier.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Cantidad *</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            {...register('quantity', { 
              required: 'Cantidad es requerida',
              valueAsNumber: true,
              min: { value: 0, message: 'La cantidad no puede ser negativa' }
            })}
            placeholder="10"
          />
          {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Precio (USD) *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            {...register('price', { 
              required: 'Precio es requerido',
              valueAsNumber: true,
              min: { value: 0, message: 'El precio no puede ser negativo' }
            })}
            placeholder="999.99"
          />
          {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción (Opcional)</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Descripción detallada del producto..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {product ? 'Actualizar Producto' : 'Agregar Producto'}
        </Button>
      </div>
    </form>
  );
}
