import { db } from '../db';
import { medicalEquipmentTable } from '../db/schema';
import { type CreateEquipmentInput, type UpdateEquipmentInput, type DeleteEquipmentInput, type MedicalEquipment } from '../schema';
import { eq } from 'drizzle-orm';

export async function createEquipment(input: CreateEquipmentInput): Promise<MedicalEquipment> {
  try {
    const result = await db.insert(medicalEquipmentTable)
      .values({
        name: input.name,
        description: input.description,
        image_url: input.image_url,
        entry_date: input.entry_date,
        stock_quantity: input.stock_quantity,
        condition: input.condition
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Equipment creation failed:', error);
    throw error;
  }
}

export async function updateEquipment(input: UpdateEquipmentInput): Promise<MedicalEquipment> {
  try {
    // First check if equipment exists
    const existing = await db.select()
      .from(medicalEquipmentTable)
      .where(eq(medicalEquipmentTable.id, input.id))
      .execute();

    if (existing.length === 0) {
      throw new Error(`Equipment with id ${input.id} not found`);
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.image_url !== undefined) updateData.image_url = input.image_url;
    if (input.entry_date !== undefined) updateData.entry_date = input.entry_date;
    if (input.stock_quantity !== undefined) updateData.stock_quantity = input.stock_quantity;
    if (input.condition !== undefined) updateData.condition = input.condition;

    const result = await db.update(medicalEquipmentTable)
      .set(updateData)
      .where(eq(medicalEquipmentTable.id, input.id))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Equipment update failed:', error);
    throw error;
  }
}

export async function deleteEquipment(input: DeleteEquipmentInput): Promise<{ success: boolean }> {
  try {
    // First check if equipment exists
    const existing = await db.select()
      .from(medicalEquipmentTable)
      .where(eq(medicalEquipmentTable.id, input.id))
      .execute();

    if (existing.length === 0) {
      throw new Error(`Equipment with id ${input.id} not found`);
    }

    await db.delete(medicalEquipmentTable)
      .where(eq(medicalEquipmentTable.id, input.id))
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Equipment deletion failed:', error);
    throw error;
  }
}

export async function getAllEquipment(): Promise<MedicalEquipment[]> {
  try {
    const results = await db.select()
      .from(medicalEquipmentTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch all equipment:', error);
    throw error;
  }
}

export async function getEquipmentById(id: number): Promise<MedicalEquipment | null> {
  try {
    const results = await db.select()
      .from(medicalEquipmentTable)
      .where(eq(medicalEquipmentTable.id, id))
      .execute();

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Failed to fetch equipment by id:', error);
    throw error;
  }
}