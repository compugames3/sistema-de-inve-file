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
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b">
        <h2 className="text-2xl font-semibold text-foreground">
          {product ? 'Editar Producto' : 'Agregar Nuevo Producto'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Complete el formulario para {product ? 'actualizar el' : 'agregar un nuevo'} producto al inventario
        </p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-5 max-w-3xl">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-sm font-semibold text-foreground">
                  SKU *
                </Label>
                <Input
                  id="sku"
                  {...register('sku', { required: 'SKU es requerido' })}
                  placeholder="PROD-001"
                  disabled={!!product}
                  className="h-11 bg-background border-input text-base focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {errors.sku && <p className="text-xs text-destructive mt-1">{errors.sku.message}</p>}
                {!product && existingSkus.includes(watch('sku')) && (
                  <p className="text-xs text-destructive mt-1">Este SKU ya existe</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                  Nombre del Producto *
                </Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Nombre es requerido' })}
                  placeholder="Laptop Dell XPS 13"
                  className="h-11 bg-background border-input text-base focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold text-foreground">
                  Categoría *
                </Label>
                <Select value={category} onValueChange={(value) => setValue('category', value)}>
                  <SelectTrigger id="category" className="h-11 bg-background border-input text-base focus:border-primary focus:ring-1 focus:ring-primary">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-base">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier" className="text-sm font-semibold text-foreground">
                  Proveedor *
                </Label>
                <Input
                  id="supplier"
                  {...register('supplier', { required: 'Proveedor es requerido' })}
                  placeholder="Tech Supplies Inc."
                  className="h-11 bg-background border-input text-base focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {errors.supplier && <p className="text-xs text-destructive mt-1">{errors.supplier.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-semibold text-foreground">
                  Cantidad *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  {...register('quantity', { 
                    required: 'Cantidad es requerida',
                    valueAsNumber: true,
                    min: { value: 0, message: 'La cantidad no puede ser negativa' }
                  })}
                  placeholder="0"
                  className="h-11 bg-background border-input text-base focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {errors.quantity && <p className="text-xs text-destructive mt-1">{errors.quantity.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-semibold text-foreground">
                  Precio (USD) *
                </Label>
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
                  placeholder="0"
                  className="h-11 bg-background border-input text-base focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {errors.price && <p className="text-xs text-destructive mt-1">{errors.price.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-foreground">
                Descripción (Opcional)
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descripción detallada del producto..."
                rows={4}
                className="bg-background border-input text-base resize-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-5 border-t bg-muted/30">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="h-11 px-6 text-base font-medium border-input hover:bg-background"
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            className="h-11 px-6 text-base font-semibold bg-primary hover:bg-primary/90"
          >
            {product ? 'Actualizar Producto' : 'Agregar Producto'}
          </Button>
        </div>
      </form>
    </div>
  );
}
