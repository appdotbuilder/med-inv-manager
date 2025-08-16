import { db } from '../db';
import { usersTable } from '../db/schema';
import { type LoginInput, type LoginResponse } from '../schema';
import { eq } from 'drizzle-orm';

// JWT secret - in production this should come from environment variables
const JWT_SECRET = process.env['JWT_SECRET'] || 'your-secret-key';

// Simple JWT implementation without external dependencies
const base64UrlEncode = (str: string): string => {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

const base64UrlDecode = (str: string): string => {
  // Add padding if necessary
  str += '='.repeat((4 - str.length % 4) % 4);
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
};

const createJWT = async (payload: any): Promise<string> => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    ...payload,
    iat: now,
    exp: now + (24 * 60 * 60) // 24 hours
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(jwtPayload));
  
  const message = `${encodedHeader}.${encodedPayload}`;
  
  // Create HMAC signature
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  const encodedSignature = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${message}.${encodedSignature}`;
};

const verifyJWT = async (token: string): Promise<any> => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const message = `${encodedHeader}.${encodedPayload}`;
  
  // Verify signature
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  
  const signature = new Uint8Array(
    atob(encodedSignature.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - encodedSignature.length % 4) % 4))
      .split('')
      .map(c => c.charCodeAt(0))
  );
  
  const isValid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(message));
  if (!isValid) {
    throw new Error('Invalid signature');
  }
  
  // Decode payload
  const payload = JSON.parse(base64UrlDecode(encodedPayload));
  
  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error('Token expired');
  }
  
  return payload;
};

// Password hashing utilities
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const hashedInput = await hashPassword(password);
  return hashedInput === hash;
};

export async function login(input: LoginInput): Promise<LoginResponse> {
  try {
    // Find user by username
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.username, input.username))
      .execute();

    if (users.length === 0) {
      throw new Error('Invalid username or password');
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await verifyPassword(input.password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid username or password');
    }

    // Generate JWT token
    const token = await createJWT({ 
      id: user.id, 
      username: user.username, 
      role: user.role 
    });

    // Return user info and token (excluding password hash)
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    };
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export async function logout(): Promise<{ success: boolean }> {
  // In a stateless JWT implementation, logout is handled client-side
  // by removing the token. In production, you might want to maintain
  // a blacklist of revoked tokens or use shorter-lived tokens with refresh tokens
  return { success: true };
}

export async function validateToken(token: string): Promise<{ valid: boolean; user?: any }> {
  try {
    // Verify and decode the JWT token
    const decoded = await verifyJWT(token);
    
    // Optional: Check if user still exists in database
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, decoded.id))
      .execute();

    if (users.length === 0) {
      return { valid: false };
    }

    const user = users[0];
    
    return {
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Token validation failed:', error);
    return { valid: false };
  }
}

// Helper function for creating password hash (useful for seeding test data)
export const createPasswordHash = hashPassword;