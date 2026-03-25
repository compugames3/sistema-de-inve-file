import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShoppingBag, UserPlus } from '@phosphor-icons/react';
import { toast } from 'sonner';

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
    <div className="min-h-screen w-screen flex items-center justify-center p-4" style={{ backgroundColor: 'oklch(0.93 0.005 250)' }}>
      <div className="w-full max-w-md">
        <Card className="shadow-lg border border-border/60">
          <CardHeader className="text-center space-y-6 pb-8 pt-10">
            <div className="flex justify-center mb-2">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'oklch(0.88 0.01 250)' }}>
                <ShoppingBag className="w-10 h-10" style={{ color: 'oklch(0.45 0.05 250)' }} weight="regular" />
              </div>
            </div>
            <div>
              <CardTitle className="text-3xl font-semibold text-foreground mb-3">
                Josimar Cell
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Sistema de Inventario Profesional
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold text-foreground">
                  Usuario
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className="h-12 bg-muted/40 border-border text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="h-12 bg-muted/40 border-border text-base"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold text-white" 
                style={{ backgroundColor: 'oklch(0.35 0.08 250)' }}
                size="lg"
              >
                Iniciar Sesión
              </Button>
            </form>
            
            <div className="pt-4 border-t border-border/60">
              <p className="text-sm text-muted-foreground text-center mb-3">
                ¿No tiene una cuenta?
              </p>
              <Button 
                variant="outline" 
                onClick={onShowRegister}
                className="w-full h-12 border-border/60 text-foreground hover:bg-muted/40"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Crear Nuevo Usuario
              </Button>
            </div>
            
            <div className="bg-muted/40 rounded-lg p-4 border border-border/60">
              <p className="text-xs text-center text-muted-foreground leading-relaxed">
                Usuario predeterminado: <span className="font-mono font-semibold text-foreground">admin</span> / Contraseña: <span className="font-mono font-semibold text-foreground">admin123</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
