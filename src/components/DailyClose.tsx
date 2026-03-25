import { useState, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { Order, Product, User, DailyCloseReport } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  CalendarBlank, 
  TrendUp, 
  TrendDown, 
  CurrencyDollar, 
  ShoppingCart, 
  Package, 
  CheckCircle, 
  Clock, 
  XCircle,
  Trophy,
  Download,
  Printer,
  Lock,
  FilePdf,
  Funnel,
  X
} from '@phosphor-icons/react';
import { generateDailyCloseReport, exportDailyCloseReport, printDailyCloseReport } from '@/lib/daily-close-utils';
import { formatCurrency } from '@/lib/inventory-utils';
import { generateDailyClosePDF } from '@/lib/pdf-utils';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DailyCloseProps {
  products: Product[];
  currentUser: User;
}

export function DailyClose({ products, currentUser }: DailyCloseProps) {
  const [orders] = useKV<Order[]>('system-orders', []);
  const [closeHistory, setCloseHistory] = useKV<DailyCloseReport[]>('daily-close-history', []);
  const [isClosing, setIsClosing] = useState(false);
  const [currentReport, setCurrentReport] = useState<DailyCloseReport | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const handleGenerateClose = () => {
    setIsClosing(true);
    
    const report = generateDailyCloseReport(
      orders || [],
      products || [],
      currentUser.username
    );
    
    setCurrentReport(report);
    setIsClosing(false);
    setShowConfirmation(true);
  };

  const handleConfirmClose = () => {
    if (!currentReport) return;

    setCloseHistory((current) => [...(current || []), currentReport]);
    
    toast.success('Cierre del día guardado exitosamente', {
      description: `ID: ${currentReport.id}`,
    });
    
    setShowConfirmation(false);
    setCurrentReport(null);
  };

  const handleExportReport = (report: DailyCloseReport) => {
    exportDailyCloseReport(report);
    toast.success('Reporte exportado exitosamente');
  };

  const handlePrintReport = (report: DailyCloseReport) => {
    printDailyCloseReport(report);
    toast.success('Imprimiendo reporte...');
  };

  const handleGeneratePDF = (report: DailyCloseReport) => {
    generateDailyClosePDF(report);
    toast.success('Reporte PDF generado exitosamente');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredHistory = useMemo(() => {
    if (!closeHistory) return [];
    
    if (!dateRange.from && !dateRange.to) {
      return closeHistory;
    }

    return closeHistory.filter((report) => {
      const reportDate = new Date(report.date);
      const fromDate = dateRange.from ? new Date(dateRange.from) : null;
      const toDate = dateRange.to ? new Date(dateRange.to) : null;

      if (fromDate && toDate) {
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        return reportDate >= fromDate && reportDate <= toDate;
      } else if (fromDate) {
        fromDate.setHours(0, 0, 0, 0);
        return reportDate >= fromDate;
      } else if (toDate) {
        toDate.setHours(23, 59, 59, 999);
        return reportDate <= toDate;
      }

      return true;
    });
  }, [closeHistory, dateRange]);

  const clearFilters = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  const hasActiveFilters = dateRange.from !== undefined || dateRange.to !== undefined;

  const historyTotals = useMemo(() => {
    if (!filteredHistory || filteredHistory.length === 0) {
      return {
        totalRevenue: 0,
        totalCosts: 0,
        totalNetProfit: 0,
        totalSalesOrders: 0,
        totalPurchaseOrders: 0,
        count: 0
      };
    }

    return filteredHistory.reduce((acc, report) => ({
      totalRevenue: acc.totalRevenue + report.financial.grossRevenue,
      totalCosts: acc.totalCosts + report.financial.totalCosts,
      totalNetProfit: acc.totalNetProfit + report.financial.netProfit,
      totalSalesOrders: acc.totalSalesOrders + report.sales.completedOrders,
      totalPurchaseOrders: acc.totalPurchaseOrders + report.purchases.completedOrders,
      count: acc.count + 1
    }), {
      totalRevenue: 0,
      totalCosts: 0,
      totalNetProfit: 0,
      totalSalesOrders: 0,
      totalPurchaseOrders: 0,
      count: 0
    });
  }, [filteredHistory]);

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold flex items-center gap-2 md:gap-3">
            <CalendarBlank className="w-6 h-6 md:w-8 md:h-8 text-primary" weight="duotone" />
            Cierre del Día
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
            Genera y revisa los reportes de cierre diario del sistema de inventario
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl">Generar Nuevo Cierre</CardTitle>
              <CardDescription className="text-primary-foreground/80 text-sm">
                Crea un reporte completo del día actual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 md:p-6 pt-0 md:pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-xs md:text-sm">
                        <span className="opacity-90">Fecha:</span>
                        <span className="font-semibold">{formatDate(new Date().toISOString())}</span>
                      </div>
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="opacity-90">Usuario:</span>
                        <span className="font-semibold">{currentUser.username}</span>
                      </div>
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="opacity-90">Hora:</span>
                        <span className="font-semibold">{formatTime(new Date().toISOString())}</span>
                      </div>
                    </div>
                    <Separator className="bg-primary-foreground/20" />
                    <Button
                      onClick={handleGenerateClose}
                      disabled={isClosing}
                      className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                      size="lg"
                    >
                      <Lock className="w-4 h-4 md:w-5 md:h-5 mr-2" weight="duotone" />
                      <span className="text-sm md:text-base">{isClosing ? 'Generando...' : 'Generar Cierre del Día'}</span>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col space-y-4">
                {filteredHistory.length > 0 && (
                  <Card className="bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border-accent/20">
                    <CardHeader className="pb-3 p-4 md:p-6">
                      <CardTitle className="text-base md:text-lg flex items-center gap-2">
                        <CurrencyDollar className="w-4 h-4 md:w-5 md:h-5 text-accent" weight="duotone" />
                        Resumen Total del Historial
                      </CardTitle>
                      <CardDescription className="text-xs md:text-sm">
                        Suma acumulada de {historyTotals.count} cierre{historyTotals.count !== 1 ? 's' : ''}
                        {hasActiveFilters && ' (filtrado)'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-muted-foreground text-xs md:text-sm">
                            <TrendUp className="w-3 h-3 md:w-4 md:h-4" />
                            <span>Total Ingresos</span>
                          </div>
                          <p className="text-base md:text-xl font-bold text-success">
                            {formatCurrency(historyTotals.totalRevenue)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-muted-foreground text-xs md:text-sm">
                            <TrendDown className="w-3 h-3 md:w-4 md:h-4" />
                            <span>Total Costos</span>
                          </div>
                          <p className="text-base md:text-xl font-bold text-destructive">
                            {formatCurrency(historyTotals.totalCosts)}
                          </p>
                        </div>
                        <div className="space-y-1 col-span-2 lg:col-span-1">
                          <div className="flex items-center gap-1 text-muted-foreground text-xs md:text-sm">
                            <CurrencyDollar className="w-3 h-3 md:w-4 md:h-4" weight="duotone" />
                            <span>Ganancia Neta Total</span>
                          </div>
                          <p className={`text-lg md:text-2xl font-bold ${historyTotals.totalNetProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {formatCurrency(historyTotals.totalNetProfit)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-muted-foreground text-xs md:text-sm">
                            <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" />
                            <span>Total Ventas</span>
                          </div>
                          <p className="text-sm md:text-lg font-semibold">
                            {historyTotals.totalSalesOrders} órdenes
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-muted-foreground text-xs md:text-sm">
                            <Package className="w-3 h-3 md:w-4 md:h-4" />
                            <span>Total Compras</span>
                          </div>
                          <p className="text-sm md:text-lg font-semibold">
                            {historyTotals.totalPurchaseOrders} órdenes
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="flex-1 flex flex-col">
                  <CardHeader className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base md:text-lg">Historial de Cierres</CardTitle>
                        <CardDescription className="text-xs md:text-sm">
                          {filteredHistory.length} de {closeHistory?.length || 0} cierre{(closeHistory?.length || 0) !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={hasActiveFilters ? "default" : "outline"}
                              size="sm"
                              className={cn(
                                "gap-2 text-xs md:text-sm",
                                hasActiveFilters && "bg-primary text-primary-foreground"
                              )}
                            >
                              <Funnel className="w-3 h-3 md:w-4 md:h-4" weight={hasActiveFilters ? "fill" : "regular"} />
                              <span className="hidden sm:inline">Filtrar por Fecha</span>
                              <span className="sm:hidden">Filtrar</span>
                              {hasActiveFilters && (
                                <Badge variant="secondary" className="ml-1 h-4 md:h-5 px-1 md:px-1.5 text-xs">
                                  {dateRange.from && dateRange.to ? '2' : '1'}
                                </Badge>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="end">
                            <div className="p-3 md:p-4 border-b bg-muted/30">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h4 className="text-xs md:text-sm font-semibold mb-1">Filtrar por Rango de Fechas</h4>
                                  <p className="text-[10px] md:text-xs text-muted-foreground">Selecciona un rango de fechas para filtrar el historial</p>
                                </div>
                                {hasActiveFilters && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="h-auto p-1 md:p-1.5 text-xs hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Limpiar
                                  </Button>
                                )}
                              </div>
                              {(dateRange.from || dateRange.to) && (
                                <div className="text-[10px] md:text-xs space-y-1.5 bg-primary/5 p-2 rounded-md border border-primary/10">
                                  {dateRange.from && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-muted-foreground w-10 md:w-12">Desde:</span>
                                      <span className="font-semibold text-foreground">
                                        {format(dateRange.from, "d 'de' MMMM, yyyy", { locale: es })}
                                      </span>
                                    </div>
                                  )}
                                  {dateRange.to && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-muted-foreground w-10 md:w-12">Hasta:</span>
                                      <span className="font-semibold text-foreground">
                                        {format(dateRange.to, "d 'de' MMMM, yyyy", { locale: es })}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="p-2 md:p-3">
                              <Calendar
                                mode="range"
                                selected={{
                                  from: dateRange.from,
                                  to: dateRange.to,
                                }}
                                onSelect={(range) => {
                                  setDateRange({
                                    from: range?.from,
                                    to: range?.to,
                                  });
                                }}
                                numberOfMonths={1}
                                locale={es}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden p-4 md:p-6 pt-0 md:pt-0">
                    <ScrollArea className="h-[400px] md:h-[500px] pr-2 md:pr-4">
                      {!closeHistory || closeHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                          <CalendarBlank className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground/50 mb-4" weight="thin" />
                          <p className="text-sm md:text-base text-muted-foreground">No hay cierres registrados aún</p>
                          <p className="text-xs md:text-sm text-muted-foreground/70 mt-2">
                            Genera tu primer cierre del día para comenzar
                          </p>
                        </div>
                      ) : filteredHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                          <Funnel className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground/50 mb-4" weight="thin" />
                          <p className="text-sm md:text-base text-muted-foreground">No se encontraron cierres en este rango de fechas</p>
                          <p className="text-xs md:text-sm text-muted-foreground/70 mt-2">
                            Intenta ajustar los filtros de búsqueda
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                            className="mt-4"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Limpiar Filtros
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filteredHistory.slice().reverse().map((report) => (
                            <Card key={report.id} className="border-2 hover:border-primary/50 transition-colors">
                              <CardHeader className="pb-3 p-3 md:p-6 md:pb-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <CardTitle className="text-sm md:text-base flex items-center gap-2">
                                      <CalendarBlank className="w-3 h-3 md:w-4 md:h-4" weight="fill" />
                                      <span className="text-xs md:text-base">{formatDate(report.date)}</span>
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-xs">
                                      Cerrado por: {report.closedBy}
                                    </CardDescription>
                                  </div>
                                  <Badge variant="outline" className="font-mono text-[10px] md:text-xs px-1 md:px-2">
                                    {report.id.slice(0, 8)}...
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3 p-3 md:p-6 pt-0 md:pt-0">
                                <div className="grid grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <TrendUp className="w-3 h-3 md:w-4 md:h-4" />
                                      <span className="text-[10px] md:text-sm">Ingresos</span>
                                    </div>
                                    <p className="font-semibold text-success text-xs md:text-base">
                                      {formatCurrency(report.financial.grossRevenue)}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <TrendDown className="w-3 h-3 md:w-4 md:h-4" />
                                      <span className="text-[10px] md:text-sm">Costos</span>
                                    </div>
                                    <p className="font-semibold text-destructive text-xs md:text-base">
                                      {formatCurrency(report.financial.totalCosts)}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" />
                                      <span className="text-[10px] md:text-sm">Ventas</span>
                                    </div>
                                    <p className="font-semibold text-xs md:text-base">
                                      {report.sales.completedOrders} órdenes
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Package className="w-3 h-3 md:w-4 md:h-4" />
                                      <span className="text-[10px] md:text-sm">Compras</span>
                                    </div>
                                    <p className="font-semibold text-xs md:text-base">
                                      {report.purchases.completedOrders} órdenes
                                    </p>
                                  </div>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between p-2 md:p-3 bg-accent/10 rounded-lg">
                                  <div className="flex items-center gap-1 md:gap-2">
                                    <CurrencyDollar className="w-4 h-4 md:w-5 md:h-5 text-accent" weight="duotone" />
                                    <span className="text-xs md:text-sm font-medium">Ganancia Neta</span>
                                  </div>
                                  <span className={`text-sm md:text-lg font-bold ${report.financial.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                                    {formatCurrency(report.financial.netProfit)}
                                  </span>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs md:text-sm"
                                    onClick={() => handleGeneratePDF(report)}
                                  >
                                    <FilePdf className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                                    PDF
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs md:text-sm"
                                    onClick={() => handlePrintReport(report)}
                                  >
                                    <Printer className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                                    Imprimir
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 text-xs md:text-sm"
                                    onClick={() => handleExportReport(report)}
                                  >
                                    <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                                    Exportar
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>

        {currentReport && (
          <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] p-4 md:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-success" weight="duotone" />
                Confirmar Cierre del Día
              </DialogTitle>
              <DialogDescription className="text-xs md:text-sm">
                Revisa el resumen antes de confirmar el cierre
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] md:max-h-[600px] pr-2 md:pr-4">
              <div className="space-y-4 md:space-y-6">
                <Card className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground">
                  <CardHeader className="p-3 md:p-6">
                    <CardTitle className="text-base md:text-lg">Resumen Financiero</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 md:space-y-3 p-3 md:p-6 pt-0 md:pt-0">
                    <div className="flex justify-between text-sm md:text-lg">
                      <span>Ingresos Brutos:</span>
                      <span className="font-bold">{formatCurrency(currentReport.financial.grossRevenue)}</span>
                    </div>
                    <div className="flex justify-between text-sm md:text-lg">
                      <span>Costos Totales:</span>
                      <span className="font-bold">{formatCurrency(currentReport.financial.totalCosts)}</span>
                    </div>
                    <Separator className="bg-accent-foreground/20" />
                    <div className="flex justify-between text-lg md:text-2xl">
                      <span className="font-semibold">Ganancia Neta:</span>
                      <span className={`font-bold ${currentReport.financial.netProfit >= 0 ? 'text-white' : 'text-red-200'}`}>
                        {formatCurrency(currentReport.financial.netProfit)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm md:text-base">
                      <span>Margen de Ganancia:</span>
                      <span className="font-bold">{currentReport.financial.profitMargin.toFixed(2)}%</span>
                    </div>
                  </CardContent>
                </Card>

                {currentReport.topProducts.length > 0 && (
                  <Card>
                    <CardHeader className="p-3 md:p-6">
                      <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                        <Trophy className="w-4 h-4 md:w-5 md:h-5 text-warning" weight="duotone" />
                        Top 10 Productos Más Vendidos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
                      <div className="space-y-2">
                        {currentReport.topProducts.slice(0, 5).map((product, index) => (
                          <div key={product.productId} className="flex items-center justify-between p-2 md:p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                              <Badge variant={index === 0 ? "default" : "outline"} className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full text-xs">
                                {index + 1}
                              </Badge>
                              <span className="font-medium text-xs md:text-sm truncate">{product.productName}</span>
                            </div>
                            <div className="text-right ml-2">
                              <p className="font-semibold text-xs md:text-base">{formatCurrency(product.revenue)}</p>
                              <p className="text-[10px] md:text-xs text-muted-foreground">{product.quantitySold} unidades</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-2 md:pt-4">
                  <Button variant="outline" onClick={() => setShowConfirmation(false)} className="flex-1 text-sm md:text-base">
                    Cancelar
                  </Button>
                  <Button onClick={handleConfirmClose} className="flex-1" size="lg">
                    <Lock className="w-4 h-4 md:w-5 md:h-5 mr-2" weight="duotone" />
                    <span className="text-sm md:text-base">Confirmar Cierre del Día</span>
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
