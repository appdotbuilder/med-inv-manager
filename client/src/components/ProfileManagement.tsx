import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, User as UserIcon, Mail, Calendar, Shield } from 'lucide-react';
import type { LoginResponse } from '../../../server/src/schema';

interface ProfileManagementProps {
  user: LoginResponse['user'] | null;
}

export function ProfileManagement({ user }: ProfileManagementProps) {
  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            👤 Profil Pengguna
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Loading profil pengguna...
          </p>
        </div>
      </div>
    );
  }

  const getRoleBadge = () => {
    return user.role === 'admin' ? (
      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
        <Crown className="w-4 h-4 mr-1" />
        Administrator
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
        <UserIcon className="w-4 h-4 mr-1" />
        Pengguna Reguler
      </Badge>
    );
  };

  const getPermissions = () => {
    if (user.role === 'admin') {
      return [
        '✅ Mengelola inventaris alat medis',
        '✅ Menambah, edit, dan hapus peralatan',
        '✅ Melihat dashboard dan statistik',
        '✅ Mengelola pengguna sistem',
        '✅ Membuat dan menghapus akun pengguna',
        '✅ Mengubah role dan hak akses',
        '✅ Akses penuh ke semua fitur sistem'
      ];
    } else {
      return [
        '✅ Mengelola inventaris alat medis',
        '✅ Menambah, edit, dan hapus peralatan',
        '✅ Melihat dashboard dan statistik',
        '❌ Manajemen pengguna (Khusus Admin)',
        '❌ Membuat akun pengguna baru',
        '❌ Mengubah role pengguna lain'
      ];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          👤 Profil Pengguna
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Informasi akun dan hak akses Anda dalam sistem
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mr-3">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              Informasi Akun
            </CardTitle>
            <CardDescription>
              Detail informasi akun pengguna Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Username
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {user.username}
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700"></div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {user.email}
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700"></div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Shield className="w-4 h-4 mr-2" />
                  Role
                </div>
                <div>
                  {getRoleBadge()}
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700"></div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  ID Pengguna
                </div>
                <div className="font-mono text-sm text-gray-900 dark:text-white">
                  #{user.id.toString().padStart(4, '0')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions & Access Rights */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Hak Akses & Izin
            </CardTitle>
            <CardDescription>
              Daftar fitur dan operasi yang dapat Anda akses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getPermissions().map((permission: string, index: number) => (
                <div key={index} className="text-sm">
                  {permission.startsWith('✅') ? (
                    <div className="text-green-700 dark:text-green-400">
                      {permission}
                    </div>
                  ) : (
                    <div className="text-gray-500 dark:text-gray-400">
                      {permission}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>ℹ️ Informasi Sistem</CardTitle>
          <CardDescription>
            Informasi tentang sistem inventaris alat medis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Sistem Inventaris
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Aplikasi manajemen inventaris alat medis dengan fitur lengkap untuk mengelola peralatan medis, monitoring kondisi, dan analisis data inventaris.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Fitur Utama
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Dashboard statistik real-time</li>
                <li>• Manajemen inventaris lengkap</li>
                <li>• Upload dan kelola gambar</li>
                <li>• Sistem role berbasis pengguna</li>
                <li>• Mode terang & gelap</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Keamanan
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Autentikasi aman dengan token</li>
                <li>• Validasi input komprehensif</li>
                <li>• Enkripsi password</li>
                <li>• Kontrol akses berbasis role</li>
                <li>• Session management</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-sm bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/10 dark:to-green-900/10 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Selamat Datang, {user.username}! 👋
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                {user.role === 'admin' 
                  ? 'Sebagai Administrator, Anda memiliki akses penuh ke semua fitur sistem inventaris alat medis.' 
                  : 'Sebagai Pengguna Reguler, Anda dapat mengelola inventaris alat medis dan melihat data statistik.'}
              </p>
            </div>
            
            <div className="pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 <strong>Tips:</strong> Gunakan sidebar navigasi di sebelah kiri untuk mengakses berbagai fitur yang tersedia sesuai dengan role Anda.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}