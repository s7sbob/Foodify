// src/components/Product/ActionButtons.tsx


import React from 'react';
import {
  Grid,
  Button,
} from '@mui/material';



interface ActionButtonsProps {
  handleAddPrice: () => void;
  handleGlobalAddComment: () => void;
  handleGlobalAddGroupProduct: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  handleAddPrice,
  handleGlobalAddComment,
  handleGlobalAddGroupProduct,
}) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleAddPrice}
          fullWidth
        >
          إضافة سعر
        </Button>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleGlobalAddComment}
          fullWidth
        >
          إضافة تعليقات
        </Button>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Button
          variant="outlined"
          color="success"
          onClick={handleGlobalAddGroupProduct}
          fullWidth
        >
          إضافة منتجات المجموعة
        </Button>
      </Grid>
    </Grid>
  );
};

export default ActionButtons;
