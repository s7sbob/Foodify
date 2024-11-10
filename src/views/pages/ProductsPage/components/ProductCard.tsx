import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface Product {
  name: string;
  price: string;
  image: string;
  description?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <Card
      onClick={() => onAddToCart(product)}
      sx={{
        position: 'relative',
        width: '120px', // Adjusted width for a smaller card
        height: '140px', // Adjusted height for a smaller card
        borderRadius: '10px',
        boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.03)',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      {/* Background Image */}
      <Box
        sx={{
          width: '100%',
          height: '65%', // Adjusted to fit smaller card
          backgroundImage: `url(${product.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />

      {/* Transparent Overlay */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: '35%', // Adjusted overlay to cover text area
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          padding: '4px', // Padding to fit smaller text content
        }}
      >
        {/* Overlay Content */}
        <Typography
          variant="body2"
          component="div"
          sx={{
            fontWeight: 'bold',
            fontSize: '0.8rem',
          }}
        >
          {product.name}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontSize: '0.7rem',
          }}
        >
          {product.price}
        </Typography>
      </Box>
    </Card>
  );
};

export default ProductCard;
