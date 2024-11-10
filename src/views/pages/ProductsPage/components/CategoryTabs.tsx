import React, { useState } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';

const categories = [
  { name: 'Crepe', image: '/path/to/crepe_image.jpg' },
  { name: 'Pizza', image: '/path/to/pizza_image.jpg' },
  { name: 'Pasta', image: '/path/to/pasta_image.jpg' },
  { name: 'Salad', image: '/path/to/salad_image.jpg' },
  { name: 'Meat', image: '/path/to/meat_image.jpg' },
  { name: 'Fish', image: '/path/to/fish_image.jpg' },
  { name: 'Drink', image: '/path/to/drink_image.jpg' },
];

const CategoryTabs: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Crepe');
  const theme = useTheme();

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      sx={{
        overflowX: 'auto',
        flexGrow: 1,
        padding: 1,
        bgcolor: 'transparent', // Transparent background for the entire component
      }}
    >
      {categories.map((category) => (
        <Button
          key={category.name}
          onClick={() => setActiveCategory(category.name)}
          sx={{
            color: activeCategory === category.name ? '#FFF' : theme.palette.text.primary,
            bgcolor: activeCategory === category.name ? '#1E88E5' : 'transparent', // Active button has color, others are transparent
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 1,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            boxShadow: activeCategory === category.name ? '0px 4px 8px rgba(0, 0, 0, 0.2)' : 'none', // Shadow only for active
            minWidth: '80px',
            '&:hover': {
              bgcolor: activeCategory === category.name ? '#1565C0' : 'rgba(0, 0, 0, 0.05)', // Slight hover effect
            },
          }}
        >
          <img
            src={category.image}
            alt={category.name}
            style={{ width: '40px', height: '40px', borderRadius: '4px', marginBottom: '4px' }}
          />
          <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
            {category.name}
          </Typography>
        </Button>
      ))}

    </Box>
  );
};

export default CategoryTabs;
