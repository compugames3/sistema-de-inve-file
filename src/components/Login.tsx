import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock, UserPlus, Package, ShieldCheck, Database } from '@phosphor-icons/react';
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

  return (
    <div className="h-screen w-screen flex items-center justify-center p-4 overflow-hidden relative bg-gradient-to-br from-primary/10 via-accent/5 to-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <Card className="w-full max-w-md shadow-2xl border-primary/20 backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center space-y-3 pb-6">
            <motion.div 
              className="flex justify-center mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent blur-lg opacity-50" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Package className="w-10 h-10 text-primary-foreground" weight="duotone" />
                </div>
              </div>
            </motion.div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
              Sistema de Inventario
            </CardTitle>
            <CardDescription className="text-base">
              Plataforma profesional de gestión empresarial
            </CardDescription>
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Database className="w-4 h-4 text-accent" weight="duotone" />
                <span>Base de Datos</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-success" weight="duotone" />
                <span>Seguro</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="username" className="text-sm font-medium">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingrese su usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className="h-11 bg-background/50"
                />
              </motion.div>
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="h-11 bg-background/50"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button type="submit" className="w-full h-11 text-base font-medium shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all" size="lg">
                  <Lock className="w-5 h-5 mr-2" weight="duotone" />
                  Iniciar Sesión
                </Button>
              </motion.div>
            </form>
            
            <motion.div 
              className="pt-4 border-t border-border/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
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
              transition={{ delay: 0.7 }}
              className="bg-muted/50 rounded-lg p-3 border border-border/50"
            >
              <p className="text-xs text-center text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Acceso de demostración:</span><br/>
                Usuario: <span className="font-mono font-semibold text-accent">admin</span> · 
                Contraseña: <span className="font-mono font-semibold text-accent">admin123</span>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
