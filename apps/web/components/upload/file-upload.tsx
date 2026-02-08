'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { AttachmentUploadResponse, MAX_FILE_SIZE, isFileTypeAllowed } from '@support-portal/shared';

interface FileUploadProps {
  onUpload?: (files: AttachmentUploadResponse[]) => void;
  maxFiles?: number;
  apiEndpoint?: string;
}

export default function FileUpload({
  onUpload,
  maxFiles = 20,
  apiEndpoint = 'http://localhost:3001/api/attachments/upload',
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadedFiles, setUploadedFiles] = useState<AttachmentUploadResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      acceptedFiles.forEach((file) => {
        formData.append('files', file);
      });

      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        const newFiles = data.attachments as AttachmentUploadResponse[];

        setUploadedFiles((prev) => [...prev, ...newFiles]);
        onUpload?.(newFiles);
      } catch (error) {
        console.error('Upload error:', error);
        setError('Failed to upload files. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [apiEndpoint, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize: MAX_FILE_SIZE,
    validator: (file) => {
      const ext = file.name.split('.').pop() || '';
      if (!isFileTypeAllowed(`.${ext}`)) {
        return {
          code: 'file-invalid-type',
          message: `File type .${ext} is not allowed`,
        };
      }
      return null;
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${apiEndpoint.replace('/upload', '')}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete file. Please try again.');
    }
  };

  const handleDownload = (file: AttachmentUploadResponse) => {
    window.open(`${apiEndpoint.replace('/upload', '')}/${file.id}/download`, '_blank');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (Math.round((bytes / Math.pow(k, i)) * 100) / 100) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string): string => {
    switch (fileType) {
      case 'image':
        return '🖼️';
      case 'document':
        return '📄';
      case 'archive':
        return '📦';
      case 'code':
        return '💻';
      default:
        return '📎';
    }
  };

  return (
    <div className="file-upload">
      <div
        {...getRootProps()}
        className={`file-upload-zone ${isDragActive ? 'drag-active' : ''}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop files here...</p>
        ) : (
          <div>
            <p>📎 Drag & drop files here, or click to select</p>
            <p style={{ fontSize: '12px', color: '#718096', marginTop: '8px' }}>
              Max file size: 25MB | Max files: {maxFiles}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div style={{
          margin: '16px 0',
          padding: '12px',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          color: '#c33',
        }}>
          {error}
        </div>
      )}

      {uploading && (
        <div style={{ margin: '16px 0' }}>
          <p>Uploading...</p>
          <div className="upload-progress">
            <div className="upload-progress-bar" style={{ width: '50%' }} />
          </div>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <h4>Uploaded Files ({uploadedFiles.length})</h4>
          {uploadedFiles.map((file) => (
            <div key={file.id} className="file-preview-card">
              {file.fileType === 'image' && file.thumbnailUrl ? (
                <img src={file.thumbnailUrl} alt={file.originalName} />
              ) : (
                <div className="file-icon">{getFileIcon(file.fileType)}</div>
              )}
              <div className="file-info">
                <div className="file-name">{file.originalName}</div>
                <div className="file-meta">
                  {formatFileSize(file.fileSize)} • {file.mimeType}
                </div>
              </div>
              <div className="file-actions">
                <button onClick={() => handleDownload(file)}>Download</button>
                <button onClick={() => handleDelete(file.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
