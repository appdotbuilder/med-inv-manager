import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { 
  Activity,
  LayoutDashboard, 
  Package, 
  Users, 
  User as UserIcon, 
  LogOut, 
  Sun, 
  Moon, 
  Monitor 
} from 'lucide-react';
import type { LoginResponse } from '../../../server/src/schema';

type ActivePage = 'dashboard' | 'inventory' | 'users' | 'profile';

interface SidebarProps {
  user: LoginResponse['user'];
  activePage: ActivePage;
  onPageChange: (page: ActivePage) => void;
  onLogout: () => void;
}

export function Sidebar({ user, activePage, onPageChange, onLogout }: SidebarProps) {
  const { theme, setTheme } = useTheme();

  const menuItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Ringkasan data inventaris'
    },
    {
      id: 'inventory' as const,
      label: 'Data Inventaris',
      icon: Package,
      description: 'Kelola alat medis'
    },
    ...(user.role === 'admin' ? [{
      id: 'users' as const,
      label: 'Manajemen Pengguna',
      icon: Users,
      description: 'Kelola akun pengguna'
    }] : []),
    {
      id: 'profile' as const,
      label: 'Profil',
      icon: UserIcon,
      description: 'Informasi akun'
    }
  ];

  const themeOptions = [
    { value: 'light', icon: Sun, label: 'Terang' },
    { value: 'dark', icon: Moon, label: 'Gelap' },
    { value: 'system', icon: Monitor, label: 'Sistem' }
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg z-50">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              MedInventory
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sistem Inventaris
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full">
            <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user.username}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {user.role === 'admin' ? '👑 Administrator' : '👤 Pengguna Reguler'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start h-auto p-3 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-md' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => onPageChange(item.id)}
            >
              <Icon className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium text-sm">{item.label}</div>
                <div className={`text-xs ${
                  isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {item.description}
                </div>
              </div>
            </Button>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
          TEMA TAMPILAN
        </p>
        <div className="space-y-1">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.value;
            
            return (
              <Button
                key={option.value}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={`w-full justify-start ${
                  isActive 
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
                onClick={() => setTheme(option.value as any)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Keluar
        </Button>
      </div>
    </div>
  );
}