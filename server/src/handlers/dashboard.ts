import { db } from '../db';
import { medicalEquipmentTable } from '../db/schema';
import { count, sum, eq } from 'drizzle-orm';
import { type DashboardStats } from '../schema';

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get total equipment count and total stock in one query
    const totalStats = await db.select({
      total_equipment: count(),
      total_stock: sum(medicalEquipmentTable.stock_quantity)
    })
    .from(medicalEquipmentTable)
    .execute();

    // Get condition summary - count by each condition
    const conditionStats = await Promise.all([
      db.select({ count: count() })
        .from(medicalEquipmentTable)
        .where(eq(medicalEquipmentTable.condition, 'good'))
        .execute(),
      db.select({ count: count() })
        .from(medicalEquipmentTable)
        .where(eq(medicalEquipmentTable.condition, 'light_damage'))
        .execute(),
      db.select({ count: count() })
        .from(medicalEquipmentTable)
        .where(eq(medicalEquipmentTable.condition, 'heavy_damage'))
        .execute()
    ]);

    const totalEquipment = totalStats[0]?.total_equipment || 0;
    const totalStock = parseInt(totalStats[0]?.total_stock || '0');

    return {
      total_equipment: totalEquipment,
      total_stock: totalStock,
      condition_summary: {
        good: conditionStats[0][0]?.count || 0,
        light_damage: conditionStats[1][0]?.count || 0,
        heavy_damage: conditionStats[2][0]?.count || 0
      }
    };
  } catch (error) {
    console.error('Dashboard stats calculation failed:', error);
    throw error;
  }
}