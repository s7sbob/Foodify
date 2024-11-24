// src/views/pages/ProductsPage/components/ProductCard.tsx

import React from 'react';
import { Card, Typography, Box } from '@mui/material';
import { Product } from '../../../../types/product';
import { getImageUrl } from '../../../../utils/getImageUrl';

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
        width: '120px',
        height: '140px',
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
      {/* صورة الخلفية */}
      <Box
        sx={{
          width: '100%',
          height: '65%',
          backgroundImage: `url(${getImageUrl(product.productImage)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
      {/* تراكب شفاف */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: '35%',
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          padding: '4px',
        }}
      >
        {/* محتوى التراكب */}
        <Typography
          variant="body2"
          component="div"
          sx={{
            fontWeight: 'bold',
            fontSize: '0.8rem',
          }}
        >
          {product.productName}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontSize: '0.7rem',
          }}
        >
          {product.productPrices[0]?.price
            ? `${product.productPrices[0].price} LE`
            : ''}
        </Typography>
      </Box>
    </Card>
  );
};

export default ProductCard;
