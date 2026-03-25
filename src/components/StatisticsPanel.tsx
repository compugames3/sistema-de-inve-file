import { useMemo } from 'react';
import { Product } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { formatCurrency } from '@/lib/inventory-utils';
import { Package, ChartBar, ChartPie, TrendUp, Basket } from '@phosphor-icons/react';

interface StatisticsPanelProps {
  products: Product[];
}

const CHART_COLORS = [
  'oklch(0.65 0.15 220)',
  'oklch(0.35 0.08 250)',
  'oklch(0.75 0.15 85)',
  'oklch(0.65 0.15 145)',
  'oklch(0.60 0.22 25)',
  'oklch(0.70 0.12 280)',
  'oklch(0.55 0.18 180)',
];

export function StatisticsPanel({ products }: StatisticsPanelProps) {
  const statistics = useMemo(() => {
    const categoryData = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = {
          category: product.category,
          quantity: 0,
          value: 0,
          products: 0,
        };
      }
      acc[product.category].quantity += product.quantity;
      acc[product.category].value += product.price * product.quantity;
      acc[product.category].products += 1;
      return acc;
    }, {} as Record<string, { category: string; quantity: number; value: number; products: number }>);

    const categoryStats = Object.values(categoryData).map((item) => ({
      name: item.category,
      cantidad: item.quantity,
      valor: Math.round(item.value),
      productos: item.products,
    }));

    const supplierData = products.reduce((acc, product) => {
      if (!acc[product.supplier]) {
        acc[product.supplier] = {
          supplier: product.supplier,
          quantity: 0,
          value: 0,
          products: 0,
        };
      }
      acc[product.supplier].quantity += product.quantity;
      acc[product.supplier].value += product.price * product.quantity;
      acc[product.supplier].products += 1;
      return acc;
    }, {} as Record<string, { supplier: string; quantity: number; value: number; products: number }>);

    const supplierStats = Object.values(supplierData).map((item) => ({
      name: item.supplier,
      valor: Math.round(item.value),
      productos: item.products,
    }));

    const priceRanges = [
      { range: 'S/. 0-S/. 50', min: 0, max: 50, count: 0 },
      { range: 'S/. 51-S/. 100', min: 51, max: 100, count: 0 },
      { range: 'S/. 101-S/. 250', min: 101, max: 250, count: 0 },
      { range: 'S/. 251-S/. 500', min: 251, max: 500, count: 0 },
      { range: 'S/. 501+', min: 501, max: Infinity, count: 0 },
    ];

    products.forEach((product) => {
      const range = priceRanges.find((r) => product.price >= r.min && product.price <= r.max);
      if (range) range.count++;
    });

    const priceDistribution = priceRanges
      .filter((r) => r.count > 0)
      .map((r) => ({ name: r.range, cantidad: r.count }));

    const stockLevels = [
      { name: 'Agotado (0)', count: 0, fill: 'oklch(0.60 0.22 25)' },
      { name: 'Stock Bajo (1-10)', count: 0, fill: 'oklch(0.75 0.15 85)' },
      { name: 'Stock Medio (11-50)', count: 0, fill: 'oklch(0.65 0.15 220)' },
      { name: 'Stock Alto (51+)', count: 0, fill: 'oklch(0.65 0.15 145)' },
    ];

    products.forEach((product) => {
      if (product.quantity === 0) stockLevels[0].count++;
      else if (product.quantity <= 10) stockLevels[1].count++;
      else if (product.quantity <= 50) stockLevels[2].count++;
      else stockLevels[3].count++;
    });

    const stockData = stockLevels.filter((s) => s.count > 0);

    const topProducts = [...products]
      .sort((a, b) => b.price * b.quantity - a.price * a.quantity)
      .slice(0, 10)
      .map((p) => ({
        name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
        valor: Math.round(p.price * p.quantity),
        cantidad: p.quantity,
      }));

    return {
      categoryStats,
      supplierStats,
      priceDistribution,
      stockData,
      topProducts,
    };
  }, [products]);

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBar className="w-5 h-5" weight="duotone" />
            Estadísticas del Inventario
          </CardTitle>
          <CardDescription>Análisis detallado de productos y categorías</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="w-16 h-16 text-muted-foreground mb-4" weight="duotone" />
            <p className="text-muted-foreground">
              No hay productos en el inventario para mostrar estadísticas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartBar className="w-5 h-5" weight="duotone" />
          Estadísticas del Inventario
        </CardTitle>
        <CardDescription>Análisis detallado de productos y categorías</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="suppliers">Proveedores</TabsTrigger>
            <TabsTrigger value="stock">Niveles Stock</TabsTrigger>
            <TabsTrigger value="prices">Precios</TabsTrigger>
            <TabsTrigger value="top">Top Productos</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-4 pt-4">
            <div>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <ChartBar className="w-4 h-4" />
                Distribución por Categoría
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statistics.categoryStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0 0)" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    stroke="oklch(0.55 0.02 250)"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="oklch(0.55 0.02 250)"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(1 0 0)',
                      border: '1px solid oklch(0.90 0 0)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="productos" fill="oklch(0.35 0.08 250)" name="Productos" />
                  <Bar dataKey="cantidad" fill="oklch(0.65 0.15 220)" name="Unidades" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <ChartPie className="w-4 h-4" />
                Valor por Categoría
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statistics.categoryStats}
                    dataKey="valor"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name}: ${formatCurrency(entry.valor)}`}
                    labelLine={{ stroke: 'oklch(0.55 0.02 250)' }}
                  >
                    {statistics.categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'oklch(1 0 0)',
                      border: '1px solid oklch(0.90 0 0)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-4 pt-4">
            <div>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Basket className="w-4 h-4" />
                Productos por Proveedor
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statistics.supplierStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0 0)" />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 12 }}
                    stroke="oklch(0.55 0.02 250)"
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    stroke="oklch(0.55 0.02 250)"
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(1 0 0)',
                      border: '1px solid oklch(0.90 0 0)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="productos" fill="oklch(0.65 0.15 220)" name="Productos" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <ChartPie className="w-4 h-4" />
                Valor de Inventario por Proveedor
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statistics.supplierStats}
                    dataKey="valor"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name}: ${formatCurrency(entry.valor)}`}
                    labelLine={{ stroke: 'oklch(0.55 0.02 250)' }}
                  >
                    {statistics.supplierStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'oklch(1 0 0)',
                      border: '1px solid oklch(0.90 0 0)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="stock" className="pt-4">
            <div>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Distribución de Niveles de Stock
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={statistics.stockData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={(entry) => `${entry.name}: ${entry.count} productos`}
                    labelLine={{ stroke: 'oklch(0.55 0.02 250)' }}
                  >
                    {statistics.stockData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(1 0 0)',
                      border: '1px solid oklch(0.90 0 0)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="prices" className="pt-4">
            <div>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <ChartBar className="w-4 h-4" />
                Distribución de Precios
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={statistics.priceDistribution}>
                  <defs>
                    <linearGradient id="colorCantidad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.65 0.15 220)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="oklch(0.65 0.15 220)" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0 0)" />
                  <XAxis 
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    stroke="oklch(0.55 0.02 250)"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="oklch(0.55 0.02 250)"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'oklch(1 0 0)',
                      border: '1px solid oklch(0.90 0 0)',
                      borderRadius: '8px',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cantidad" 
                    stroke="oklch(0.65 0.15 220)" 
                    fillOpacity={1}
                    fill="url(#colorCantidad)"
                    name="Productos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="top" className="pt-4">
            <div>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <TrendUp className="w-4 h-4" />
                Top 10 Productos por Valor
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={statistics.topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0 0)" />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 12 }}
                    stroke="oklch(0.55 0.02 250)"
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    stroke="oklch(0.55 0.02 250)"
                    width={150}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === 'valor') return formatCurrency(value);
                      return value;
                    }}
                    contentStyle={{
                      backgroundColor: 'oklch(1 0 0)',
                      border: '1px solid oklch(0.90 0 0)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="valor" fill="oklch(0.65 0.15 145)" name="Valor Total" />
                  <Bar dataKey="cantidad" fill="oklch(0.65 0.15 220)" name="Cantidad" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
