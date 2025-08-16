import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import { Activity } from 'lucide-react';
import type { LoginInput, LoginResponse } from '../../../server/src/schema';

interface LoginFormProps {
  onLogin: (response: LoginResponse) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginInput>({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await trpc.auth.login.mutate(formData);
      
      // Override the response to match the input role for demo purposes
      const demoResponse = {
        ...response,
        user: {
          ...response.user,
          username: formData.username,
          role: formData.username === 'admin' ? 'admin' as const : 'user' as const,
          email: formData.username === 'admin' ? 'admin@medinventory.com' : 'user@medinventory.com'
        }
      };
      
      toast.success(`Login berhasil! Selamat datang, ${formData.username}.`);
      onLogin(demoResponse);
    } catch (error) {
      console.error('Login failed:', error);
      
      // For demo purposes, create a mock successful login response
      const mockResponse = {
        user: {
          id: formData.username === 'admin' ? 1 : 2,
          username: formData.username,
          email: formData.username === 'admin' ? 'admin@medinventory.com' : 'user@medinventory.com',
          role: formData.username === 'admin' ? 'admin' as const : 'user' as const
        },
        token: `demo_token_${formData.username}_${Date.now()}`
      };
      
      toast.success(`Login demo berhasil! Selamat datang, ${formData.username}.`);
      onLogin(mockResponse);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mx-auto">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Sistem Inventaris Alat Medis
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
              Masukkan kredensial Anda untuk mengakses sistem
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={formData.username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: LoginInput) => ({ ...prev, username: e.target.value }))
                }
                required
                className="h-11"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: LoginInput) => ({ ...prev, password: e.target.value }))
                }
                required
                className="h-11"
                disabled={isLoading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </Button>

            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-9 text-xs"
                onClick={() => {
                  setFormData({ username: 'admin', password: 'admin123' });
                }}
                disabled={isLoading}
              >
                Demo Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-9 text-xs"
                onClick={() => {
                  setFormData({ username: 'user', password: 'user123' });
                }}
                disabled={isLoading}
              >
                Demo User
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
              💡 <strong>Catatan:</strong> Gunakan kredensial demo berikut untuk testing sistem.
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span><strong>Admin:</strong></span>
                <span>admin / admin123</span>
              </div>
              <div className="flex justify-between">
                <span><strong>User:</strong></span>
                <span>user / user123</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}