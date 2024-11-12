// src/components/Product/ImageUploader.tsx

import React from 'react';
import { Button, Typography } from '@mui/material';

interface ImageUploaderProps {
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ imageFile, setImageFile }) => {
  return (
    <>
      <Button variant="contained" component="label">
        رفع صورة
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setImageFile(e.target.files[0]);
            }
          }}
        />
      </Button>
      {imageFile && <Typography variant="body2" sx={{ mt: 1 }}>{imageFile.name}</Typography>}
    </>
  );
};

export default ImageUploader;
