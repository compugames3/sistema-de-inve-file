import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserPlus, User, ShieldCheck, ArrowLeft, IdentificationCard } from '@phosphor-icons/react';
import { JosimarLogo } from '@/components/JosimarLogo';
import { BackgroundLogo } from '@/components/BackgroundLogo';
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
    <div className="h-screen w-screen flex items-center justify-center p-4 lg:p-8 overflow-hidden relative bg-black">
      <BackgroundLogo />
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <svg
          className="w-full h-full max-w-[600px] max-h-[600px]"
          viewBox="0 0 640 640"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform="translate(80 100)">
            <rect x="0" y="0" width="140" height="220" rx="15" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="8"/>
            <rect x="15" y="20" width="110" height="60" rx="8" fill="#DC2626" opacity="0.8"/>
            <circle cx="70" cy="140" r="12" fill="#FFFFFF" opacity="0.3"/>
            <rect x="30" y="180" width="20" height="8" rx="4" fill="#FFFFFF" opacity="0.2"/>
            <rect x="60" y="180" width="20" height="8" rx="4" fill="#FFFFFF" opacity="0.2"/>
            <rect x="90" y="180" width="20" height="8" rx="4" fill="#FFFFFF" opacity="0.2"/>
          </g>
          <g transform="translate(180 60)">
            <circle cx="30" cy="30" r="25" fill="#DC2626"/>
            <path d="M20 30 L30 20 L40 30" stroke="#FFFFFF" strokeWidth="4" fill="none"/>
          </g>
          <g transform="translate(180 130)">
            <circle cx="30" cy="30" r="20" fill="none" stroke="#DC2626" strokeWidth="4"/>
            <path d="M25 30 L35 20" stroke="#DC2626" strokeWidth="4"/>
            <path d="M35 30 L25 20" stroke="#DC2626" strokeWidth="4"/>
          </g>
          <text x="240" y="200" fontFamily="Arial, sans-serif" fontSize="100" fontWeight="bold" fill="#FFFFFF" letterSpacing="8">JOSIMAR</text>
          <g transform="translate(220 220)">
            <rect x="0" y="0" width="180" height="6" fill="#DC2626"/>
            <text x="230" y="50" fontFamily="Arial, sans-serif" fontSize="80" fontWeight="bold" fill="#DC2626" letterSpacing="15">CELL</text>
            <rect x="380" y="44" width="180" height="6" fill="#DC2626"/>
          </g>
        </svg>
      </div>
      
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
              <JosimarLogo size="clamp(64px, 15vw, 96px)" className="animate-float" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-accent to-primary bg-clip-text text-transparent mb-2">
                Josimar Cell
              </CardTitle>
              <CardDescription className="text-base">
                Registro de Usuario - Sistema de Inventario
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
