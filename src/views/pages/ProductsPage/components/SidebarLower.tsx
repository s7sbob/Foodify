// src/views/pages/ProductsPage/components/SidebarLower.tsx

import React from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';

const SidebarLower: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100%',
        flexShrink: 0,
        bgcolor: theme.palette.background.paper,
        padding: 2,
        borderRadius: '12px',
        borderTop: '1px solid #ccc',
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Totals Section */}
      <Box mb={2}>
        {['Subtotal', 'Discount', 'Vat', 'Service'].map((label) => (
          <Box display="flex" justifyContent="space-between" mb={0.5} key={label}>
            <Typography variant="body2">{`${label} :`}</Typography>
            <Typography variant="body2">120 LE</Typography>
          </Box>
        ))}
      </Box>

      {/* Calculator Buttons */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(3, 1fr)"
        gap={0.5}
      >
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', '.'].map((value) => (
          <Button
            key={value}
            variant="contained"
            sx={{
              backgroundColor: '#007bff',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'bold',
              minWidth: '0px',
              '&:hover': {
                backgroundColor: '#006be6',
              },
            }}
          >
            {value}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default SidebarLower;
