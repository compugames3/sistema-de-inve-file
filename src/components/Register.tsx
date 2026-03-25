import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserPlus, User, ShieldCheck, ArrowLeft, IdentificationCard } from '@phosphor-icons/react';
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
    <div className="h-screen w-screen flex items-center justify-center p-4 lg:p-8 overflow-hidden relative bg-gradient-to-br from-accent/8 via-primary/5 to-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(96,165,250,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />
      
      <motion.div
        className="absolute top-20 right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
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
        className="absolute bottom-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
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
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-xl"
      >
        <Card className="shadow-2xl border-accent/20 backdrop-blur-sm bg-card/95">
          <CardHeader className="text-center space-y-4 pb-6">
            <motion.div 
              className="flex justify-center mb-2"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="relative">
                <motion.div 
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent to-primary blur-xl"
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
                <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-accent via-primary to-accent flex items-center justify-center shadow-2xl">
                  <IdentificationCard className="w-12 h-12 text-primary-foreground" weight="duotone" />
                </div>
              </div>
            </motion.div>
            <div>
              <CardTitle className="text-3xl lg:text-4xl font-bold bg-gradient-to-br from-accent to-primary bg-clip-text text-transparent mb-2">
                Registro de Usuario
              </CardTitle>
              <CardDescription className="text-base">
                Complete los datos para crear una nueva cuenta
              </CardDescription>
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
                <Label htmlFor="reg-username" className="text-sm font-semibold">Nombre de Usuario</Label>
                <Input
                  id="reg-username"
                  type="text"
                  placeholder="Mínimo 3 caracteres"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className="h-12 bg-background/50 border-border/50 focus:border-accent/50 transition-all text-base"
                />
              </motion.div>
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Label htmlFor="reg-password" className="text-sm font-semibold">Contraseña</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="h-12 bg-background/50 border-border/50 focus:border-accent/50 transition-all text-base"
                />
              </motion.div>
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Label htmlFor="confirm-password" className="text-sm font-semibold">Confirmar Contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Repita la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="h-12 bg-background/50 border-border/50 focus:border-accent/50 transition-all text-base"
                />
              </motion.div>

              <motion.div 
                className="space-y-3 pt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Label className="text-sm font-semibold">Tipo de Usuario</Label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value as 'admin' | 'visitor')}>
                  <motion.div 
                    className="flex items-center space-x-3 p-5 rounded-xl border-2 border-border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                    whileHover={{ scale: 1.02, x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <RadioGroupItem value="admin" id="admin" className="w-5 h-5" />
                    <Label htmlFor="admin" className="flex-1 cursor-pointer flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <ShieldCheck className="w-7 h-7 text-primary" weight="duotone" />
                      </div>
                      <div>
                        <div className="font-bold text-base text-foreground">Administrador</div>
                        <div className="text-sm text-muted-foreground">Acceso completo a todas las funciones</div>
                      </div>
                    </Label>
                  </motion.div>
                  <motion.div 
                    className="flex items-center space-x-3 p-5 rounded-xl border-2 border-border hover:border-accent/40 hover:bg-accent/5 transition-all cursor-pointer"
                    whileHover={{ scale: 1.02, x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <RadioGroupItem value="visitor" id="visitor" className="w-5 h-5" />
                    <Label htmlFor="visitor" className="flex-1 cursor-pointer flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        <User className="w-7 h-7 text-muted-foreground" weight="duotone" />
                      </div>
                      <div>
                        <div className="font-bold text-base text-foreground">Visitante</div>
                        <div className="text-sm text-muted-foreground">Solo visualización del inventario</div>
                      </div>
                    </Label>
                  </motion.div>
                </RadioGroup>
              </motion.div>

              <motion.div 
                className="flex gap-3 pt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onBackToLogin} 
                  className="flex-1 h-12 hover:bg-muted/80 transition-all text-base font-semibold"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Volver
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-12 shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/50 transition-all bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-base font-semibold" 
                  size="lg"
                >
                  <UserPlus className="w-5 h-5 mr-2" weight="duotone" />
                  Crear Cuenta
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
