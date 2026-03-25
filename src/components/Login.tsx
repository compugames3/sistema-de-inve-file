import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock, UserPlus } from '@phosphor-icons/react';
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" weight="duotone" />
            </div>
          </div>
          <CardTitle className="text-3xl font-semibold">Sistema de Inventario</CardTitle>
          <CardDescription>Ingrese sus credenciales para acceder</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Iniciar Sesión
            </Button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-3">
              ¿No tiene una cuenta?
            </p>
            <Button 
              variant="outline" 
              onClick={onShowRegister}
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Crear Nuevo Usuario
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-4">
            Usuario predeterminado: <span className="font-mono font-semibold">admin</span> / Contraseña: <span className="font-mono font-semibold">admin123</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
