import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserPlus } from '@phosphor-icons/react';
import { JosimarLogo } from '@/components/JosimarLogo';
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
    <div className="min-h-screen w-screen flex items-center justify-center p-4 relative bg-black overflow-hidden">
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
      
      <div className="w-full max-w-md relative z-10">
        <Card className="shadow-2xl border border-border/40 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-6 pb-8 pt-10">
            <div className="flex justify-center mb-2">
              <JosimarLogo size="clamp(64px, 15vw, 96px)" className="animate-float" />
            </div>
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
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
