// src/components/Product/EditProductForm.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
} from '@mui/material';
import { Product, ProductPrice } from '../../../types/productTypes';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { AppState } from '../../../store/Store';
import { useNotification } from '../../../context/NotificationContext';
import ProductPricesForm from './ProductPricesForm';

interface EditProductFormProps {
  open: boolean;
  handleClose: () => void;
  productData: Product;
  onProductUpdated: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({
  open,
  handleClose,
  productData,
  onProductUpdated,
}) => {
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState<Product>(productData);
  const [loading, setLoading] = useState<boolean>(false);

  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token = useSelector((state: AppState) => state.auth.token);

  useEffect(() => {
    setFormData(productData);
  }, [productData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePricesChange = (prices: ProductPrice[]) => {
    setFormData((prev) => ({
      ...prev,
      productPrices: prices,
    }));
  };

  const handleSubmit = async () => {
    // التحقق من البيانات
    if (!formData.productName || !formData.productGroupId || !formData.productPrices) {
      showNotification('Please fill in all required fields.', 'warning', 'Incomplete Data');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${baseurl}/Product/UpdateProduct`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      showNotification('Product updated successfully!', 'success', 'Success');
      onProductUpdated();
      handleClose();
    } catch (err) {
      console.error('Error updating product:', err);
      showNotification('Failed to update product.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Product</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {/* اسم المنتج */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Product Name"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          {/* اسم المنتج 2 */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Product Name 2"
              name="productName2"
              value={formData.productName2}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          {/* مجموعة المنتج */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Product Group ID"
              name="productGroupId"
              value={formData.productGroupId}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          {/* الخصم */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Discount"
              name="discount"
              type="number"
              value={formData.discount}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          {/* ضريبة القيمة المضافة */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="VAT"
              name="vat"
              type="number"
              value={formData.vat}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          {/* أسعار المنتج */}
          <Grid item xs={12}>
            <ProductPricesForm
              productPrices={formData.productPrices || []}
              setProductPrices={handlePricesChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProductForm;
