import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Order, Product, User, DailyCloseReport } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  FileText,
  Lock,
  FilePdf
} from '@phosphor-icons/react';
import { generateDailyCloseReport, exportDailyCloseReport, printDailyCloseReport } from '@/lib/daily-close-utils';
import { formatCurrency } from '@/lib/inventory-utils';
import { generateDailyClosePDF } from '@/lib/pdf-utils';
import { toast } from 'sonner';

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold flex items-center gap-3">
            <CalendarBlank className="w-8 h-8 text-primary" weight="duotone" />
            Cierre del Día
          </h2>
          <p className="text-muted-foreground mt-2">
            Genera y revisa los reportes de cierre diario del sistema de inventario
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-xl">Generar Nuevo Cierre</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Crea un reporte completo del día actual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                        <span className="opacity-90">Fecha:</span>
                        <span className="font-semibold">{formatDate(new Date().toISOString())}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="opacity-90">Usuario:</span>
                        <span className="font-semibold">{currentUser.username}</span>
                      </div>
                      <div className="flex justify-between text-sm">
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
                      <Lock className="w-5 h-5 mr-2" weight="duotone" />
                      {isClosing ? 'Generando...' : 'Generar Cierre del Día'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-accent" weight="duotone" />
                      Información del Cierre
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-3 text-muted-foreground">
                    <p>
                      El cierre del día genera un reporte completo que incluye:
                    </p>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>Resumen financiero (ingresos, costos, ganancias)</li>
                      <li>Estadísticas de ventas y compras</li>
                      <li>Estado actual del inventario</li>
                      <li>Top 10 productos más vendidos</li>
                      <li>Alertas de stock bajo y productos agotados</li>
                    </ul>
                    <p className="mt-4 p-3 bg-muted rounded-lg text-foreground">
                      <strong>Importante:</strong> El reporte se guardará automáticamente en el historial y podrás exportarlo o imprimirlo.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col">
                <Card className="flex-1 flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">Historial de Cierres</CardTitle>
                    <CardDescription>
                      {closeHistory?.length || 0} cierre{(closeHistory?.length || 0) !== 1 ? 's' : ''} registrado{(closeHistory?.length || 0) !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-[500px] pr-4">
                      {!closeHistory || closeHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                          <CalendarBlank className="w-16 h-16 text-muted-foreground/50 mb-4" weight="thin" />
                          <p className="text-muted-foreground">No hay cierres registrados aún</p>
                          <p className="text-sm text-muted-foreground/70 mt-2">
                            Genera tu primer cierre del día para comenzar
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {closeHistory.slice().reverse().map((report) => (
                            <Card key={report.id} className="border-2 hover:border-primary/50 transition-colors">
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                      <CalendarBlank className="w-4 h-4" weight="fill" />
                                      {formatDate(report.date)}
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                      Cerrado por: {report.closedBy}
                                    </CardDescription>
                                  </div>
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {report.id.slice(0, 12)}...
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <TrendUp className="w-4 h-4" />
                                      <span>Ingresos</span>
                                    </div>
                                    <p className="font-semibold text-success">
                                      {formatCurrency(report.financial.grossRevenue)}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <TrendDown className="w-4 h-4" />
                                      <span>Costos</span>
                                    </div>
                                    <p className="font-semibold text-destructive">
                                      {formatCurrency(report.financial.totalCosts)}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <ShoppingCart className="w-4 h-4" />
                                      <span>Ventas</span>
                                    </div>
                                    <p className="font-semibold">
                                      {report.sales.completedOrders} órdenes
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Package className="w-4 h-4" />
                                      <span>Compras</span>
                                    </div>
                                    <p className="font-semibold">
                                      {report.purchases.completedOrders} órdenes
                                    </p>
                                  </div>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <CurrencyDollar className="w-5 h-5 text-accent" weight="duotone" />
                                    <span className="text-sm font-medium">Ganancia Neta</span>
                                  </div>
                                  <span className={`text-lg font-bold ${report.financial.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                                    {formatCurrency(report.financial.netProfit)}
                                  </span>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleGeneratePDF(report)}
                                  >
                                    <FilePdf className="w-4 h-4 mr-2" />
                                    PDF
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handlePrintReport(report)}
                                  >
                                    <Printer className="w-4 h-4 mr-2" />
                                    Imprimir
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleExportReport(report)}
                                  >
                                    <Download className="w-4 h-4 mr-2" />
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
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <CheckCircle className="w-6 h-6 text-success" weight="duotone" />
                Confirmar Cierre del Día
              </DialogTitle>
              <DialogDescription>
                Revisa el resumen antes de confirmar el cierre
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[600px] pr-4">
              <div className="space-y-6">
                <Card className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground">
                  <CardHeader>
                    <CardTitle>Resumen Financiero</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-lg">
                      <span>Ingresos Brutos:</span>
                      <span className="font-bold">{formatCurrency(currentReport.financial.grossRevenue)}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span>Costos Totales:</span>
                      <span className="font-bold">{formatCurrency(currentReport.financial.totalCosts)}</span>
                    </div>
                    <Separator className="bg-accent-foreground/20" />
                    <div className="flex justify-between text-2xl">
                      <span className="font-semibold">Ganancia Neta:</span>
                      <span className={`font-bold ${currentReport.financial.netProfit >= 0 ? 'text-white' : 'text-red-200'}`}>
                        {formatCurrency(currentReport.financial.netProfit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Margen de Ganancia:</span>
                      <span className="font-bold">{currentReport.financial.profitMargin.toFixed(2)}%</span>
                    </div>
                  </CardContent>
                </Card>

                {currentReport.topProducts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Trophy className="w-5 h-5 text-warning" weight="duotone" />
                        Top 10 Productos Más Vendidos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {currentReport.topProducts.slice(0, 5).map((product, index) => (
                          <div key={product.productId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge variant={index === 0 ? "default" : "outline"} className="w-8 h-8 flex items-center justify-center rounded-full">
                                {index + 1}
                              </Badge>
                              <span className="font-medium">{product.productName}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(product.revenue)}</p>
                              <p className="text-xs text-muted-foreground">{product.quantitySold} unidades</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowConfirmation(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleConfirmClose} className="flex-1" size="lg">
                    <Lock className="w-5 h-5 mr-2" weight="duotone" />
                    Confirmar Cierre del Día
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
