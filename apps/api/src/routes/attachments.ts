import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import mime from 'mime-types';
import { PrismaClient } from '@prisma/client';
import {
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
  isFileTypeAllowed,
  getFileType,
  AttachmentUploadResponse,
} from '@support-portal/shared';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Sanitize ticket number to prevent path traversal
    const ticketNumber = (req.body.ticketNumber || 'temp')
      .replace(/[^a-zA-Z0-9-]/g, '')
      .substring(0, 50);
    
    const uploadPath = path.join(__dirname, '../../uploads', String(year), month, ticketNumber);
    
    // Create directory if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true });
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!isFileTypeAllowed(ext)) {
      cb(new Error(`File type ${ext} is not allowed`));
      return;
    }
    cb(null, true);
  },
});

// POST /api/attachments/upload - Upload regular files
router.post('/upload', upload.array('files', 20), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const attachments: AttachmentUploadResponse[] = [];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();
      const fileType = getFileType(ext);
      const mimeType = mime.lookup(file.originalname) || 'application/octet-stream';
      
      // Create relative URL path
      const relativePath = file.path.split('/uploads/')[1];
      const fileUrl = `/uploads/${relativePath}`;

      const attachment = await prisma.attachment.create({
        data: {
          fileName: file.filename,
          originalName: file.originalname,
          filePath: file.path,
          fileUrl,
          fileSize: BigInt(Math.min(file.size, Number.MAX_SAFE_INTEGER)),
          mimeType,
          fileType,
          isInline: false,
          uploadedBy: req.body.userId,
        },
      });

      attachments.push({
        id: attachment.id,
        fileName: attachment.fileName,
        originalName: attachment.originalName,
        fileUrl: attachment.fileUrl,
        fileSize: Number(attachment.fileSize),
        mimeType: attachment.mimeType,
        fileType: attachment.fileType as any,
        isInline: attachment.isInline,
      });
    }

    res.json({ attachments });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

// POST /api/attachments/upload-image - Upload image with thumbnail generation
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const fileType = getFileType(ext);
    
    if (fileType !== 'image') {
      return res.status(400).json({ error: 'File is not an image' });
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return res.status(400).json({ error: 'Image size exceeds maximum allowed size' });
    }

    const mimeType = mime.lookup(file.originalname) || 'image/jpeg';

    // Get image dimensions
    const metadata = await sharp(file.path).metadata();
    const width = metadata.width;
    const height = metadata.height;

    // Generate thumbnail
    const thumbnailPath = file.path.replace(
      path.extname(file.path),
      `_thumb${path.extname(file.path)}`
    );
    
    await sharp(file.path)
      .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
      .toFile(thumbnailPath);

    // Create relative URL paths
    const relativePath = file.path.split('/uploads/')[1];
    const thumbnailRelativePath = thumbnailPath.split('/uploads/')[1];
    const fileUrl = `/uploads/${relativePath}`;
    const thumbnailUrl = `/uploads/${thumbnailRelativePath}`;

    const attachment = await prisma.attachment.create({
      data: {
        fileName: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileUrl,
        thumbnailPath,
        thumbnailUrl,
        fileSize: BigInt(Math.min(file.size, Number.MAX_SAFE_INTEGER)),
        mimeType,
        fileType: 'image',
        width,
        height,
        isInline: req.body.isInline === 'true',
        uploadedBy: req.body.userId,
      },
    });

    const response: AttachmentUploadResponse = {
      id: attachment.id,
      fileName: attachment.fileName,
      originalName: attachment.originalName,
      fileUrl: attachment.fileUrl,
      thumbnailUrl: attachment.thumbnailUrl || undefined,
      fileSize: Number(attachment.fileSize),
      mimeType: attachment.mimeType,
      fileType: 'image',
      width: attachment.width || undefined,
      height: attachment.height || undefined,
      isInline: attachment.isInline,
    };

    res.json(response);
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// GET /api/attachments/:id/download - Download an attachment
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Check if file exists
    if (!fs.existsSync(attachment.filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(attachment.filePath, attachment.originalName);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// GET /api/attachments/:id/thumbnail - Get image thumbnail
router.get('/:id/thumbnail', async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment || !attachment.thumbnailPath) {
      return res.status(404).json({ error: 'Thumbnail not found' });
    }

    if (!fs.existsSync(attachment.thumbnailPath)) {
      return res.status(404).json({ error: 'Thumbnail file not found on server' });
    }

    res.sendFile(attachment.thumbnailPath);
  } catch (error) {
    console.error('Thumbnail error:', error);
    res.status(500).json({ error: 'Failed to retrieve thumbnail' });
  }
});

// DELETE /api/attachments/:id - Delete an attachment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const attachment = await prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    // Delete files from disk asynchronously
    const deletePromises = [];
    
    if (fs.existsSync(attachment.filePath)) {
      deletePromises.push(fs.promises.unlink(attachment.filePath));
    }

    if (attachment.thumbnailPath && fs.existsSync(attachment.thumbnailPath)) {
      deletePromises.push(fs.promises.unlink(attachment.thumbnailPath));
    }

    await Promise.all(deletePromises);

    // Delete from database
    await prisma.attachment.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Attachment deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
});

export default router;
