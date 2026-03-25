import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock, UserPlus, Package, ShieldCheck, Database, ChartLineUp, Clipboard, TrendUp, Briefcase } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  onShowRegister: () => void;
}

export function Login({ onLogin, onShowRegister }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Por favor complete todos los campos');
      return;
    }
    
    onLogin(username, password);
  };

  const features = [
    { icon: Package, label: 'Inventario Completo', color: 'text-primary' },
    { icon: ChartLineUp, label: 'Estadísticas en Tiempo Real', color: 'text-accent' },
    { icon: Clipboard, label: 'Órdenes y Ventas', color: 'text-success' },
    { icon: TrendUp, label: 'Cierre del Día', color: 'text-warning' },
  ];

  return (
    <div className="h-screen w-screen flex items-center justify-center p-4 lg:p-8 overflow-hidden relative bg-gradient-to-br from-primary/5 via-accent/5 to-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />
      
      <motion.div
        className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col gap-8"
        >
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Briefcase className="w-5 h-5 text-primary" weight="duotone" />
                <span className="text-sm font-semibold text-primary">Plataforma Empresarial</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-4">
                <span className="bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent">
                  Sistema de Inventario
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Gestión profesional y completa de su inventario empresarial con estadísticas en tiempo real, control de ventas y análisis del rendimiento.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all"
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${feature.color.replace('text-', '')}/10 to-${feature.color.replace('text-', '')}/5 flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className={`w-5 h-5 ${feature.color}`} weight="duotone" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground leading-tight">{feature.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="flex items-center gap-6 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm text-muted-foreground">Base de Datos Local</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-success" weight="duotone" />
                <span className="text-sm text-muted-foreground">100% Seguro</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-2xl border-primary/20 backdrop-blur-sm bg-card/95">
            <CardHeader className="text-center space-y-4 pb-6">
              <motion.div 
                className="flex justify-center mb-2"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <div className="relative">
                  <motion.div 
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent blur-xl"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-2xl">
                    <Package className="w-12 h-12 text-primary-foreground" weight="duotone" />
                  </div>
                </div>
              </motion.div>
              <div>
                <CardTitle className="text-3xl lg:text-4xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent mb-2">
                  Bienvenido
                </CardTitle>
                <CardDescription className="text-base">
                  Ingrese sus credenciales para acceder
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Label htmlFor="username" className="text-sm font-semibold">Usuario</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ingrese su usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all text-base"
                  />
                </motion.div>
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Label htmlFor="password" className="text-sm font-semibold">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all text-base"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50 transition-all bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90" 
                    size="lg"
                  >
                    <Lock className="w-5 h-5 mr-2" weight="duotone" />
                    Iniciar Sesión
                  </Button>
                </motion.div>
              </form>
              
              <motion.div 
                className="pt-4 border-t border-border/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <p className="text-sm text-muted-foreground text-center mb-3">
                  ¿No tiene una cuenta?
                </p>
                <Button 
                  variant="outline" 
                  onClick={onShowRegister}
                  className="w-full h-11 hover:bg-primary/5 hover:border-primary/30 transition-all"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Crear Nuevo Usuario
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-4 border border-border/50"
              >
                <p className="text-xs text-center text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground block mb-1">💡 Acceso de demostración</span>
                  Usuario: <span className="font-mono font-bold text-primary">admin</span> • 
                  Contraseña: <span className="font-mono font-bold text-primary">admin123</span>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
