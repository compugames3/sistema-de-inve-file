import { Order, Product, DailyCloseReport, PaymentMethod } from './types';

export function generateDailyCloseReport(
  orders: Order[],
  products: Product[],
  closedBy: string,
  startDate?: Date,
  endDate?: Date
): DailyCloseReport {
  const now = new Date();
  const start = startDate || new Date(now.setHours(0, 0, 0, 0));
  const end = endDate || new Date();

  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= start && orderDate <= end;
  });

  const sales = todayOrders.filter(o => o.type === 'sale');
  const purchases = todayOrders.filter(o => o.type === 'purchase');

  const salesStats = calculateOrderStats(sales);
  const purchaseStats = calculateOrderStats(purchases);

  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= 10).length;
  const outOfStockCount = products.filter(p => p.quantity === 0).length;
  const categories = new Set(products.map(p => p.category));
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  const grossRevenue = salesStats.totalRevenue;
  const totalCosts = purchaseStats.totalRevenue;
  const netProfit = grossRevenue - totalCosts;
  const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();
  
  sales.forEach(order => {
    if (order.status === 'completed') {
      order.items.forEach(item => {
        const existing = productSales.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.subtotal;
        } else {
          productSales.set(item.productId, {
            name: item.productName,
            quantity: item.quantity,
            revenue: item.subtotal,
          });
        }
      });
    }
  });

  const topProducts = Array.from(productSales.entries())
    .map(([productId, data]) => ({
      productId,
      productName: data.name,
      quantitySold: data.quantity,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const paymentMethodsMap = new Map<PaymentMethod, { count: number; total: number }>();
  const allMethods: PaymentMethod[] = ['efectivo', 'tarjeta', 'transferencia', 'yape', 'plin', 'otro'];
  
  allMethods.forEach(method => {
    paymentMethodsMap.set(method, { count: 0, total: 0 });
  });

  let totalReceived = 0;
  let totalChangeGiven = 0;

  sales.forEach(order => {
    if (order.status === 'completed') {
      const method = order.paymentMethod || 'efectivo';
      const existing = paymentMethodsMap.get(method);
      if (existing) {
        existing.count += 1;
        existing.total += order.total;
      } else {
        paymentMethodsMap.set(method, { count: 1, total: order.total });
      }

      if (order.amountReceived !== undefined) {
        totalReceived += order.amountReceived;
      }
      if (order.changeGiven !== undefined) {
        totalChangeGiven += order.changeGiven;
      }
    }
  });

  const paymentMethods = Array.from(paymentMethodsMap.entries())
    .map(([method, data]) => ({
      method,
      count: data.count,
      total: data.total,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    id: `CLOSE-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    closedBy,
    sales: salesStats,
    purchases: purchaseStats,
    inventory: {
      totalProducts: products.length,
      totalValue: totalInventoryValue,
      lowStockProducts: lowStockCount,
      outOfStockProducts: outOfStockCount,
      categoriesCount: categories.size,
    },
    financial: {
      grossRevenue,
      totalCosts,
      netProfit,
      profitMargin,
    },
    paymentMethods,
    cashFlow: {
      totalReceived,
      totalChangeGiven,
      netCash: totalReceived - totalChangeGiven,
    },
    topProducts,
  };
}

function calculateOrderStats(orders: Order[]) {
  const completed = orders.filter(o => o.status === 'completed');
  const pending = orders.filter(o => o.status === 'pending');
  const cancelled = orders.filter(o => o.status === 'cancelled');
  
  const totalRevenue = completed.reduce((sum, o) => sum + o.total, 0);
  const totalItems = completed.reduce((sum, o) => 
    sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );
  const averageOrderValue = completed.length > 0 ? totalRevenue / completed.length : 0;

  return {
    totalOrders: orders.length,
    completedOrders: completed.length,
    pendingOrders: pending.length,
    cancelledOrders: cancelled.length,
    totalCost: totalRevenue,
    totalRevenue,
    totalItems,
    averageOrderValue,
  };
}

export function exportDailyCloseReport(report: DailyCloseReport) {
  const jsonStr = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cierre-dia-${report.date}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateDailyClosePDF(report: DailyCloseReport): string {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount);
  
  const formatDate = (dateStr: string) => 
    new Date(dateStr).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Cierre del Día - ${report.date}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'IBM Plex Sans', Arial, sans-serif; padding: 40px; background: #f5f5f5; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 32px; color: #1e293b; margin-bottom: 8px; }
    .header .subtitle { color: #64748b; font-size: 14px; }
    .meta-info { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; }
    .meta-item { font-size: 14px; }
    .meta-item strong { color: #1e293b; display: block; margin-bottom: 4px; }
    .meta-item span { color: #64748b; }
    .section { margin-bottom: 35px; }
    .section-title { font-size: 20px; color: #1e293b; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
    .stat-card { background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; }
    .stat-card.success { border-left-color: #10b981; }
    .stat-card.warning { border-left-color: #f59e0b; }
    .stat-card.danger { border-left-color: #ef4444; }
    .stat-card .label { font-size: 12px; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-card .value { font-size: 24px; font-weight: 600; color: #1e293b; }
    .financial-summary { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 25px; border-radius: 8px; margin: 20px 0; }
    .financial-summary .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 16px; }
    .financial-summary .row.total { font-size: 20px; font-weight: 600; border-top: 2px solid rgba(255,255,255,0.3); padding-top: 12px; margin-top: 12px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .table th { background: #f1f5f9; padding: 12px; text-align: left; font-size: 13px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; }
    .table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b; }
    .table tr:last-child td { border-bottom: none; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #64748b; font-size: 13px; }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Cierre del Día</h1>
      <p class="subtitle">Sistema de Inventario Profesional</p>
    </div>

    <div class="meta-info">
      <div class="meta-item">
        <strong>Fecha del Cierre</strong>
        <span>${report.date}</span>
      </div>
      <div class="meta-item">
        <strong>Realizado Por</strong>
        <span>${report.closedBy}</span>
      </div>
      <div class="meta-item">
        <strong>Período</strong>
        <span>${formatDate(report.startTime)} - ${formatDate(report.endTime)}</span>
      </div>
      <div class="meta-item">
        <strong>ID del Reporte</strong>
        <span>${report.id}</span>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">💰 Resumen Financiero</h2>
      <div class="financial-summary">
        <div class="row">
          <span>Ingresos Brutos (Ventas)</span>
          <span>${formatCurrency(report.financial.grossRevenue)}</span>
        </div>
        <div class="row">
          <span>Costos Totales (Compras)</span>
          <span>${formatCurrency(report.financial.totalCosts)}</span>
        </div>
        <div class="row total">
          <span>Ganancia Neta</span>
          <span>${formatCurrency(report.financial.netProfit)}</span>
        </div>
        <div class="row">
          <span>Margen de Ganancia</span>
          <span>${report.financial.profitMargin.toFixed(2)}%</span>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">🛒 Ventas del Día</h2>
      <div class="stats-grid">
        <div class="stat-card success">
          <div class="label">Completadas</div>
          <div class="value">${report.sales.completedOrders}</div>
        </div>
        <div class="stat-card warning">
          <div class="label">Pendientes</div>
          <div class="value">${report.sales.pendingOrders}</div>
        </div>
        <div class="stat-card danger">
          <div class="label">Canceladas</div>
          <div class="value">${report.sales.cancelledOrders}</div>
        </div>
        <div class="stat-card">
          <div class="label">Total Órdenes</div>
          <div class="value">${report.sales.totalOrders}</div>
        </div>
        <div class="stat-card">
          <div class="label">Items Vendidos</div>
          <div class="value">${report.sales.totalItems}</div>
        </div>
        <div class="stat-card">
          <div class="label">Ticket Promedio</div>
          <div class="value">${formatCurrency(report.sales.averageOrderValue)}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">📦 Compras del Día</h2>
      <div class="stats-grid">
        <div class="stat-card success">
          <div class="label">Completadas</div>
          <div class="value">${report.purchases.completedOrders}</div>
        </div>
        <div class="stat-card warning">
          <div class="label">Pendientes</div>
          <div class="value">${report.purchases.pendingOrders}</div>
        </div>
        <div class="stat-card danger">
          <div class="label">Canceladas</div>
          <div class="value">${report.purchases.cancelledOrders}</div>
        </div>
        <div class="stat-card">
          <div class="label">Total Órdenes</div>
          <div class="value">${report.purchases.totalOrders}</div>
        </div>
        <div class="stat-card">
          <div class="label">Items Comprados</div>
          <div class="value">${report.purchases.totalItems}</div>
        </div>
        <div class="stat-card">
          <div class="label">Orden Promedio</div>
          <div class="value">${formatCurrency(report.purchases.averageOrderValue)}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">📊 Estado del Inventario</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="label">Total Productos</div>
          <div class="value">${report.inventory.totalProducts}</div>
        </div>
        <div class="stat-card">
          <div class="label">Valor Total</div>
          <div class="value">${formatCurrency(report.inventory.totalValue)}</div>
        </div>
        <div class="stat-card">
          <div class="label">Categorías</div>
          <div class="value">${report.inventory.categoriesCount}</div>
        </div>
        <div class="stat-card warning">
          <div class="label">Stock Bajo</div>
          <div class="value">${report.inventory.lowStockProducts}</div>
        </div>
        <div class="stat-card danger">
          <div class="label">Agotados</div>
          <div class="value">${report.inventory.outOfStockProducts}</div>
        </div>
      </div>
    </div>

    ${report.topProducts.length > 0 ? `
    <div class="section">
      <h2 class="section-title">⭐ Top 10 Productos Más Vendidos</h2>
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Producto</th>
            <th>Cantidad Vendida</th>
            <th>Ingresos</th>
          </tr>
        </thead>
        <tbody>
          ${report.topProducts.map((product, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${product.productName}</td>
              <td>${product.quantitySold}</td>
              <td>${formatCurrency(product.revenue)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    <div class="footer">
      <p>Documento generado automáticamente el ${formatDate(new Date().toISOString())}</p>
      <p>Sistema de Inventario Profesional © ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function printDailyCloseReport(report: DailyCloseReport) {
  const htmlContent = generateDailyClosePDF(report);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}
