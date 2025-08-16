import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput, type UpdateUserInput, type DeleteUserInput, type User } from '../schema';
import { eq, ne, count } from 'drizzle-orm';

// Simple password hashing utility (in production, use bcrypt or similar)
const hashPassword = async (password: string): Promise<string> => {
  // Using Bun's built-in crypto for password hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt'); // In production, use proper salt
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export async function createUser(input: CreateUserInput): Promise<User> {
  try {
    // Hash the password before storing
    const password_hash = await hashPassword(input.password);

    // Insert user record
    const result = await db.insert(usersTable)
      .values({
        username: input.username,
        email: input.email,
        password_hash,
        role: input.role
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('User creation failed:', error);
    throw error;
  }
}

export async function updateUser(input: UpdateUserInput): Promise<User> {
  try {
    // Build update values object
    const updateValues: Partial<typeof usersTable.$inferInsert> = {};
    
    if (input.username !== undefined) {
      updateValues.username = input.username;
    }
    if (input.email !== undefined) {
      updateValues.email = input.email;
    }
    if (input.password !== undefined) {
      updateValues.password_hash = await hashPassword(input.password);
    }
    if (input.role !== undefined) {
      updateValues.role = input.role;
    }
    
    // Always update the updated_at timestamp
    updateValues.updated_at = new Date();

    // Update user record
    const result = await db.update(usersTable)
      .set(updateValues)
      .where(eq(usersTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`User with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('User update failed:', error);
    throw error;
  }
}

export async function deleteUser(input: DeleteUserInput): Promise<{ success: boolean }> {
  try {
    // Check if this is the last admin user
    const adminCount = await db.select({ count: count() })
      .from(usersTable)
      .where(eq(usersTable.role, 'admin'))
      .execute();

    if (adminCount[0].count <= 1) {
      // Check if the user being deleted is an admin
      const userToDelete = await db.select()
        .from(usersTable)
        .where(eq(usersTable.id, input.id))
        .execute();

      if (userToDelete.length > 0 && userToDelete[0].role === 'admin') {
        throw new Error('Cannot delete the last admin user');
      }
    }

    // Delete the user
    const result = await db.delete(usersTable)
      .where(eq(usersTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`User with id ${input.id} not found`);
    }

    return { success: true };
  } catch (error) {
    console.error('User deletion failed:', error);
    throw error;
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const users = await db.select()
      .from(usersTable)
      .execute();

    return users;
  } catch (error) {
    console.error('Failed to fetch all users:', error);
    throw error;
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .execute();

    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error('Failed to fetch user by id:', error);
    throw error;
  }
}