// src/views/pages/ProductsPage/components/SidebarUpper.tsx

import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

const SidebarUpper: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100%',
        flexGrow: 1,
        bgcolor: theme.palette.background.paper,
        borderRadius: '12px',
        overflowY: 'auto',
        boxShadow: 3,
        padding: 2,
      }}
    >
      {/* Header Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bgcolor="#007bff"
        color="white"
        padding="8px 16px"
        borderRadius="10px 10px 0 0"
        fontWeight="bold"
        fontSize="1.5625rem" // 25px in rem
      >
        <Typography variant="h6">5 LE</Typography>
        <Typography variant="h6">NO16</Typography>
      </Box>

      {/* Order Items */}
      {[...Array(3)].map((_, index) => (
        <Box key={index} py={1.5} borderBottom="1px dashed #ccc">
          {/* Item Row */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="body2" fontWeight="bold" fontSize="0.875rem">
              2 X
            </Typography>
            <Typography variant="body2" fontWeight="bold" fontSize="0.875rem">
              Water
            </Typography>
            <Typography variant="body2" fontSize="0.875rem">15</Typography>
            <Typography variant="body2" fontWeight="bold" fontSize="0.875rem">
              30 LE
            </Typography>
          </Box>
          {/* Additional Details */}
          <Box ml={3}>
            <Typography variant="caption" color="text.secondary" fontSize="0.75rem" display="block">
              — Single
            </Typography>
            <Typography variant="caption" color="text.secondary" fontSize="0.75rem" display="block">
              + onions
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default SidebarUpper;
