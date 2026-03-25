import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserPlus, User, ShieldCheck } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface RegisterProps {
  onRegister: (username: string, password: string, isAdmin: boolean) => void;
  onBackToLogin: () => void;
}

export function Register({ onRegister, onBackToLogin }: RegisterProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'visitor'>('visitor');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password || !confirmPassword) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    if (username.length < 3) {
      toast.error('El usuario debe tener al menos 3 caracteres');
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    onRegister(username, password, role === 'admin');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-accent" weight="duotone" />
            </div>
          </div>
          <CardTitle className="text-3xl font-semibold">Crear Nuevo Usuario</CardTitle>
          <CardDescription>Complete el formulario para registrar un nuevo usuario</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-username">Usuario</Label>
              <Input
                id="reg-username"
                type="text"
                placeholder="Ingrese nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Contraseña</Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Repita la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-3">
              <Label>Tipo de Usuario</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as 'admin' | 'visitor')}>
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/5 transition-colors">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin" className="flex-1 cursor-pointer flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" weight="duotone" />
                    <div>
                      <div className="font-semibold">Administrador</div>
                      <div className="text-xs text-muted-foreground">Acceso completo al sistema</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/5 transition-colors">
                  <RadioGroupItem value="visitor" id="visitor" />
                  <Label htmlFor="visitor" className="flex-1 cursor-pointer flex items-center gap-2">
                    <User className="w-5 h-5 text-muted-foreground" weight="duotone" />
                    <div>
                      <div className="font-semibold">Visitante</div>
                      <div className="text-xs text-muted-foreground">Solo lectura del inventario</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onBackToLogin} className="flex-1">
                Volver
              </Button>
              <Button type="submit" className="flex-1" size="lg">
                Crear Usuario
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
