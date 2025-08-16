import { z } from 'zod';

// Enum for user roles
export const userRoleSchema = z.enum(['admin', 'user']);
export type UserRole = z.infer<typeof userRoleSchema>;

// Enum for equipment conditions
export const equipmentConditionSchema = z.enum(['good', 'light_damage', 'heavy_damage']);
export type EquipmentCondition = z.infer<typeof equipmentConditionSchema>;

// User schema
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  password_hash: z.string(),
  role: userRoleSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Medical equipment schema
export const medicalEquipmentSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  image_url: z.string().nullable(),
  entry_date: z.coerce.date(),
  stock_quantity: z.number().int(),
  condition: equipmentConditionSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type MedicalEquipment = z.infer<typeof medicalEquipmentSchema>;

// Authentication schemas
export const loginInputSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const loginResponseSchema = z.object({
  user: z.object({
    id: z.number(),
    username: z.string(),
    email: z.string(),
    role: userRoleSchema
  }),
  token: z.string()
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

// User management schemas (Admin only)
export const createUserInputSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: userRoleSchema
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const updateUserInputSchema = z.object({
  id: z.number(),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: userRoleSchema.optional()
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

export const deleteUserInputSchema = z.object({
  id: z.number()
});

export type DeleteUserInput = z.infer<typeof deleteUserInputSchema>;

// Medical equipment management schemas
export const createEquipmentInputSchema = z.object({
  name: z.string().min(1, 'Equipment name is required'),
  description: z.string().min(1, 'Description is required'),
  image_url: z.string().nullable(), // Image URL after upload
  entry_date: z.coerce.date(),
  stock_quantity: z.number().int().nonnegative('Stock quantity must be non-negative'),
  condition: equipmentConditionSchema
});

export type CreateEquipmentInput = z.infer<typeof createEquipmentInputSchema>;

export const updateEquipmentInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Equipment name is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  image_url: z.string().nullable().optional(), // New image URL or null to remove
  entry_date: z.coerce.date().optional(),
  stock_quantity: z.number().int().nonnegative('Stock quantity must be non-negative').optional(),
  condition: equipmentConditionSchema.optional()
});

export type UpdateEquipmentInput = z.infer<typeof updateEquipmentInputSchema>;

export const deleteEquipmentInputSchema = z.object({
  id: z.number()
});

export type DeleteEquipmentInput = z.infer<typeof deleteEquipmentInputSchema>;

// Dashboard data schema
export const dashboardStatsSchema = z.object({
  total_equipment: z.number().int(),
  total_stock: z.number().int(),
  condition_summary: z.object({
    good: z.number().int(),
    light_damage: z.number().int(),
    heavy_damage: z.number().int()
  })
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

// File upload schemas
export const fileUploadInputSchema = z.object({
  filename: z.string(),
  mimetype: z.string(),
  data: z.string() // Base64 encoded file data
});

export type FileUploadInput = z.infer<typeof fileUploadInputSchema>;

export const fileUploadResponseSchema = z.object({
  url: z.string(),
  filename: z.string()
});

export type FileUploadResponse = z.infer<typeof fileUploadResponseSchema>;