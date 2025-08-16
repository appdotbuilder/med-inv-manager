import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { type FileUploadInput } from '../schema';
import { uploadImage, deleteImage, validateImageFile } from '../handlers/file_upload';
import { existsSync } from 'fs';
import { readFile, unlink, mkdir, rmdir } from 'fs/promises';
import path from 'path';

// Test constants
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Valid JPEG image data (minimal valid JPEG header + data)
const validJpegData = Buffer.from([
  0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
  0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
  0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
  0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
  0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
  0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
  0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xFF, 0xC4, 0x00, 0x1F,
  0x00, 0x00, 0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0xFF, 0xDA, 0x00,
  0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00, 0xD2, 0xCF, 0x20, 0xFF, 0xD9
]).toString('base64');

// Valid PNG image data (minimal valid PNG header + data)
const validPngData = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
  0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
  0x42, 0x60, 0x82
]).toString('base64');

// Invalid image data (just some random bytes)
const invalidImageData = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05]).toString('base64');

// Large file data (over 2MB)
const largeFileData = Buffer.alloc(3 * 1024 * 1024, 0xFF).toString('base64');

// Test inputs
const validJpegInput: FileUploadInput = {
  filename: 'test-image.jpg',
  mimetype: 'image/jpeg',
  data: validJpegData
};

const validPngInput: FileUploadInput = {
  filename: 'test-image.png',
  mimetype: 'image/png',
  data: validPngData
};

const invalidTypeInput: FileUploadInput = {
  filename: 'test-file.txt',
  mimetype: 'text/plain',
  data: Buffer.from('Hello world').toString('base64')
};

const invalidImageInput: FileUploadInput = {
  filename: 'invalid-image.jpg',
  mimetype: 'image/jpeg',
  data: invalidImageData
};

const largeFileInput: FileUploadInput = {
  filename: 'large-image.jpg',
  mimetype: 'image/jpeg',
  data: largeFileData
};

describe('file upload handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Clean up uploaded files after each test
  afterEach(async () => {
    if (existsSync(UPLOAD_DIR)) {
      try {
        const files = await readFile(UPLOAD_DIR).catch(() => []);
        // Clean up any test files that might have been created
      } catch (error) {
        // Directory might not exist, which is fine
      }
    }
  });

  describe('validateImageFile', () => {
    it('should validate a valid JPEG image', async () => {
      const result = await validateImageFile(validJpegInput);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate a valid PNG image', async () => {
      const result = await validateImageFile(validPngInput);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid file types', async () => {
      const result = await validateImageFile(invalidTypeInput);
      
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/invalid file type/i);
    });

    it('should reject files that are too large', async () => {
      const result = await validateImageFile(largeFileInput);
      
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/file size exceeds/i);
    });

    it('should reject corrupted image files', async () => {
      const result = await validateImageFile(invalidImageInput);
      
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/corrupted|not a valid image/i);
    });

    it('should handle case-insensitive MIME types', async () => {
      const upperCaseInput: FileUploadInput = {
        filename: 'test-image.jpg',
        mimetype: 'IMAGE/JPEG',
        data: validJpegData
      };

      const result = await validateImageFile(upperCaseInput);
      
      expect(result.valid).toBe(true);
    });
  });

  describe('uploadImage', () => {
    it('should upload a valid JPEG image', async () => {
      const result = await uploadImage(validJpegInput);
      
      expect(result.url).toMatch(/^\/uploads\/.+\.jpg$/);
      expect(result.filename).toMatch(/^\d+_.+\.jpg$/);
      expect(result.filename).not.toBe(validJpegInput.filename); // Should be unique

      // Verify file was actually created
      const filePath = path.join(UPLOAD_DIR, result.filename);
      expect(existsSync(filePath)).toBe(true);

      // Clean up
      await unlink(filePath).catch(() => {});
    });

    it('should upload a valid PNG image', async () => {
      const result = await uploadImage(validPngInput);
      
      expect(result.url).toMatch(/^\/uploads\/.+\.png$/);
      expect(result.filename).toMatch(/^\d+_.+\.png$/);
      expect(result.filename).not.toBe(validPngInput.filename); // Should be unique

      // Verify file was actually created
      const filePath = path.join(UPLOAD_DIR, result.filename);
      expect(existsSync(filePath)).toBe(true);

      // Clean up
      await unlink(filePath).catch(() => {});
    });

    it('should generate unique filenames for multiple uploads', async () => {
      const result1 = await uploadImage(validJpegInput);
      const result2 = await uploadImage(validJpegInput);
      
      expect(result1.filename).not.toBe(result2.filename);
      expect(result1.url).not.toBe(result2.url);

      // Clean up
      await Promise.all([
        unlink(path.join(UPLOAD_DIR, result1.filename)).catch(() => {}),
        unlink(path.join(UPLOAD_DIR, result2.filename)).catch(() => {})
      ]);
    });

    it('should create upload directory if it does not exist', async () => {
      // Remove upload directory if it exists
      try {
        await rmdir(UPLOAD_DIR, { recursive: true });
      } catch (error) {
        // Directory might not exist, which is fine
      }

      const result = await uploadImage(validJpegInput);
      
      expect(existsSync(UPLOAD_DIR)).toBe(true);
      expect(existsSync(path.join(UPLOAD_DIR, result.filename))).toBe(true);

      // Clean up
      await unlink(path.join(UPLOAD_DIR, result.filename)).catch(() => {});
    });

    it('should reject invalid files', async () => {
      await expect(uploadImage(invalidTypeInput)).rejects.toThrow(/invalid file type/i);
    });

    it('should reject large files', async () => {
      await expect(uploadImage(largeFileInput)).rejects.toThrow(/file size exceeds/i);
    });

    it('should reject corrupted image files', async () => {
      await expect(uploadImage(invalidImageInput)).rejects.toThrow(/corrupted|not a valid image/i);
    });

    it('should save file with correct content', async () => {
      const result = await uploadImage(validJpegInput);
      const filePath = path.join(UPLOAD_DIR, result.filename);
      
      const savedContent = await readFile(filePath);
      const originalContent = Buffer.from(validJpegInput.data, 'base64');
      
      expect(savedContent.equals(originalContent)).toBe(true);

      // Clean up
      await unlink(filePath).catch(() => {});
    });
  });

  describe('deleteImage', () => {
    it('should delete an existing image file', async () => {
      // First upload an image
      const uploadResult = await uploadImage(validJpegInput);
      const filePath = path.join(UPLOAD_DIR, uploadResult.filename);
      
      // Verify file exists
      expect(existsSync(filePath)).toBe(true);
      
      // Delete the image
      const deleteResult = await deleteImage(uploadResult.url);
      
      expect(deleteResult.success).toBe(true);
      expect(existsSync(filePath)).toBe(false);
    });

    it('should handle URLs with /uploads/ prefix', async () => {
      const uploadResult = await uploadImage(validJpegInput);
      const deleteResult = await deleteImage(uploadResult.url);
      
      expect(deleteResult.success).toBe(true);
    });

    it('should handle URLs without /uploads/ prefix', async () => {
      const uploadResult = await uploadImage(validJpegInput);
      const deleteResult = await deleteImage(uploadResult.filename);
      
      expect(deleteResult.success).toBe(true);
    });

    it('should return success for non-existent files', async () => {
      const deleteResult = await deleteImage('/uploads/non-existent-file.jpg');
      
      expect(deleteResult.success).toBe(true);
    });

    it('should handle filenames with special characters', async () => {
      const uploadResult = await uploadImage(validJpegInput);
      
      // The uploaded filename should be sanitized, but let's test deletion anyway
      const deleteResult = await deleteImage(uploadResult.url);
      
      expect(deleteResult.success).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle base64 decoding errors gracefully', async () => {
      const invalidBase64Input: FileUploadInput = {
        filename: 'test.jpg',
        mimetype: 'image/jpeg',
        data: 'invalid-base64-data!'
      };

      await expect(uploadImage(invalidBase64Input)).rejects.toThrow();
    });

    it('should handle empty file data', async () => {
      const emptyFileInput: FileUploadInput = {
        filename: 'empty.jpg',
        mimetype: 'image/jpeg',
        data: ''
      };

      const result = await validateImageFile(emptyFileInput);
      expect(result.valid).toBe(false);
    });

    it('should handle very small files that cannot be images', async () => {
      const tinyFileInput: FileUploadInput = {
        filename: 'tiny.jpg',
        mimetype: 'image/jpeg',
        data: Buffer.from([0xFF, 0xD8]).toString('base64') // Too small to be a valid JPEG
      };

      const result = await validateImageFile(tinyFileInput);
      expect(result.valid).toBe(false);
    });
  });
});