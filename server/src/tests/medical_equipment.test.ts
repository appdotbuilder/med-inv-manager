import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { medicalEquipmentTable } from '../db/schema';
import { type CreateEquipmentInput, type UpdateEquipmentInput, type DeleteEquipmentInput } from '../schema';
import { 
  createEquipment, 
  updateEquipment, 
  deleteEquipment, 
  getAllEquipment, 
  getEquipmentById 
} from '../handlers/medical_equipment';
import { eq } from 'drizzle-orm';

// Test input data
const testEquipmentInput: CreateEquipmentInput = {
  name: 'Test MRI Machine',
  description: 'High-resolution MRI machine for testing',
  image_url: 'https://example.com/mri-image.jpg',
  entry_date: new Date('2024-01-15'),
  stock_quantity: 2,
  condition: 'good'
};

const testEquipmentInput2: CreateEquipmentInput = {
  name: 'Test X-Ray Machine',
  description: 'Digital X-ray machine for testing',
  image_url: null,
  entry_date: new Date('2024-01-20'),
  stock_quantity: 1,
  condition: 'light_damage'
};

describe('createEquipment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create equipment with all fields', async () => {
    const result = await createEquipment(testEquipmentInput);

    expect(result.name).toEqual('Test MRI Machine');
    expect(result.description).toEqual('High-resolution MRI machine for testing');
    expect(result.image_url).toEqual('https://example.com/mri-image.jpg');
    expect(result.entry_date).toEqual(new Date('2024-01-15'));
    expect(result.stock_quantity).toEqual(2);
    expect(result.condition).toEqual('good');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create equipment with null image_url', async () => {
    const result = await createEquipment(testEquipmentInput2);

    expect(result.name).toEqual('Test X-Ray Machine');
    expect(result.image_url).toBeNull();
    expect(result.condition).toEqual('light_damage');
  });

  it('should save equipment to database', async () => {
    const result = await createEquipment(testEquipmentInput);

    const equipments = await db.select()
      .from(medicalEquipmentTable)
      .where(eq(medicalEquipmentTable.id, result.id))
      .execute();

    expect(equipments).toHaveLength(1);
    expect(equipments[0].name).toEqual('Test MRI Machine');
    expect(equipments[0].stock_quantity).toEqual(2);
    expect(equipments[0].condition).toEqual('good');
    expect(equipments[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle different equipment conditions', async () => {
    const heavyDamageInput: CreateEquipmentInput = {
      ...testEquipmentInput,
      name: 'Damaged Equipment',
      condition: 'heavy_damage'
    };

    const result = await createEquipment(heavyDamageInput);
    expect(result.condition).toEqual('heavy_damage');
  });
});

describe('updateEquipment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update equipment with all fields', async () => {
    // Create equipment first
    const created = await createEquipment(testEquipmentInput);

    const updateInput: UpdateEquipmentInput = {
      id: created.id,
      name: 'Updated MRI Machine',
      description: 'Updated high-resolution MRI machine',
      image_url: 'https://example.com/updated-mri.jpg',
      entry_date: new Date('2024-02-01'),
      stock_quantity: 3,
      condition: 'light_damage'
    };

    const result = await updateEquipment(updateInput);

    expect(result.id).toEqual(created.id);
    expect(result.name).toEqual('Updated MRI Machine');
    expect(result.description).toEqual('Updated high-resolution MRI machine');
    expect(result.image_url).toEqual('https://example.com/updated-mri.jpg');
    expect(result.entry_date).toEqual(new Date('2024-02-01'));
    expect(result.stock_quantity).toEqual(3);
    expect(result.condition).toEqual('light_damage');
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update only specified fields', async () => {
    // Create equipment first
    const created = await createEquipment(testEquipmentInput);

    const updateInput: UpdateEquipmentInput = {
      id: created.id,
      name: 'Partially Updated MRI',
      stock_quantity: 5
    };

    const result = await updateEquipment(updateInput);

    expect(result.name).toEqual('Partially Updated MRI');
    expect(result.stock_quantity).toEqual(5);
    // Other fields should remain unchanged
    expect(result.description).toEqual(testEquipmentInput.description);
    expect(result.condition).toEqual(testEquipmentInput.condition);
    expect(result.image_url).toEqual(testEquipmentInput.image_url);
  });

  it('should update image_url to null', async () => {
    // Create equipment with image
    const created = await createEquipment(testEquipmentInput);

    const updateInput: UpdateEquipmentInput = {
      id: created.id,
      image_url: null
    };

    const result = await updateEquipment(updateInput);
    expect(result.image_url).toBeNull();
  });

  it('should persist updates to database', async () => {
    // Create equipment first
    const created = await createEquipment(testEquipmentInput);

    const updateInput: UpdateEquipmentInput = {
      id: created.id,
      name: 'Database Updated Equipment',
      stock_quantity: 10
    };

    await updateEquipment(updateInput);

    const equipments = await db.select()
      .from(medicalEquipmentTable)
      .where(eq(medicalEquipmentTable.id, created.id))
      .execute();

    expect(equipments).toHaveLength(1);
    expect(equipments[0].name).toEqual('Database Updated Equipment');
    expect(equipments[0].stock_quantity).toEqual(10);
  });

  it('should throw error for non-existent equipment', async () => {
    const updateInput: UpdateEquipmentInput = {
      id: 99999,
      name: 'Non-existent Equipment'
    };

    expect(updateEquipment(updateInput)).rejects.toThrow(/not found/i);
  });
});

describe('deleteEquipment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete existing equipment', async () => {
    // Create equipment first
    const created = await createEquipment(testEquipmentInput);

    const deleteInput: DeleteEquipmentInput = {
      id: created.id
    };

    const result = await deleteEquipment(deleteInput);
    expect(result.success).toBe(true);

    // Verify deletion from database
    const equipments = await db.select()
      .from(medicalEquipmentTable)
      .where(eq(medicalEquipmentTable.id, created.id))
      .execute();

    expect(equipments).toHaveLength(0);
  });

  it('should throw error for non-existent equipment', async () => {
    const deleteInput: DeleteEquipmentInput = {
      id: 99999
    };

    expect(deleteEquipment(deleteInput)).rejects.toThrow(/not found/i);
  });
});

describe('getAllEquipment', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no equipment exists', async () => {
    const result = await getAllEquipment();
    expect(result).toEqual([]);
  });

  it('should return all equipment records', async () => {
    // Create multiple equipment records
    const equipment1 = await createEquipment(testEquipmentInput);
    const equipment2 = await createEquipment(testEquipmentInput2);

    const result = await getAllEquipment();

    expect(result).toHaveLength(2);
    
    // Check that both equipment are included
    const ids = result.map(eq => eq.id);
    expect(ids).toContain(equipment1.id);
    expect(ids).toContain(equipment2.id);

    // Verify fields
    const mriEquipment = result.find(eq => eq.name === 'Test MRI Machine');
    expect(mriEquipment).toBeDefined();
    expect(mriEquipment!.condition).toEqual('good');
    expect(mriEquipment!.stock_quantity).toEqual(2);

    const xrayEquipment = result.find(eq => eq.name === 'Test X-Ray Machine');
    expect(xrayEquipment).toBeDefined();
    expect(xrayEquipment!.condition).toEqual('light_damage');
    expect(xrayEquipment!.image_url).toBeNull();
  });
});

describe('getEquipmentById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return equipment by valid id', async () => {
    // Create equipment first
    const created = await createEquipment(testEquipmentInput);

    const result = await getEquipmentById(created.id);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(created.id);
    expect(result!.name).toEqual('Test MRI Machine');
    expect(result!.description).toEqual('High-resolution MRI machine for testing');
    expect(result!.stock_quantity).toEqual(2);
    expect(result!.condition).toEqual('good');
    expect(result!.image_url).toEqual('https://example.com/mri-image.jpg');
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent id', async () => {
    const result = await getEquipmentById(99999);
    expect(result).toBeNull();
  });

  it('should return correct equipment when multiple exist', async () => {
    // Create multiple equipment records
    const equipment1 = await createEquipment(testEquipmentInput);
    const equipment2 = await createEquipment(testEquipmentInput2);

    // Get specific equipment by id
    const result = await getEquipmentById(equipment2.id);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(equipment2.id);
    expect(result!.name).toEqual('Test X-Ray Machine');
    expect(result!.condition).toEqual('light_damage');
    expect(result!.image_url).toBeNull();
  });
});