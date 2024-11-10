import React from 'react';
import { Grid, useTheme } from '@mui/material';
import ProductCard from './ProductCard';

interface Product {
  name: string;
  price: string;
  image: string;
  description?: string;
}

// Sample product data with "Crepe Chicken" items
const products: Product[] = [
  { name: 'Crepe Chicken', price: '120 LE', image: '/images/Crepe_Chicken.jpg' },
  { name: 'Crepe Chicken', price: '120 LE', image: '/images/Crepe_Chicken.jpg' },
  { name: 'Crepe Chicken', price: '120 LE', image: '/images/Crepe_Chicken.jpg' },
  { name: 'Crepe Chicken', price: '120 LE', image: '/images/Crepe_Chicken.jpg' },
  { name: 'Crepe Chicken', price: '120 LE', image: '/images/Crepe_Chicken.jpg' },
  { name: 'Crepe Chicken', price: '120 LE', image: '/images/Crepe_Chicken.jpg' },
  { name: 'Crepe Chicken', price: '120 LE', image: '/images/Crepe_Chicken.jpg' },
  { name: 'Crepe Chicken', price: '120 LE', image: '/images/Crepe_Chicken.jpg' },
  { name: 'Crepe Chicken', price: '120 LE', image: '/images/Crepe_Chicken.jpg' },
];

const ProductGrid: React.FC = () => {
  const theme = useTheme();

  const onAddToCart = (product: Product) => {
    console.log('Product added to cart:', product);
  };

  return (
    <Grid
    container
    columnSpacing={-5} // Small positive spacing
    rowSpacing={2}    // Keep vertical spacing as is
    sx={{ padding: theme.spacing(1), flexWrap: 'wrap' }}
  >
    {products.map((product, index) => (
      <Grid
        item
        key={index}
        xs={6}
        sm={4}
        md={3}
        lg={2}
      >
        <ProductCard product={product} onAddToCart={onAddToCart} />
      </Grid>
      ))}
    </Grid>
  );
};

export default ProductGrid;
