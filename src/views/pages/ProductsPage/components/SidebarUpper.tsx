// src/views/pages/ProductsPage/components/SidebarUpper.tsx

import React from 'react';
import { Box, Typography, useTheme, IconButton } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from '../../../../store/Store';
import { removeItemFromCart, updateItemQuantity } from '../../../../store/slices/cartSlice';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const SidebarUpper: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const cart = useSelector((state: AppState) => state.cart);

  const handleRemove = (productId: string, size: string) => {
    dispatch(removeItemFromCart({ productId, size }));
  };

  const handleIncreaseQuantity = (productId: string, size: string) => {
    const item = cart.items.find(
      item => item.productId === productId && item.size === size
    );
    if (item) {
      dispatch(updateItemQuantity({ productId, size, quantity: item.quantity + 1 }));
    }
  };

  const handleDecreaseQuantity = (productId: string, size: string) => {
    const item = cart.items.find(
      item => item.productId === productId && item.size === size
    );
    if (item && item.quantity > 1) {
      dispatch(updateItemQuantity({ productId, size, quantity: item.quantity - 1 }));
    }
  };

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
        <Typography variant="h6">{cart.total.toFixed(2)} LE</Typography>
        <Typography variant="h6">{cart.orderNumber}</Typography>
      </Box>

      {/* Order Items */}
      {cart.items.length === 0 ? (
        <Typography variant="body2" sx={{ mt: 2 }}>
          لا توجد عناصر في العربة.
        </Typography>
      ) : (
        cart.items.map((item, index) => (
          <Box key={index} py={1.5} borderBottom="1px dashed #ccc">
            {/* Item Row */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography variant="body2" fontWeight="bold" fontSize="0.875rem">
                {item.quantity} X
              </Typography>
              <Typography variant="body2" fontWeight="bold" fontSize="0.875rem">
                {item.productName}
              </Typography>
              <Typography variant="body2" fontSize="0.875rem">{item.price}</Typography>
              <Typography variant="body2" fontWeight="bold" fontSize="0.875rem">
                {item.total.toFixed(2)} LE
              </Typography>
            </Box>
            {/* Additional Details */}
            {item.additions && item.additions.length > 0 && (
              <Box ml={3}>
                {item.additions.map((addition, addIndex) => (
                  <Typography
                    key={addIndex}
                    variant="caption"
                    color="text.secondary"
                    fontSize="0.75rem"
                    display="block"
                  >
                    — {addition}
                  </Typography>
                ))}
              </Box>
            )}
            {/* Quantity Controls */}
            <Box display="flex" alignItems="center" ml={3} mt={1}>
              <IconButton size="small" onClick={() => handleDecreaseQuantity(item.productId, item.size)}>
                <RemoveIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2" sx={{ mx: 1 }}>
                {item.quantity}
              </Typography>
              <IconButton size="small" onClick={() => handleIncreaseQuantity(item.productId, item.size)}>
                <AddIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleRemove(item.productId, item.size)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ))
      )}
    </Box>
  );
};

export default SidebarUpper;
