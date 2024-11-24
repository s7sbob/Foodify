// src\views\pages\ProductsPage\components\RightActionBarOptions.tsx

import React from 'react';
import { Button, Box, Typography, useTheme } from '@mui/material';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

const options = [
  { label: 'Takeaway', icon: <TableRestaurantIcon /> },
  { label: 'Dine-in', icon: <PersonIcon /> },
  { label: 'Delivery', icon: <LocalShippingIcon /> },
  { label: 'Pickup', icon: <CompareArrowsIcon /> },
];

const RightActionBarOptions: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 1,
        gap: '8px',
        fontFamily: 'Poppins',
        fontSize: '1rem',
        fontWeight: 400,
        lineHeight: '1.5rem',
        textAlign: 'center',
        overflowY: 'auto',
      }}
    >
      {options.map((option, index) => (
        <Button
          key={option.label}
          variant="contained"
          sx={{
            color: index === 1 ? '#FFF' : 'black', // Active button color
            fontSize: '0.75rem',
            fontWeight: 'bold',
            flexDirection: 'column',
            borderRadius: '8px',
            bgcolor: index === 1 ? '#1E88E5' : '#FFFFFF', // Background color based on active state
            '&:hover': {
              bgcolor: index === 1 ? '#1565C0' : '#E3F2FD',
            },
            width: '100%',
          }}
        >
          {option.icon}
          <Typography variant="caption" sx={{ mt: 0.5 }}>
            {option.label}
          </Typography>
        </Button>
      ))}
    </Box>
  );
};

export default RightActionBarOptions;
