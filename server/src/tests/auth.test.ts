import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type LoginInput } from '../schema';
import { login, logout, validateToken, createPasswordHash } from '../handlers/auth';
import { eq } from 'drizzle-orm';

describe('auth handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Test data
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'testpassword123',
    role: 'user' as const
  };

  const adminUser = {
    username: 'admin',
    email: 'admin@example.com',
    password: 'adminpassword123',
    role: 'admin' as const
  };

  const createTestUser = async (userData: { username: string; email: string; password: string; role: 'user' | 'admin' }) => {
    const passwordHash = await createPasswordHash(userData.password);
    
    const result = await db.insert(usersTable)
      .values({
        username: userData.username,
        email: userData.email,
        password_hash: passwordHash,
        role: userData.role
      })
      .returning()
      .execute();

    return result[0];
  };

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      // Create test user
      await createTestUser(testUser);

      const loginInput: LoginInput = {
        username: testUser.username,
        password: testUser.password
      };

      const result = await login(loginInput);

      // Verify response structure
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
      expect(result.token.length).toBeGreaterThan(0);

      // Verify user data
      expect(result.user.username).toEqual(testUser.username);
      expect(result.user.email).toEqual(testUser.email);
      expect(result.user.role).toEqual(testUser.role);
      expect(result.user.id).toBeDefined();
      expect(typeof result.user.id).toBe('number');
    });

    it('should successfully login admin user', async () => {
      // Create admin user
      await createTestUser(adminUser);

      const loginInput: LoginInput = {
        username: adminUser.username,
        password: adminUser.password
      };

      const result = await login(loginInput);

      expect(result.user.role).toEqual('admin');
      expect(result.user.username).toEqual(adminUser.username);
      expect(result.token).toBeDefined();
    });

    it('should fail with invalid username', async () => {
      // Create test user
      await createTestUser(testUser);

      const loginInput: LoginInput = {
        username: 'nonexistent',
        password: testUser.password
      };

      await expect(login(loginInput)).rejects.toThrow(/invalid username or password/i);
    });

    it('should fail with invalid password', async () => {
      // Create test user
      await createTestUser(testUser);

      const loginInput: LoginInput = {
        username: testUser.username,
        password: 'wrongpassword'
      };

      await expect(login(loginInput)).rejects.toThrow(/invalid username or password/i);
    });

    it('should fail with empty credentials', async () => {
      const loginInput: LoginInput = {
        username: '',
        password: ''
      };

      await expect(login(loginInput)).rejects.toThrow();
    });

    it('should not expose password hash in response', async () => {
      await createTestUser(testUser);

      const loginInput: LoginInput = {
        username: testUser.username,
        password: testUser.password
      };

      const result = await login(loginInput);

      // Verify password hash is not included
      expect((result.user as any).password_hash).toBeUndefined();
      expect((result.user as any).password).toBeUndefined();
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      const result = await logout();
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('validateToken', () => {
    it('should validate valid token', async () => {
      // Create user and login to get token
      await createTestUser(testUser);
      
      const loginInput: LoginInput = {
        username: testUser.username,
        password: testUser.password
      };

      const loginResult = await login(loginInput);
      const token = loginResult.token;

      // Validate the token
      const validationResult = await validateToken(token);

      expect(validationResult.valid).toBe(true);
      expect(validationResult.user).toBeDefined();
      expect(validationResult.user.id).toBeDefined();
      expect(validationResult.user.username).toEqual(testUser.username);
      expect(validationResult.user.email).toEqual(testUser.email);
      expect(validationResult.user.role).toEqual(testUser.role);
      
      // Verify password hash is not included
      expect((validationResult.user as any).password_hash).toBeUndefined();
    });

    it('should reject invalid token', async () => {
      const invalidToken = 'invalid.jwt.token';
      
      const result = await validateToken(invalidToken);
      
      expect(result.valid).toBe(false);
      expect(result.user).toBeUndefined();
    });

    it('should reject malformed token', async () => {
      const malformedToken = 'not-a-jwt-token';
      
      const result = await validateToken(malformedToken);
      
      expect(result.valid).toBe(false);
      expect(result.user).toBeUndefined();
    });

    it('should reject empty token', async () => {
      const result = await validateToken('');
      
      expect(result.valid).toBe(false);
      expect(result.user).toBeUndefined();
    });

    it('should reject token for deleted user', async () => {
      // Create user and get token
      const user = await createTestUser(testUser);
      
      const loginInput: LoginInput = {
        username: testUser.username,
        password: testUser.password
      };

      const loginResult = await login(loginInput);
      const token = loginResult.token;

      // Delete the user
      await db.delete(usersTable)
        .where(eq(usersTable.id, user.id))
        .execute();

      // Token should now be invalid
      const validationResult = await validateToken(token);
      
      expect(validationResult.valid).toBe(false);
      expect(validationResult.user).toBeUndefined();
    });
  });

  describe('password hashing', () => {
    it('should create consistent password hashes', async () => {
      const password = 'testpassword123';
      
      const hash1 = await createPasswordHash(password);
      const hash2 = await createPasswordHash(password);
      
      expect(hash1).toEqual(hash2);
      expect(hash1.length).toBeGreaterThan(0);
      expect(typeof hash1).toBe('string');
    });

    it('should create different hashes for different passwords', async () => {
      const password1 = 'password123';
      const password2 = 'differentpassword';
      
      const hash1 = await createPasswordHash(password1);
      const hash2 = await createPasswordHash(password2);
      
      expect(hash1).not.toEqual(hash2);
    });

    it('should verify correct password with stored hash', async () => {
      // Create user with known password
      const user = await createTestUser(testUser);
      
      // Verify we can login with the correct password
      const loginInput: LoginInput = {
        username: testUser.username,
        password: testUser.password
      };

      const result = await login(loginInput);
      expect(result.user.username).toEqual(testUser.username);
    });
  });

  describe('integration tests', () => {
    it('should complete full authentication flow', async () => {
      // 1. Create user
      await createTestUser(testUser);

      // 2. Login
      const loginInput: LoginInput = {
        username: testUser.username,
        password: testUser.password
      };

      const loginResult = await login(loginInput);
      expect(loginResult.token).toBeDefined();
      expect(loginResult.user.username).toEqual(testUser.username);

      // 3. Validate token
      const validationResult = await validateToken(loginResult.token);
      expect(validationResult.valid).toBe(true);
      expect(validationResult.user.username).toEqual(testUser.username);

      // 4. Logout
      const logoutResult = await logout();
      expect(logoutResult.success).toBe(true);
    });

    it('should handle multiple users with different roles', async () => {
      // Create both user and admin
      await createTestUser(testUser);
      await createTestUser(adminUser);

      // Login as regular user
      const userLogin = await login({
        username: testUser.username,
        password: testUser.password
      });

      // Login as admin
      const adminLogin = await login({
        username: adminUser.username,
        password: adminUser.password
      });

      // Validate both tokens
      const userValidation = await validateToken(userLogin.token);
      const adminValidation = await validateToken(adminLogin.token);

      expect(userValidation.valid).toBe(true);
      expect(userValidation.user.role).toEqual('user');

      expect(adminValidation.valid).toBe(true);
      expect(adminValidation.user.role).toEqual('admin');

      // Verify tokens are different
      expect(userLogin.token).not.toEqual(adminLogin.token);
    });
  });
});