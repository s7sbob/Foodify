// src/views/pages/ProductsPage/components/ProductGrid.tsx

import React from 'react';
import { Grid, useTheme } from '@mui/material';
import ProductCard from './ProductCard';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../store/Store';
import { Product } from '../../../../types/product';

const ProductGrid: React.FC = () => {
  const theme = useTheme();
  const { filteredProducts, loading, error } = useSelector(
    (state: AppState) => state.products
  );

  const onAddToCart = (product: Product) => {
    console.log('Product added to cart:', product);
  };

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ: {error}</div>;

  return (
    <Grid
      container
      columnSpacing={-5}
      rowSpacing={2}
      sx={{ padding: theme.spacing(1), flexWrap: 'wrap' }}
    >
      {filteredProducts.map((product, index) => (
        <Grid item key={index} xs={6} sm={4} md={3} lg={2}>
          <ProductCard product={product} onAddToCart={onAddToCart} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductGrid;
