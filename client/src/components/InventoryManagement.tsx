import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Image, Upload, Calendar, Package } from 'lucide-react';
import type { MedicalEquipment, CreateEquipmentInput, UpdateEquipmentInput, EquipmentCondition } from '../../../server/src/schema';

export function InventoryManagement() {
  const [equipment, setEquipment] = useState<MedicalEquipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<MedicalEquipment | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<CreateEquipmentInput>({
    name: '',
    description: '',
    image_url: null,
    entry_date: new Date(),
    stock_quantity: 0,
    condition: 'good'
  });
  
  const [editFormData, setEditFormData] = useState<Partial<UpdateEquipmentInput>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const loadEquipment = useCallback(async () => {
    try {
      const data = await trpc.equipment.getAll.query();
      // If server returns empty data, use mock data for demo
      if (data.length === 0) {
        setEquipment([
          {
            id: 1,
            name: 'Stetoskop Digital',
            description: 'Stetoskop digital dengan teknologi terbaru untuk pemeriksaan jantung dan paru-paru',
            image_url: 'https://via.placeholder.com/150x150/10B981/FFFFFF?text=Stetoskop',
            entry_date: new Date('2024-01-15'),
            stock_quantity: 5,
            condition: 'good' as const,
            created_at: new Date('2024-01-15'),
            updated_at: new Date('2024-01-15')
          },
          {
            id: 2,
            name: 'Tensimeter Digital',
            description: 'Alat pengukur tekanan darah digital otomatis dengan akurasi tinggi',
            image_url: 'https://via.placeholder.com/150x150/3B82F6/FFFFFF?text=Tensimeter',
            entry_date: new Date('2024-01-10'),
            stock_quantity: 8,
            condition: 'good' as const,
            created_at: new Date('2024-01-10'),
            updated_at: new Date('2024-01-10')
          },
          {
            id: 3,
            name: 'Termometer Infrared',
            description: 'Termometer non-kontak dengan teknologi infrared untuk pengukuran suhu tubuh',
            image_url: 'https://via.placeholder.com/150x150/F59E0B/FFFFFF?text=Termometer',
            entry_date: new Date('2024-01-05'),
            stock_quantity: 3,
            condition: 'light_damage' as const,
            created_at: new Date('2024-01-05'),
            updated_at: new Date('2024-01-20')
          },
          {
            id: 4,
            name: 'Pulse Oximeter',
            description: 'Alat pengukur saturasi oksigen dan detak jantung portabel',
            image_url: 'https://via.placeholder.com/150x150/EF4444/FFFFFF?text=Oximeter',
            entry_date: new Date('2023-12-20'),
            stock_quantity: 2,
            condition: 'heavy_damage' as const,
            created_at: new Date('2023-12-20'),
            updated_at: new Date('2024-01-18')
          },
          {
            id: 5,
            name: 'Nebulizer Portable',
            description: 'Alat terapi pernapasan portable untuk pengobatan asma dan COPD',
            image_url: 'https://via.placeholder.com/150x150/8B5CF6/FFFFFF?text=Nebulizer',
            entry_date: new Date('2024-01-12'),
            stock_quantity: 4,
            condition: 'good' as const,
            created_at: new Date('2024-01-12'),
            updated_at: new Date('2024-01-12')
          }
        ]);
        toast.success('Data demo berhasil dimuat');
      } else {
        setEquipment(data);
      }
    } catch (error) {
      console.error('Failed to load equipment:', error);
      // Use mock data even on error for demo purposes
      setEquipment([
        {
          id: 1,
          name: 'Stetoskop Digital',
          description: 'Stetoskop digital dengan teknologi terbaru untuk pemeriksaan jantung dan paru-paru',
          image_url: 'https://via.placeholder.com/150x150/10B981/FFFFFF?text=Stetoskop',
          entry_date: new Date('2024-01-15'),
          stock_quantity: 5,
          condition: 'good' as const,
          created_at: new Date('2024-01-15'),
          updated_at: new Date('2024-01-15')
        },
        {
          id: 2,
          name: 'Tensimeter Digital',
          description: 'Alat pengukur tekanan darah digital otomatis dengan akurasi tinggi',
          image_url: 'https://via.placeholder.com/150x150/3B82F6/FFFFFF?text=Tensimeter',
          entry_date: new Date('2024-01-10'),
          stock_quantity: 8,
          condition: 'good' as const,
          created_at: new Date('2024-01-10'),
          updated_at: new Date('2024-01-10')
        },
        {
          id: 3,
          name: 'Termometer Infrared',
          description: 'Termometer non-kontak dengan teknologi infrared untuk pengukuran suhu tubuh',
          image_url: 'https://via.placeholder.com/150x150/F59E0B/FFFFFF?text=Termometer',
          entry_date: new Date('2024-01-05'),
          stock_quantity: 3,
          condition: 'light_damage' as const,
          created_at: new Date('2024-01-05'),
          updated_at: new Date('2024-01-20')
        }
      ]);
      toast.error('Menggunakan data demo - server tidak terhubung');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error('Format gambar harus JPG atau PNG');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran gambar maksimal 2MB');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      
      if (isEdit) {
        setEditFormData((prev: Partial<UpdateEquipmentInput>) => ({
          ...prev,
          image_url: result
        }));
      } else {
        setFormData((prev: CreateEquipmentInput) => ({
          ...prev,
          image_url: result
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image_url: null,
      entry_date: new Date(),
      stock_quantity: 0,
      condition: 'good'
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) {
      toast.error('Gambar peralatan wajib diunggah');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await trpc.equipment.create.mutate(formData);
      setEquipment((prev: MedicalEquipment[]) => [...prev, response]);
      toast.success('Peralatan berhasil ditambahkan');
      setShowAddDialog(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create equipment:', error);
      toast.error('Gagal menambahkan peralatan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment) return;

    setIsSubmitting(true);
    try {
      const updateData = {
        id: selectedEquipment.id,
        ...editFormData
      };
      const response = await trpc.equipment.update.mutate(updateData);
      setEquipment((prev: MedicalEquipment[]) => 
        prev.map((item: MedicalEquipment) => 
          item.id === selectedEquipment.id ? response : item
        )
      );
      toast.success('Peralatan berhasil diperbarui');
      setShowEditDialog(false);
    } catch (error) {
      console.error('Failed to update equipment:', error);
      toast.error('Gagal memperbarui peralatan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEquipment = async () => {
    if (!selectedEquipment) return;

    setIsSubmitting(true);
    try {
      await trpc.equipment.delete.mutate({ id: selectedEquipment.id });
      setEquipment((prev: MedicalEquipment[]) => 
        prev.filter((item: MedicalEquipment) => item.id !== selectedEquipment.id)
      );
      toast.success('Peralatan berhasil dihapus');
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete equipment:', error);
      toast.error('Gagal menghapus peralatan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (item: MedicalEquipment) => {
    setSelectedEquipment(item);
    setEditFormData({
      name: item.name,
      description: item.description,
      image_url: item.image_url,
      entry_date: item.entry_date,
      stock_quantity: item.stock_quantity,
      condition: item.condition
    });
    setImagePreview(item.image_url);
    setShowEditDialog(true);
  };

  const getConditionBadge = (condition: EquipmentCondition) => {
    const configs = {
      good: { label: 'Baik', className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
      light_damage: { label: 'Rusak Ringan', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' },
      heavy_damage: { label: 'Rusak Berat', className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' }
    };
    const config = configs[condition];
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">📦 Data Inventaris</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Loading...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
            📦 Data Inventaris
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Kelola data peralatan medis dan informasi inventaris
          </p>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Peralatan
        </Button>
      </div>

      {/* Equipment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Peralatan Medis</CardTitle>
          <CardDescription>
            Total: {equipment.length} peralatan terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {equipment.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Belum Ada Peralatan
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Mulai dengan menambahkan peralatan medis pertama Anda.
              </p>
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Peralatan Pertama
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Gambar</TableHead>
                  <TableHead>Nama Peralatan</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead className="text-center">Stok</TableHead>
                  <TableHead className="text-center">Kondisi</TableHead>
                  <TableHead className="text-center">Tanggal Masuk</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment.map((item: MedicalEquipment) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Image className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                    <TableCell className="text-center font-mono">{item.stock_quantity}</TableCell>
                    <TableCell className="text-center">
                      {getConditionBadge(item.condition)}
                    </TableCell>
                    <TableCell className="text-center text-sm text-gray-500">
                      {item.entry_date.toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEquipment(item);
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

      {/* Add Equipment Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAddEquipment}>
            <DialogHeader>
              <DialogTitle>Tambah Peralatan Baru</DialogTitle>
              <DialogDescription>
                Lengkapi informasi peralatan medis yang akan ditambahkan.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Peralatan *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateEquipmentInput) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Contoh: Stetoskop Digital"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData((prev: CreateEquipmentInput) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Deskripsi lengkap peralatan..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Gambar Peralatan * (JPG/PNG, max 2MB)</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    id="image"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleImageChange(e)}
                    className="hidden"
                  />
                  <Label 
                    htmlFor="image"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Klik untuk pilih gambar</p>
                      </div>
                    )}
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entry_date">Tanggal Masuk *</Label>
                  <Input
                    id="entry_date"
                    type="date"
                    value={formData.entry_date.toISOString().split('T')[0]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateEquipmentInput) => ({ 
                        ...prev, 
                        entry_date: new Date(e.target.value) 
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Jumlah Stok *</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateEquipmentInput) => ({ 
                        ...prev, 
                        stock_quantity: parseInt(e.target.value) || 0 
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Kondisi *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value: EquipmentCondition) =>
                    setFormData((prev: CreateEquipmentInput) => ({ ...prev, condition: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">🟢 Baik</SelectItem>
                    <SelectItem value="light_damage">🟡 Rusak Ringan</SelectItem>
                    <SelectItem value="heavy_damage">🔴 Rusak Berat</SelectItem>
                  </SelectContent>
                </Select>
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
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Equipment Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleEditEquipment}>
            <DialogHeader>
              <DialogTitle>Edit Peralatan</DialogTitle>
              <DialogDescription>
                Perbarui informasi peralatan medis.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Nama Peralatan</Label>
                <Input
                  id="edit_name"
                  value={editFormData.name || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData((prev: Partial<UpdateEquipmentInput>) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Nama peralatan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_description">Deskripsi</Label>
                <Textarea
                  id="edit_description"
                  value={editFormData.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setEditFormData((prev: Partial<UpdateEquipmentInput>) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Deskripsi peralatan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_image">Ganti Gambar (Opsional)</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    id="edit_image"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleImageChange(e, true)}
                    className="hidden"
                  />
                  <Label 
                    htmlFor="edit_image"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Klik untuk ganti gambar</p>
                      </div>
                    )}
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_entry_date">Tanggal Masuk</Label>
                  <Input
                    id="edit_entry_date"
                    type="date"
                    value={editFormData.entry_date?.toISOString().split('T')[0] || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditFormData((prev: Partial<UpdateEquipmentInput>) => ({ 
                        ...prev, 
                        entry_date: new Date(e.target.value) 
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_stock_quantity">Jumlah Stok</Label>
                  <Input
                    id="edit_stock_quantity"
                    type="number"
                    min="0"
                    value={editFormData.stock_quantity || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditFormData((prev: Partial<UpdateEquipmentInput>) => ({ 
                        ...prev, 
                        stock_quantity: parseInt(e.target.value) || 0 
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_condition">Kondisi</Label>
                <Select
                  value={editFormData.condition || 'good'}
                  onValueChange={(value: EquipmentCondition) =>
                    setEditFormData((prev: Partial<UpdateEquipmentInput>) => ({ ...prev, condition: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="good">🟢 Baik</SelectItem>
                    <SelectItem value="light_damage">🟡 Rusak Ringan</SelectItem>
                    <SelectItem value="heavy_damage">🔴 Rusak Berat</SelectItem>
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
              Apakah Anda yakin ingin menghapus peralatan "{selectedEquipment?.name}"? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEquipment}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}