import { useState, useEffect } from 'react';
import { trpc } from '@/utils/trpc';
import { LoginForm } from '@/components/LoginForm';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { InventoryManagement } from '@/components/InventoryManagement';
import { UserManagement } from '@/components/UserManagement';
import { ProfileManagement } from '@/components/ProfileManagement';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'sonner';
import type { LoginResponse } from '../../server/src/schema';

type ActivePage = 'dashboard' | 'inventory' | 'users' | 'profile';

function App() {
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      validateExistingToken(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateExistingToken = async (savedToken: string) => {
    try {
      // For demo tokens, validate them directly
      if (savedToken.startsWith('demo_token_')) {
        const username = savedToken.includes('admin') ? 'admin' : 'user';
        const mockUser = {
          id: username === 'admin' ? 1 : 2,
          username: username,
          email: username === 'admin' ? 'admin@medinventory.com' : 'user@medinventory.com',
          role: username === 'admin' ? 'admin' as const : 'user' as const
        };
        setUser(mockUser);
        setToken(savedToken);
        setIsLoading(false);
        return;
      }

      const response = await trpc.auth.validateToken.query({ token: savedToken });
      if (response.valid && response.user) {
        setUser(response.user);
        setToken(savedToken);
      } else {
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      localStorage.removeItem('auth_token');
      console.error('Token validation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (loginResponse: LoginResponse) => {
    setUser(loginResponse.user);
    setToken(loginResponse.token);
    localStorage.setItem('auth_token', loginResponse.token);
  };

  const handleLogout = async () => {
    try {
      await trpc.auth.logout.mutate();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      setActivePage('dashboard');
    }
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <InventoryManagement />;
      case 'users':
        return user?.role === 'admin' ? <UserManagement /> : <Dashboard />;
      case 'profile':
        return <ProfileManagement user={user} />;
      default:
        return <Dashboard />;
    }
  };

  if (isLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-pulse text-lg">Memuat...</div>
        </div>
      </ThemeProvider>
    );
  }

  if (!user || !token) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          <LoginForm onLogin={handleLogin} />
          <Toaster position="top-right" />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background flex">
        <Sidebar
          user={user}
          activePage={activePage}
          onPageChange={setActivePage}
          onLogout={handleLogout}
        />
        <main className="flex-1 p-6 ml-64">
          {renderActivePage()}
        </main>
        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  );
}

export default App;