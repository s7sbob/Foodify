// src/components/ProductForm.tsx

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Grid } from '@mui/material';
import AddProductForm, { AddProductFormRef } from './AddProductForm';
import EditProductForm, { EditProductFormRef } from './EditProductForm';
import { Product, ProductPrice } from '../../../../types/productTypes';
import { useTranslation } from 'react-i18next';

interface ProductFormProps {
  isEditing: boolean;
  productToEdit: Product | null;
  onProductAdded: () => void;
  onProductUpdated: () => void;
  onCancelEdit: () => void;
  productPrices: ProductPrice[];
  setProductPrices: React.Dispatch<React.SetStateAction<ProductPrice[]>>;
  handleAddEntry: (lineType: number) => void;
}

export interface ProductFormRef {
  submitForm: () => void;
  resetForm: () => void;
}

/**
 * ProductForm component manages adding and editing products.
 * It renders AddProductForm or EditProductForm based on the isEditing flag.
 */
const ProductForm = forwardRef<ProductFormRef, ProductFormProps>(
  (
    {
      isEditing,
      productToEdit,
      onProductAdded,
      onProductUpdated,
      onCancelEdit,
      productPrices,
      setProductPrices,
      handleAddEntry,
    },
    ref
  ) => {
    const { t } = useTranslation();

    const addProductFormRef = useRef<AddProductFormRef>(null);
    const editProductFormRef = useRef<EditProductFormRef>(null);

    // Function to handle form submission
    const handleSubmit = () => {
      if (isEditing) {
        editProductFormRef.current?.submitForm();
      } else {
        addProductFormRef.current?.submitForm();
      }
    };

    // Function to handle form reset
    const handleReset = () => {
      if (isEditing) {
        editProductFormRef.current?.resetForm();
      } else {
        addProductFormRef.current?.resetForm();
      }
      onCancelEdit();
    };

    // Expose methods to parent component via ref
    useImperativeHandle(ref, () => ({
      submitForm: handleSubmit,
      resetForm: handleReset,
    }));

    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {isEditing && productToEdit ? (
            <EditProductForm
              productData={productToEdit}
              onProductUpdated={onProductUpdated}
              onCancel={onCancelEdit}
              ref={editProductFormRef}
              productPrices={productPrices}
              setProductPrices={setProductPrices}
              handleAddEntry={handleAddEntry}
            />
          ) : (
            <AddProductForm
              onProductAdded={onProductAdded}
              ref={addProductFormRef}
              productPrices={productPrices}
              setProductPrices={setProductPrices}
              handleAddEntry={handleAddEntry}
            />
          )}
        </Grid>
      </Grid>
    );
  }
);

export default ProductForm;
