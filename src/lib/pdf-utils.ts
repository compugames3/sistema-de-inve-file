import jsPDF from 'jspdf';
import { Order, Product, DailyCloseReport } from './types';
import { formatCurrency } from './inventory-utils';

export function generateSalesPDF(
  orders: Order[],
  startDate?: Date,
  endDate?: Date
): void {
  const doc = new jsPDF();
  
  const salesOrders = orders.filter(o => o.type === 'sale' && o.status === 'completed');
  const dateRange = startDate && endDate 
    ? `${startDate.toLocaleDateString('es-ES')} - ${endDate.toLocaleDateString('es-ES')}`
    : 'Todas las fechas';
  
  let y = 20;
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTE DE VENTAS', 105, y, { align: 'center' });
  
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período: ${dateRange}`, 105, y, { align: 'center' });
  
  y += 5;
  doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 105, y, { align: 'center' });
  
  y += 15;
  doc.setDrawColor(52, 73, 94);
  doc.line(20, y, 190, y);
  
  y += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN EJECUTIVO', 20, y);
  
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const totalOrders = salesOrders.length;
  const totalRevenue = salesOrders.reduce((sum, o) => sum + o.total, 0);
  const totalItems = salesOrders.reduce((sum, o) => 
    sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );
  const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  doc.text(`Total de Ventas Completadas: ${totalOrders}`, 20, y);
  y += 6;
  doc.text(`Ingresos Totales: ${formatCurrency(totalRevenue)}`, 20, y);
  y += 6;
  doc.text(`Total de Productos Vendidos: ${totalItems}`, 20, y);
  y += 6;
  doc.text(`Ticket Promedio: ${formatCurrency(averageOrder)}`, 20, y);
  
  y += 12;
  doc.setDrawColor(52, 73, 94);
  doc.line(20, y, 190, y);
  
  y += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DETALLE DE VENTAS', 20, y);
  
  y += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('N° Orden', 20, y);
  doc.text('Cliente', 60, y);
  doc.text('Fecha', 110, y);
  doc.text('Items', 145, y);
  doc.text('Total', 170, y);
  
  y += 2;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, 190, y);
  
  y += 6;
  doc.setFont('helvetica', 'normal');
  
  salesOrders.forEach((order) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('N° Orden', 20, y);
      doc.text('Cliente', 60, y);
      doc.text('Fecha', 110, y);
      doc.text('Items', 145, y);
      doc.text('Total', 170, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
    }
    
    const orderDate = new Date(order.createdAt).toLocaleDateString('es-ES');
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
    
    doc.text(order.orderNumber, 20, y);
    doc.text(order.client || 'N/A', 60, y);
    doc.text(orderDate, 110, y);
    doc.text(itemCount.toString(), 145, y);
    doc.text(formatCurrency(order.total), 170, y);
    
    y += 6;
  });
  
  if (salesOrders.length === 0) {
    doc.text('No hay ventas completadas en el período seleccionado', 105, y, { align: 'center' });
  }
  
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
  }
  
  const filename = `Reporte_Ventas_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

export function generateRestockPDF(
  orders: Order[],
  products: Product[],
  startDate?: Date,
  endDate?: Date
): void {
  const doc = new jsPDF();
  
  const purchaseOrders = orders.filter(o => o.type === 'purchase' && o.status === 'completed');
  const dateRange = startDate && endDate 
    ? `${startDate.toLocaleDateString('es-ES')} - ${endDate.toLocaleDateString('es-ES')}`
    : 'Todas las fechas';
  
  let y = 20;
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTE DE RESTOCK / COMPRAS', 105, y, { align: 'center' });
  
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período: ${dateRange}`, 105, y, { align: 'center' });
  
  y += 5;
  doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 105, y, { align: 'center' });
  
  y += 15;
  doc.setDrawColor(52, 73, 94);
  doc.line(20, y, 190, y);
  
  y += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN EJECUTIVO', 20, y);
  
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const totalOrders = purchaseOrders.length;
  const totalCost = purchaseOrders.reduce((sum, o) => sum + o.total, 0);
  const totalItems = purchaseOrders.reduce((sum, o) => 
    sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );
  const averageOrder = totalOrders > 0 ? totalCost / totalOrders : 0;
  
  const lowStockProducts = products.filter(p => p.quantity <= 10 && p.quantity > 0);
  const outOfStockProducts = products.filter(p => p.quantity === 0);
  
  doc.text(`Total de Compras Completadas: ${totalOrders}`, 20, y);
  y += 6;
  doc.text(`Inversión Total: ${formatCurrency(totalCost)}`, 20, y);
  y += 6;
  doc.text(`Total de Productos Comprados: ${totalItems}`, 20, y);
  y += 6;
  doc.text(`Orden Promedio: ${formatCurrency(averageOrder)}`, 20, y);
  y += 6;
  doc.text(`Productos con Stock Bajo: ${lowStockProducts.length}`, 20, y);
  y += 6;
  doc.text(`Productos Agotados: ${outOfStockProducts.length}`, 20, y);
  
  y += 12;
  doc.setDrawColor(52, 73, 94);
  doc.line(20, y, 190, y);
  
  y += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DETALLE DE COMPRAS', 20, y);
  
  y += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('N° Orden', 20, y);
  doc.text('Proveedor', 60, y);
  doc.text('Fecha', 110, y);
  doc.text('Items', 145, y);
  doc.text('Total', 170, y);
  
  y += 2;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, 190, y);
  
  y += 6;
  doc.setFont('helvetica', 'normal');
  
  purchaseOrders.forEach((order) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('N° Orden', 20, y);
      doc.text('Proveedor', 60, y);
      doc.text('Fecha', 110, y);
      doc.text('Items', 145, y);
      doc.text('Total', 170, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
    }
    
    const orderDate = new Date(order.createdAt).toLocaleDateString('es-ES');
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
    
    doc.text(order.orderNumber, 20, y);
    doc.text(order.supplier || 'N/A', 60, y);
    doc.text(orderDate, 110, y);
    doc.text(itemCount.toString(), 145, y);
    doc.text(formatCurrency(order.total), 170, y);
    
    y += 6;
  });
  
  if (purchaseOrders.length === 0) {
    doc.text('No hay compras completadas en el período seleccionado', 105, y, { align: 'center' });
    y += 10;
  } else {
    y += 6;
  }
  
  if (lowStockProducts.length > 0 || outOfStockProducts.length > 0) {
    if (y > 200) {
      doc.addPage();
      y = 20;
    }
    
    y += 10;
    doc.setDrawColor(52, 73, 94);
    doc.line(20, y, 190, y);
    
    y += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ALERTAS DE INVENTARIO', 20, y);
    
    y += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('SKU', 20, y);
    doc.text('Producto', 50, y);
    doc.text('Cantidad', 120, y);
    doc.text('Proveedor', 150, y);
    
    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    
    y += 6;
    doc.setFont('helvetica', 'normal');
    
    const criticalProducts = [...outOfStockProducts, ...lowStockProducts];
    
    criticalProducts.forEach((product) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('SKU', 20, y);
        doc.text('Producto', 50, y);
        doc.text('Cantidad', 120, y);
        doc.text('Proveedor', 150, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
      }
      
      doc.text(product.sku, 20, y);
      doc.text(product.name.substring(0, 30), 50, y);
      
      if (product.quantity === 0) {
        doc.setTextColor(220, 53, 69);
        doc.text('AGOTADO', 120, y);
        doc.setTextColor(0, 0, 0);
      } else {
        doc.setTextColor(255, 193, 7);
        doc.text(product.quantity.toString(), 120, y);
        doc.setTextColor(0, 0, 0);
      }
      
      doc.text(product.supplier.substring(0, 20), 150, y);
      
      y += 6;
    });
  }
  
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
  }
  
  const filename = `Reporte_Restock_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

export function generateDailyClosePDF(report: DailyCloseReport): void {
  const doc = new jsPDF();
  
  let y = 20;
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('CIERRE DEL DÍA', 105, y, { align: 'center' });
  
  y += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha: ${new Date(report.date).toLocaleDateString('es-ES')}`, 105, y, { align: 'center' });
  
  y += 5;
  doc.text(`Cerrado por: ${report.closedBy}`, 105, y, { align: 'center' });
  
  y += 5;
  doc.text(`ID: ${report.id}`, 105, y, { align: 'center' });
  
  y += 15;
  doc.setDrawColor(52, 73, 94);
  doc.line(20, y, 190, y);
  
  y += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(52, 152, 219);
  doc.rect(20, y - 5, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('RESUMEN FINANCIERO', 105, y, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  
  y += 12;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Ingresos Brutos:', 25, y);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(report.financial.grossRevenue), 180, y, { align: 'right' });
  
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.text('Costos Totales:', 25, y);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(report.financial.totalCosts), 180, y, { align: 'right' });
  
  y += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(25, y, 185, y);
  
  y += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('GANANCIA NETA:', 25, y);
  
  if (report.financial.netProfit >= 0) {
    doc.setTextColor(40, 167, 69);
  } else {
    doc.setTextColor(220, 53, 69);
  }
  doc.text(formatCurrency(report.financial.netProfit), 180, y, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  
  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Margen de Ganancia: ${report.financial.profitMargin.toFixed(2)}%`, 25, y);
  
  y += 15;
  doc.setDrawColor(52, 73, 94);
  doc.line(20, y, 190, y);
  
  y += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VENTAS', 20, y);
  
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.text(`Total de Órdenes: ${report.sales.totalOrders}`, 25, y);
  y += 6;
  doc.text(`Completadas: ${report.sales.completedOrders}`, 25, y);
  y += 6;
  doc.text(`Pendientes: ${report.sales.pendingOrders}`, 25, y);
  y += 6;
  doc.text(`Canceladas: ${report.sales.cancelledOrders}`, 25, y);
  y += 6;
  doc.text(`Items Vendidos: ${report.sales.totalItems}`, 25, y);
  y += 6;
  doc.text(`Ticket Promedio: ${formatCurrency(report.sales.averageOrderValue)}`, 25, y);
  
  y += 12;
  doc.setDrawColor(52, 73, 94);
  doc.line(20, y, 190, y);
  
  y += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPRAS', 20, y);
  
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.text(`Total de Órdenes: ${report.purchases.totalOrders}`, 25, y);
  y += 6;
  doc.text(`Completadas: ${report.purchases.completedOrders}`, 25, y);
  y += 6;
  doc.text(`Pendientes: ${report.purchases.pendingOrders}`, 25, y);
  y += 6;
  doc.text(`Canceladas: ${report.purchases.cancelledOrders}`, 25, y);
  y += 6;
  doc.text(`Items Comprados: ${report.purchases.totalItems}`, 25, y);
  y += 6;
  doc.text(`Orden Promedio: ${formatCurrency(report.purchases.averageOrderValue)}`, 25, y);
  
  y += 12;
  doc.setDrawColor(52, 73, 94);
  doc.line(20, y, 190, y);
  
  y += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ESTADO DEL INVENTARIO', 20, y);
  
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  doc.text(`Total de Productos: ${report.inventory.totalProducts}`, 25, y);
  y += 6;
  doc.text(`Valor Total: ${formatCurrency(report.inventory.totalValue)}`, 25, y);
  y += 6;
  doc.text(`Categorías: ${report.inventory.categoriesCount}`, 25, y);
  y += 6;
  doc.setTextColor(255, 193, 7);
  doc.text(`Stock Bajo: ${report.inventory.lowStockProducts}`, 25, y);
  doc.setTextColor(0, 0, 0);
  y += 6;
  doc.setTextColor(220, 53, 69);
  doc.text(`Productos Agotados: ${report.inventory.outOfStockProducts}`, 25, y);
  doc.setTextColor(0, 0, 0);
  
  if (report.topProducts.length > 0) {
    y += 12;
    
    if (y > 220) {
      doc.addPage();
      y = 20;
    }
    
    doc.setDrawColor(52, 73, 94);
    doc.line(20, y, 190, y);
    
    y += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOP 10 PRODUCTOS MÁS VENDIDOS', 20, y);
    
    y += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('#', 25, y);
    doc.text('Producto', 40, y);
    doc.text('Cantidad', 130, y);
    doc.text('Ingresos', 160, y);
    
    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    
    y += 6;
    doc.setFont('helvetica', 'normal');
    
    report.topProducts.slice(0, 10).forEach((product, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      if (index < 3) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }
      
      doc.text(`${index + 1}`, 25, y);
      doc.text(product.productName.substring(0, 35), 40, y);
      doc.text(product.quantitySold.toString(), 130, y);
      doc.text(formatCurrency(product.revenue), 160, y);
      
      y += 6;
    });
  }
  
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Página ${i} de ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
    doc.text(
      `Sistema de Inventario Empresarial`,
      20,
      290
    );
    doc.setTextColor(0, 0, 0);
  }
  
  const filename = `Cierre_Dia_${new Date(report.date).toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
