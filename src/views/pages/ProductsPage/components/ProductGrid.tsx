// src/views/pages/ProductsPage/components/ProductGrid.tsx

import React from 'react';
import { Grid, useTheme, CircularProgress, Typography, Box } from '@mui/material';
import ProductCard from './ProductCard';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../store/Store';
import { Product } from '../../../../types/product';

const ProductGrid: React.FC = () => {
  const theme = useTheme();

  // جلب حالة المنتجات من Redux Store
  const { filteredProducts, loading, error } = useSelector(
    (state: AppState) => state.products
  );

  // عرض حالة التحميل
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  // عرض حالة الخطأ
  if (error) {
    return (
      <Typography color="error">
        خطأ: {error}
      </Typography>
    );
  }

  // عرض رسالة إذا لم تكن هناك منتجات
  if (filteredProducts.length === 0) {
    return (
      <Typography>
        لا توجد منتجات متاحة.
      </Typography>
    );
  }

  return (
    <Grid
      container
      spacing={2}
      sx={{ padding: theme.spacing(1) }}
    >
      {filteredProducts.map((product: Product) => (
        <Grid item key={product.productId} xs={6} sm={4} md={3} lg={2}>
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductGrid;
