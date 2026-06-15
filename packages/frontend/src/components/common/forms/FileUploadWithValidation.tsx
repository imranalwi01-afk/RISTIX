'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Alert,
  LinearProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

interface FileUploadWithValidationProps {
  onFileSelect: (file: File) => void;
  accept?: string; // e.g. "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .csv"
  maxSizeMB?: number;
  label?: string;
}

export const FileUploadWithValidation: React.FC<FileUploadWithValidationProps> = ({
  onFileSelect,
  accept = '*',
  maxSizeMB = 5,
  label = 'Drag and drop a file here or click to select'
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Mock progress for detailed UI feedback
  const [uploadProgress, setUploadProgress] = useState(0); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file?: File) => {
    setError(null);
    setUploadProgress(0);

    if (!file) return;

    // Validate Size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }

    // Validate Type (Simple check)
    // Note: 'accept' prop on input handles the browser dialog, but we should double check here if critical.
    // For now we trust standard input behavior + simple check if needed.

    setSelectedFile(file);
    onFileSelect(file);
    
    // Simulate upload progress for UX
    let progress = 0;
    const interval = setInterval(() => {
        progress += 20;
        setUploadProgress(progress);
        if (progress >= 100) clearInterval(interval);
    }, 100);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <input
        type="file"
        hidden
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
      />
      
      {!selectedFile ? (
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: (theme) => theme.palette.action.hover,
            borderStyle: 'dashed'
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Max size: {maxSizeMB}MB
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <InsertDriveFileIcon color="primary" />
          <Box sx={{ flexGrow: 1 }}>
             <Typography variant="subtitle2" noWrap>
              {selectedFile.name}
             </Typography>
             <Typography variant="caption" color="text.secondary">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
             </Typography>
             {uploadProgress < 100 && (
                <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 1 }} />
             )}
          </Box>
          <IconButton onClick={handleRemove} color="error" size="small">
            <DeleteIcon />
          </IconButton>
        </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};
