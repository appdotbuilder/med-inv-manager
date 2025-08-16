import { type FileUploadInput, type FileUploadResponse } from '../schema';
import { writeFile, unlink, mkdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Define upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

// Ensure uploads directory exists
const ensureUploadDir = async () => {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
};

export async function validateImageFile(file: FileUploadInput): Promise<{ valid: boolean; error?: string }> {
  try {
    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPG and PNG images are allowed.'
      };
    }

    // Decode base64 and check file size
    const buffer = Buffer.from(file.data, 'base64');
    if (buffer.length > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
      };
    }

    // Basic validation of image data (check for valid image headers)
    const isValidImage = validateImageBuffer(buffer, file.mimetype);
    if (!isValidImage) {
      return {
        valid: false,
        error: 'File appears to be corrupted or is not a valid image.'
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('File validation error:', error);
    return {
      valid: false,
      error: 'Failed to validate file.'
    };
  }
}

export async function uploadImage(input: FileUploadInput): Promise<FileUploadResponse> {
  try {
    // Validate the file first
    const validation = await validateImageFile(input);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Ensure upload directory exists
    await ensureUploadDir();

    // Generate unique filename to prevent conflicts
    const fileExtension = getFileExtension(input.mimetype);
    const uniqueId = crypto.randomUUID();
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}_${uniqueId}${fileExtension}`;

    // Decode base64 data and write file
    const buffer = Buffer.from(input.data, 'base64');
    const filePath = path.join(UPLOAD_DIR, uniqueFilename);
    
    await writeFile(filePath, buffer);

    return {
      url: `/uploads/${uniqueFilename}`,
      filename: uniqueFilename
    };
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
}

export async function deleteImage(imageUrl: string): Promise<{ success: boolean }> {
  try {
    // Extract filename from URL (handle both /uploads/filename and just filename)
    const filename = imageUrl.startsWith('/uploads/') 
      ? path.basename(imageUrl)
      : path.basename(imageUrl);
    
    const filePath = path.join(UPLOAD_DIR, filename);

    // Check if file exists before attempting deletion
    try {
      await stat(filePath);
      await unlink(filePath);
      return { success: true };
    } catch (error) {
      // File doesn't exist or already deleted
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return { success: true }; // Consider non-existent file as successfully "deleted"
      }
      throw error;
    }
  } catch (error) {
    console.error('Image deletion failed:', error);
    throw error;
  }
}

// Helper function to get file extension from MIME type
function getFileExtension(mimetype: string): string {
  switch (mimetype.toLowerCase()) {
    case 'image/jpeg':
    case 'image/jpg':
      return '.jpg';
    case 'image/png':
      return '.png';
    default:
      return '.jpg'; // fallback
  }
}

// Helper function to validate image buffer
function validateImageBuffer(buffer: Buffer, mimetype: string): boolean {
  if (buffer.length < 4) return false;

  // Check for common image file signatures
  const signature = buffer.subarray(0, 4);
  
  if (mimetype.toLowerCase().includes('jpeg') || mimetype.toLowerCase().includes('jpg')) {
    // JPEG files start with FF D8 FF
    return signature[0] === 0xFF && signature[1] === 0xD8 && signature[2] === 0xFF;
  }
  
  if (mimetype.toLowerCase().includes('png')) {
    // PNG files start with 89 50 4E 47
    return signature[0] === 0x89 && signature[1] === 0x50 && signature[2] === 0x4E && signature[3] === 0x47;
  }
  
  return false;
}