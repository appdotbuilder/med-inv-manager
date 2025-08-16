import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { medicalEquipmentTable } from '../db/schema';
import { getDashboardStats } from '../handlers/dashboard';

// Test equipment data
const testEquipment = [
  {
    name: 'Stethoscope A',
    description: 'High quality stethoscope',
    image_url: null,
    entry_date: new Date('2023-01-01'),
    stock_quantity: 10,
    condition: 'good' as const
  },
  {
    name: 'Wheelchair B',
    description: 'Standard wheelchair',
    image_url: 'http://example.com/wheelchair.jpg',
    entry_date: new Date('2023-02-15'),
    stock_quantity: 5,
    condition: 'light_damage' as const
  },
  {
    name: 'X-Ray Machine',
    description: 'Digital X-ray machine',
    image_url: null,
    entry_date: new Date('2023-03-20'),
    stock_quantity: 2,
    condition: 'heavy_damage' as const
  },
  {
    name: 'Blood Pressure Monitor',
    description: 'Digital BP monitor',
    image_url: 'http://example.com/bp.jpg',
    entry_date: new Date('2023-04-10'),
    stock_quantity: 15,
    condition: 'good' as const
  }
];

describe('getDashboardStats', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return zero stats for empty database', async () => {
    const stats = await getDashboardStats();

    expect(stats.total_equipment).toEqual(0);
    expect(stats.total_stock).toEqual(0);
    expect(stats.condition_summary.good).toEqual(0);
    expect(stats.condition_summary.light_damage).toEqual(0);
    expect(stats.condition_summary.heavy_damage).toEqual(0);
  });

  it('should calculate correct statistics with equipment data', async () => {
    // Insert test equipment
    await db.insert(medicalEquipmentTable)
      .values(testEquipment)
      .execute();

    const stats = await getDashboardStats();

    // Total equipment count (4 items)
    expect(stats.total_equipment).toEqual(4);
    
    // Total stock (10 + 5 + 2 + 15 = 32)
    expect(stats.total_stock).toEqual(32);
    
    // Condition breakdown
    expect(stats.condition_summary.good).toEqual(2); // Stethoscope A + BP Monitor
    expect(stats.condition_summary.light_damage).toEqual(1); // Wheelchair B
    expect(stats.condition_summary.heavy_damage).toEqual(1); // X-Ray Machine
  });

  it('should handle single equipment item correctly', async () => {
    // Insert only one piece of equipment
    await db.insert(medicalEquipmentTable)
      .values([testEquipment[0]]) // Just the stethoscope
      .execute();

    const stats = await getDashboardStats();

    expect(stats.total_equipment).toEqual(1);
    expect(stats.total_stock).toEqual(10);
    expect(stats.condition_summary.good).toEqual(1);
    expect(stats.condition_summary.light_damage).toEqual(0);
    expect(stats.condition_summary.heavy_damage).toEqual(0);
  });

  it('should handle equipment with zero stock quantity', async () => {
    // Add equipment with zero stock
    const zeroStockEquipment = {
      name: 'Out of Stock Item',
      description: 'Currently not in stock',
      image_url: null,
      entry_date: new Date('2023-05-01'),
      stock_quantity: 0,
      condition: 'good' as const
    };

    await db.insert(medicalEquipmentTable)
      .values([zeroStockEquipment, testEquipment[0]])
      .execute();

    const stats = await getDashboardStats();

    expect(stats.total_equipment).toEqual(2);
    expect(stats.total_stock).toEqual(10); // Only from testEquipment[0]
    expect(stats.condition_summary.good).toEqual(2);
  });

  it('should correctly aggregate large stock quantities', async () => {
    // Create equipment with larger stock numbers
    const largeStockEquipment = [
      {
        name: 'Surgical Masks',
        description: 'Disposable surgical masks',
        image_url: null,
        entry_date: new Date('2023-01-01'),
        stock_quantity: 1000,
        condition: 'good' as const
      },
      {
        name: 'Medical Gloves',
        description: 'Latex medical gloves',
        image_url: null,
        entry_date: new Date('2023-02-01'),
        stock_quantity: 2500,
        condition: 'good' as const
      }
    ];

    await db.insert(medicalEquipmentTable)
      .values(largeStockEquipment)
      .execute();

    const stats = await getDashboardStats();

    expect(stats.total_equipment).toEqual(2);
    expect(stats.total_stock).toEqual(3500); // 1000 + 2500
    expect(stats.condition_summary.good).toEqual(2);
  });

  it('should handle mixed conditions correctly', async () => {
    // Create equipment with all different conditions
    const mixedConditionEquipment = [
      { ...testEquipment[0], condition: 'good' as const },
      { ...testEquipment[1], condition: 'good' as const, name: 'Good Item 2' },
      { ...testEquipment[2], condition: 'light_damage' as const, name: 'Light Damage 1' },
      { ...testEquipment[3], condition: 'light_damage' as const, name: 'Light Damage 2' },
      {
        name: 'Heavy Damage 1',
        description: 'Needs major repair',
        image_url: null,
        entry_date: new Date('2023-06-01'),
        stock_quantity: 3,
        condition: 'heavy_damage' as const
      },
      {
        name: 'Heavy Damage 2',
        description: 'Another damaged item',
        image_url: null,
        entry_date: new Date('2023-07-01'),
        stock_quantity: 1,
        condition: 'heavy_damage' as const
      }
    ];

    await db.insert(medicalEquipmentTable)
      .values(mixedConditionEquipment)
      .execute();

    const stats = await getDashboardStats();

    expect(stats.total_equipment).toEqual(6);
    expect(stats.condition_summary.good).toEqual(2);
    expect(stats.condition_summary.light_damage).toEqual(2);
    expect(stats.condition_summary.heavy_damage).toEqual(2);
  });
});