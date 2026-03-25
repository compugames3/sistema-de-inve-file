import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Toaster } from '@/components/ui/sonner';
import { Login } from '@/components/Login';
import { Dashboard } from '@/components/Dashboard';
import { toast } from 'sonner';

const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'admin123';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useKV<boolean>('is-authenticated', false);
  const [adminCredentials] = useKV<{ username: string; password: string }>('admin-credentials', {
    username: DEFAULT_USERNAME,
    password: DEFAULT_PASSWORD,
  });

  const handleLogin = (username: string, password: string) => {
    const creds = adminCredentials || { username: DEFAULT_USERNAME, password: DEFAULT_PASSWORD };
    
    if (username === creds.username && password === creds.password) {
      setIsAuthenticated(true);
      toast.success('¡Bienvenido al Sistema de Inventario!');
    } else {
      toast.error('Usuario o contraseña incorrectos');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast.success('Sesión cerrada exitosamente');
  };

  return (
    <>
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;