import { serial, text, pgTable, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';

// Define enums for PostgreSQL
export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);
export const equipmentConditionEnum = pgEnum('equipment_condition', ['good', 'light_damage', 'heavy_damage']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('user'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Medical equipment table
export const medicalEquipmentTable = pgTable('medical_equipment', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  image_url: text('image_url'), // Nullable - can be null if no image uploaded
  entry_date: timestamp('entry_date').notNull(),
  stock_quantity: integer('stock_quantity').notNull(),
  condition: equipmentConditionEnum('condition').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// TypeScript types for the table schemas
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type MedicalEquipment = typeof medicalEquipmentTable.$inferSelect;
export type NewMedicalEquipment = typeof medicalEquipmentTable.$inferInsert;

// Export all tables for proper query building
export const tables = { 
  users: usersTable,
  medicalEquipment: medicalEquipmentTable
};