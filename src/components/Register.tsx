import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserPlus, User, ShieldCheck, ArrowLeft } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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
    <div className="h-screen w-screen flex items-center justify-center p-4 overflow-hidden relative bg-gradient-to-br from-accent/10 via-primary/5 to-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="shadow-2xl border-accent/20 backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center space-y-3 pb-6">
            <motion.div 
              className="flex justify-center mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent to-primary blur-lg opacity-50" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg">
                  <UserPlus className="w-10 h-10 text-primary-foreground" weight="duotone" />
                </div>
              </div>
            </motion.div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-br from-accent to-primary bg-clip-text text-transparent">
              Crear Usuario
            </CardTitle>
            <CardDescription className="text-base">
              Registre un nuevo usuario en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="reg-username" className="text-sm font-medium">Usuario</Label>
                <Input
                  id="reg-username"
                  type="text"
                  placeholder="Mínimo 3 caracteres"
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
                <Label htmlFor="reg-password" className="text-sm font-medium">Contraseña</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="h-11 bg-background/50"
                />
              </motion.div>
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Label htmlFor="confirm-password" className="text-sm font-medium">Confirmar Contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Repita la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="h-11 bg-background/50"
                />
              </motion.div>

              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Label className="text-sm font-medium">Tipo de Usuario</Label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value as 'admin' | 'visitor')}>
                  <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin" className="flex-1 cursor-pointer flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-primary" weight="duotone" />
                      </div>
                      <div>
                        <div className="font-semibold text-base">Administrador</div>
                        <div className="text-xs text-muted-foreground">Control total del sistema</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-accent/30 hover:bg-accent/5 transition-all cursor-pointer">
                    <RadioGroupItem value="visitor" id="visitor" />
                    <Label htmlFor="visitor" className="flex-1 cursor-pointer flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <User className="w-6 h-6 text-muted-foreground" weight="duotone" />
                      </div>
                      <div>
                        <div className="font-semibold text-base">Visitante</div>
                        <div className="text-xs text-muted-foreground">Solo lectura del inventario</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </motion.div>

              <motion.div 
                className="flex gap-3 pt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button type="button" variant="outline" onClick={onBackToLogin} className="flex-1 h-11 hover:bg-muted/80">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Volver
                </Button>
                <Button type="submit" className="flex-1 h-11 shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-all" size="lg">
                  <UserPlus className="w-5 h-5 mr-2" weight="duotone" />
                  Registrar
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
