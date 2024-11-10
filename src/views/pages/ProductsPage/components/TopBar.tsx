// src/views/pages/ProductsPage/components/TopBar.tsx

import React, { useState } from 'react';
import { Box, Button, Typography, useTheme, useMediaQuery } from '@mui/material';

const categories = [
  { name: 'Extra', color: '#4CAF50', icon: 'src/views/pages/ProductsPage/components/icons/extra_icon.png' },
  { name: 'Without', color: '#F44336', icon: 'src/views/pages/ProductsPage/components/icons/without_icon.png' },
  { name: 'Discount', color: '#FFFFFF', icon: 'src/views/pages/ProductsPage/components/icons/discount_icon.png' },
  { name: 'Customer', color: '#FFFFFF', icon: 'src/views/pages/ProductsPage/components/icons/customer_icon.png' },
  { name: 'Table', color: '#FFFFFF', icon: 'src/views/pages/ProductsPage/components/icons/table_icon.png' },
  { name: 'Orders', color: '#FFFFFF', icon: 'src/views/pages/ProductsPage/components/icons/orders_icon.png' },
  { name: 'Notes', color: '#FFFFFF', icon: 'src/views/pages/ProductsPage/components/icons/notes_icon.png' },
  { name: 'Kitchen', color: '#F44336', icon: 'src/views/pages/ProductsPage/components/icons/kitchen_icon.png' },
  { name: 'Print', color: '#4CAF50', icon: 'src/views/pages/ProductsPage/components/icons/print_icon.png' },
  { name: 'Cash', color: '#007BFF', icon: 'src/views/pages/ProductsPage/components/icons/cash_icon.png' },
];

const TopBar: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Extra');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Detect if the screen is small

  return (
    <Box
    display="flex"
    width="100%"
    height="96px"
    gap={1}
    sx={{
      overflowX: 'auto',
      borderRadius: '8px',
      padding: 1,
      boxSizing: 'border-box',
      bgcolor: 'transparent', // Set background to transparent
      boxShadow: 3,
    }}
    >
      {categories.map((category) => (
        <Button
          key={category.name}
          onClick={() => setActiveCategory(category.name)}
          sx={{
            flexGrow: 1,
            height: '80px',
            backgroundColor: category.color,
            color: category.color === '#FFFFFF' ? '#000' : '#FFF',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0.5,
            whiteSpace: 'nowrap',
            minWidth: isMobile ? '60px' : '80px',
            '&:hover': {
            },
          }}
        >
          <img
            src={category.icon}
            alt={category.name}
            style={{ width: '24px', height: '24px', marginBottom: '4px' }}
          />
          <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
            {category.name}
          </Typography>
        </Button>
      ))}
    </Box>
  );
};

export default TopBar;
