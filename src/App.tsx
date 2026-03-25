import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Toaster } from '@/components/ui/sonner';
import { Login } from '@/components/Login';
import { Register } from '@/components/Register';
import { Dashboard } from '@/components/Dashboard';
import { User } from '@/lib/types';
import { toast } from 'sonner';

const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123',
  isAdmin: true,
};

type View = 'login' | 'register';

function App() {
  const [currentView, setCurrentView] = useState<View>('login');
  const [users, setUsers] = useKV<User[]>('system-users', [DEFAULT_ADMIN]);
  const [currentUser, setCurrentUser] = useKV<User | null>('current-user', null);

  const handleLogin = (username: string, password: string) => {
    const allUsers = users || [DEFAULT_ADMIN];
    const user = allUsers.find(
      (u) => u.username === username && u.password === password
    );
    
    if (user) {
      setCurrentUser(user);
      toast.success(`¡Bienvenido${user.isAdmin ? ' Administrador' : ''}, ${user.username}!`);
    } else {
      toast.error('Usuario o contraseña incorrectos');
    }
  };

  const handleRegister = (username: string, password: string, isAdmin: boolean) => {
    const allUsers = users || [DEFAULT_ADMIN];
    
    const userExists = allUsers.some((u) => u.username === username);
    if (userExists) {
      toast.error('El nombre de usuario ya existe');
      return;
    }

    const newUser: User = {
      username,
      password,
      isAdmin,
    };

    setUsers((current) => [...(current || [DEFAULT_ADMIN]), newUser]);
    toast.success('Usuario creado exitosamente');
    setCurrentView('login');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    toast.success('Sesión cerrada exitosamente');
  };

  if (currentUser) {
    return (
      <>
        <Dashboard onLogout={handleLogout} />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  return (
    <>
      {currentView === 'login' ? (
        <Login 
          onLogin={handleLogin} 
          onShowRegister={() => setCurrentView('register')}
        />
      ) : (
        <Register 
          onRegister={handleRegister}
          onBackToLogin={() => setCurrentView('login')}
        />
      )}
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;