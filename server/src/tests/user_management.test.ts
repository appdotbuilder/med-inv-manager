import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput, type UpdateUserInput, type DeleteUserInput } from '../schema';
import { createUser, updateUser, deleteUser, getAllUsers, getUserById } from '../handlers/user_management';
import { eq } from 'drizzle-orm';

// Test data
const testUserInput: CreateUserInput = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  role: 'user'
};

const testAdminInput: CreateUserInput = {
  username: 'adminuser',
  email: 'admin@example.com',
  password: 'adminpass123',
  role: 'admin'
};

describe('User Management Handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  describe('createUser', () => {
    it('should create a user with hashed password', async () => {
      const result = await createUser(testUserInput);

      // Verify basic fields
      expect(result.username).toEqual('testuser');
      expect(result.email).toEqual('test@example.com');
      expect(result.role).toEqual('user');
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
      
      // Verify password is hashed (not the original)
      expect(result.password_hash).not.toEqual('password123');
      expect(result.password_hash.length).toBeGreaterThan(10);
    });

    it('should save user to database', async () => {
      const result = await createUser(testUserInput);

      // Query database directly
      const users = await db.select()
        .from(usersTable)
        .where(eq(usersTable.id, result.id))
        .execute();

      expect(users).toHaveLength(1);
      expect(users[0].username).toEqual('testuser');
      expect(users[0].email).toEqual('test@example.com');
      expect(users[0].role).toEqual('user');
    });

    it('should create admin user', async () => {
      const result = await createUser(testAdminInput);

      expect(result.username).toEqual('adminuser');
      expect(result.role).toEqual('admin');
    });

    it('should throw error for duplicate username', async () => {
      await createUser(testUserInput);
      
      const duplicateUser: CreateUserInput = {
        ...testUserInput,
        email: 'different@example.com'
      };

      await expect(createUser(duplicateUser)).rejects.toThrow();
    });

    it('should throw error for duplicate email', async () => {
      await createUser(testUserInput);
      
      const duplicateUser: CreateUserInput = {
        ...testUserInput,
        username: 'differentuser'
      };

      await expect(createUser(duplicateUser)).rejects.toThrow();
    });
  });

  describe('updateUser', () => {
    it('should update user username', async () => {
      const user = await createUser(testUserInput);
      
      const updateInput: UpdateUserInput = {
        id: user.id,
        username: 'updateduser'
      };

      const result = await updateUser(updateInput);

      expect(result.username).toEqual('updateduser');
      expect(result.email).toEqual(testUserInput.email); // Should remain unchanged
      expect(result.role).toEqual(testUserInput.role); // Should remain unchanged
      expect(result.updated_at.getTime()).toBeGreaterThan(result.created_at.getTime());
    });

    it('should update user email', async () => {
      const user = await createUser(testUserInput);
      
      const updateInput: UpdateUserInput = {
        id: user.id,
        email: 'newemail@example.com'
      };

      const result = await updateUser(updateInput);

      expect(result.email).toEqual('newemail@example.com');
      expect(result.username).toEqual(testUserInput.username); // Should remain unchanged
    });

    it('should update user password', async () => {
      const user = await createUser(testUserInput);
      const originalPasswordHash = user.password_hash;
      
      const updateInput: UpdateUserInput = {
        id: user.id,
        password: 'newpassword456'
      };

      const result = await updateUser(updateInput);

      expect(result.password_hash).not.toEqual(originalPasswordHash);
      expect(result.password_hash).not.toEqual('newpassword456'); // Should be hashed
    });

    it('should update user role', async () => {
      const user = await createUser(testUserInput);
      
      const updateInput: UpdateUserInput = {
        id: user.id,
        role: 'admin'
      };

      const result = await updateUser(updateInput);

      expect(result.role).toEqual('admin');
    });

    it('should update multiple fields at once', async () => {
      const user = await createUser(testUserInput);
      
      const updateInput: UpdateUserInput = {
        id: user.id,
        username: 'newusername',
        email: 'newemail@example.com',
        role: 'admin'
      };

      const result = await updateUser(updateInput);

      expect(result.username).toEqual('newusername');
      expect(result.email).toEqual('newemail@example.com');
      expect(result.role).toEqual('admin');
    });

    it('should throw error for non-existent user', async () => {
      const updateInput: UpdateUserInput = {
        id: 999999, // Non-existent ID
        username: 'newname'
      };

      await expect(updateUser(updateInput)).rejects.toThrow(/not found/i);
    });

    it('should persist changes to database', async () => {
      const user = await createUser(testUserInput);
      
      const updateInput: UpdateUserInput = {
        id: user.id,
        username: 'persistedname'
      };

      await updateUser(updateInput);

      // Verify in database
      const dbUser = await db.select()
        .from(usersTable)
        .where(eq(usersTable.id, user.id))
        .execute();

      expect(dbUser[0].username).toEqual('persistedname');
    });
  });

  describe('deleteUser', () => {
    it('should delete a regular user', async () => {
      const user = await createUser(testUserInput);
      
      const deleteInput: DeleteUserInput = {
        id: user.id
      };

      const result = await deleteUser(deleteInput);

      expect(result.success).toBe(true);

      // Verify user is deleted from database
      const users = await db.select()
        .from(usersTable)
        .where(eq(usersTable.id, user.id))
        .execute();

      expect(users).toHaveLength(0);
    });

    it('should delete an admin when other admins exist', async () => {
      const admin1 = await createUser(testAdminInput);
      const admin2 = await createUser({
        ...testAdminInput,
        username: 'admin2',
        email: 'admin2@example.com'
      });
      
      const deleteInput: DeleteUserInput = {
        id: admin1.id
      };

      const result = await deleteUser(deleteInput);

      expect(result.success).toBe(true);

      // Verify admin1 is deleted but admin2 still exists
      const deletedUser = await db.select()
        .from(usersTable)
        .where(eq(usersTable.id, admin1.id))
        .execute();
      
      const remainingAdmin = await db.select()
        .from(usersTable)
        .where(eq(usersTable.id, admin2.id))
        .execute();

      expect(deletedUser).toHaveLength(0);
      expect(remainingAdmin).toHaveLength(1);
    });

    it('should prevent deletion of last admin user', async () => {
      const admin = await createUser(testAdminInput);
      
      const deleteInput: DeleteUserInput = {
        id: admin.id
      };

      await expect(deleteUser(deleteInput)).rejects.toThrow(/last admin user/i);

      // Verify admin still exists
      const users = await db.select()
        .from(usersTable)
        .where(eq(usersTable.id, admin.id))
        .execute();

      expect(users).toHaveLength(1);
    });

    it('should throw error for non-existent user', async () => {
      const deleteInput: DeleteUserInput = {
        id: 999999 // Non-existent ID
      };

      await expect(deleteUser(deleteInput)).rejects.toThrow(/not found/i);
    });
  });

  describe('getAllUsers', () => {
    it('should return empty array when no users exist', async () => {
      const result = await getAllUsers();
      expect(result).toHaveLength(0);
    });

    it('should return all users', async () => {
      const user1 = await createUser(testUserInput);
      const user2 = await createUser(testAdminInput);

      const result = await getAllUsers();

      expect(result).toHaveLength(2);
      
      // Find users by id to avoid order dependency
      const foundUser1 = result.find(u => u.id === user1.id);
      const foundUser2 = result.find(u => u.id === user2.id);

      expect(foundUser1).toBeDefined();
      expect(foundUser1?.username).toEqual('testuser');
      expect(foundUser1?.role).toEqual('user');

      expect(foundUser2).toBeDefined();
      expect(foundUser2?.username).toEqual('adminuser');
      expect(foundUser2?.role).toEqual('admin');
    });

    it('should include password_hash in results', async () => {
      await createUser(testUserInput);
      
      const result = await getAllUsers();

      expect(result[0].password_hash).toBeDefined();
      expect(typeof result[0].password_hash).toBe('string');
    });
  });

  describe('getUserById', () => {
    it('should return null for non-existent user', async () => {
      const result = await getUserById(999999);
      expect(result).toBeNull();
    });

    it('should return user by id', async () => {
      const user = await createUser(testUserInput);
      
      const result = await getUserById(user.id);

      expect(result).not.toBeNull();
      expect(result?.id).toEqual(user.id);
      expect(result?.username).toEqual('testuser');
      expect(result?.email).toEqual('test@example.com');
      expect(result?.role).toEqual('user');
    });

    it('should return admin user by id', async () => {
      const admin = await createUser(testAdminInput);
      
      const result = await getUserById(admin.id);

      expect(result).not.toBeNull();
      expect(result?.role).toEqual('admin');
      expect(result?.username).toEqual('adminuser');
    });
  });
});