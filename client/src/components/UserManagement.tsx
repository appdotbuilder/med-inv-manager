import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Users, Crown, User as UserIcon } from 'lucide-react';
import type { User, CreateUserInput, UpdateUserInput, UserRole } from '../../../server/src/schema';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<CreateUserInput>({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  
  const [editFormData, setEditFormData] = useState<Partial<UpdateUserInput>>({});

  const loadUsers = useCallback(async () => {
    try {
      const data = await trpc.users.getAll.query();
      // If server returns empty data, use mock data for demo
      if (data.length === 0) {
        setUsers([
          {
            id: 1,
            username: 'admin',
            email: 'admin@medinventory.com',
            password_hash: 'hashed_password_placeholder',
            role: 'admin',
            created_at: new Date('2024-01-01'),
            updated_at: new Date('2024-01-01')
          },
          {
            id: 2,
            username: 'dr_sarah',
            email: 'sarah@medinventory.com',
            password_hash: 'hashed_password_placeholder',
            role: 'user',
            created_at: new Date('2024-01-10'),
            updated_at: new Date('2024-01-15')
          },
          {
            id: 3,
            username: 'nurse_budi',
            email: 'budi@medinventory.com',
            password_hash: 'hashed_password_placeholder',
            role: 'user',
            created_at: new Date('2024-01-12'),
            updated_at: new Date('2024-01-12')
          }
        ]);
        toast.success('Data demo berhasil dimuat');
      } else {
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      // Use mock data even on error for demo purposes
      setUsers([
        {
          id: 1,
          username: 'admin',
          email: 'admin@medinventory.com',
          password_hash: 'hashed_password_placeholder',
          role: 'admin',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01')
        },
        {
          id: 2,
          username: 'dr_sarah',
          email: 'sarah@medinventory.com',
          password_hash: 'hashed_password_placeholder',
          role: 'user',
          created_at: new Date('2024-01-10'),
          updated_at: new Date('2024-01-15')
        }
      ]);
      toast.error('Menggunakan data demo - server tidak terhubung');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'user'
    });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await trpc.users.create.mutate(formData);
      setUsers((prev: User[]) => [...prev, response]);
      toast.success('Pengguna berhasil ditambahkan');
      setShowAddDialog(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error('Gagal menambahkan pengguna');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        id: selectedUser.id,
        ...editFormData
      };
      const response = await trpc.users.update.mutate(updateData);
      setUsers((prev: User[]) => 
        prev.map((user: User) => 
          user.id === selectedUser.id ? response : user
        )
      );
      toast.success('Pengguna berhasil diperbarui');
      setShowEditDialog(false);
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Gagal memperbarui pengguna');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      await trpc.users.delete.mutate({ id: selectedUser.id });
      setUsers((prev: User[]) => 
        prev.filter((user: User) => user.id !== selectedUser.id)
      );
      toast.success('Pengguna berhasil dihapus');
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Gagal menghapus pengguna');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      username: user.username,
      email: user.email,
      role: user.role
    });
    setShowEditDialog(true);
  };

  const getRoleBadge = (role: UserRole) => {
    return role === 'admin' ? (
      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
        <Crown className="w-3 h-3 mr-1" />
        Administrator
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
        <UserIcon className="w-3 h-3 mr-1" />
        Pengguna Reguler
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">👥 Manajemen Pengguna</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Loading...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            👥 Manajemen Pengguna
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Kelola akun pengguna dan hak akses sistem
          </p>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Pengguna
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengguna Terdaftar</CardTitle>
          <CardDescription>
            Total: {users.length} pengguna aktif
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Belum Ada Pengguna
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Tambahkan pengguna pertama untuk mulai mengelola akses sistem.
              </p>
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Pengguna Pertama
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Role</TableHead>
                  <TableHead className="text-center">Tanggal Dibuat</TableHead>
                  <TableHead className="text-center">Terakhir Diperbarui</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="text-center">
                      {getRoleBadge(user.role)}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-500">
                      {user.created_at.toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-500">
                      {user.updated_at.toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteDialog(true);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAddUser}>
            <DialogHeader>
              <DialogTitle>Tambah Pengguna Baru</DialogTitle>
              <DialogDescription>
                Buat akun pengguna baru dan tentukan role akses.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateUserInput) => ({ ...prev, username: e.target.value }))
                  }
                  placeholder="Minimal 3 karakter"
                  required
                  minLength={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateUserInput) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateUserInput) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role Pengguna *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserRole) =>
                    setFormData((prev: CreateUserInput) => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-2" />
                        Pengguna Reguler
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center">
                        <Crown className="w-4 h-4 mr-2" />
                        Administrator
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Admin: Akses penuh. Pengguna Reguler: Hanya inventaris.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  resetForm();
                }}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Tambah Pengguna'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleEditUser}>
            <DialogHeader>
              <DialogTitle>Edit Pengguna</DialogTitle>
              <DialogDescription>
                Perbarui informasi pengguna. Kosongkan password jika tidak ingin mengubah.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_username">Username</Label>
                <Input
                  id="edit_username"
                  value={editFormData.username || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: Partial<UpdateUserInput>) => ({ ...prev, username: e.target.value }))
                  }
                  placeholder="Username"
                  minLength={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: Partial<UpdateUserInput>) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_password">Password Baru (Opsional)</Label>
                <Input
                  id="edit_password"
                  type="password"
                  value={editFormData.password || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: Partial<UpdateUserInput>) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_role">Role Pengguna</Label>
                <Select
                  value={editFormData.role || 'user'}
                  onValueChange={(value: UserRole) =>
                    setEditFormData((prev: Partial<UpdateUserInput>) => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center">
                        <UserIcon className="w-4 h-4 mr-2" />
                        Pengguna Reguler
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center">
                        <Crown className="w-4 h-4 mr-2" />
                        Administrator
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Penghapusan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengguna "{selectedUser?.username}"? 
              Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Menghapus...' : 'Hapus Pengguna'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}