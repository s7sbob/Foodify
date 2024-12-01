// src/views/pages/ProductsPage/components/SidebarUpper.tsx

import React from 'react';
import { Box, Typography, useTheme, IconButton } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from '../../../../store/Store';
import {
  removeItemFromCart,
  updateItemQuantity,
  selectCartItem,
} from '../../../../store/slices/cartSlice';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const SidebarUpper: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const cart = useSelector((state: AppState) => state.cart);

  const handleRemove = (id: string) => {
    dispatch(removeItemFromCart({ id }));
  };

  const handleIncreaseQuantity = (id: string) => {
    const item = cart.items.find((item) => item.id === id);
    if (item) {
      dispatch(updateItemQuantity({ id, quantity: item.quantity + 1 }));
    }
  };

  const handleDecreaseQuantity = (id: string) => {
    const item = cart.items.find((item) => item.id === id);
    if (item && item.quantity > 1) {
      dispatch(updateItemQuantity({ id, quantity: item.quantity - 1 }));
    }
  };

  const handleSelectItem = (id: string) => {
    dispatch(selectCartItem(id));
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
        fontSize="1.5625rem"
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
        cart.items.map((item) => (
          <Box
            key={item.id}
            py={1.5}
            borderBottom="1px dashed #ccc"
            onClick={() => handleSelectItem(item.id)}
            sx={{
              cursor: 'pointer',
              backgroundColor:
                cart.selectedItemId === item.id ? '#e3f2fd' : 'transparent',
              borderRadius: '4px',
              padding: '4px',
            }}
          >
            {/* Item Row */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={0.5}
            >
              <Typography
                variant="body2"
                fontWeight="bold"
                fontSize="0.875rem"
              >
                {item.quantity} X
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                fontSize="0.875rem"
              >
                {item.productName}
              </Typography>
              <Typography variant="body2" fontSize="0.875rem">
                {item.price} LE
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                fontSize="0.875rem"
              >
                {item.total.toFixed(2)} LE
              </Typography>
            </Box>
            {/* Display Selected Size */}
            {item.size && (
              <Box ml={3}>
                <Typography
                  variant="caption"
                  fontWeight="bold"
                  fontSize="0.75rem"
                  display="block"
                >
                  الحجم: {item.size}
                </Typography>
              </Box>
            )}
            {/* Additional Details */}
            {item.additions && item.additions.length > 0 && (
              <Box ml={3} mt={0.5}>
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
            {/* Group Products Details */}
            {item.groupProducts && item.groupProducts.length > 0 && (
              <Box ml={3} mt={0.5}>
                {item.groupProducts.map((group, groupIndex) => (
                  <Box key={groupIndex} mb={0.5}>
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      fontSize="0.75rem"
                    >
                      {group.groupName}:
                    </Typography>
                    {group.products.map((productName, prodIndex) => (
                      <Typography
                        key={prodIndex}
                        variant="caption"
                        color="text.secondary"
                        fontSize="0.75rem"
                        display="block"
                      >
                        — {productName}
                      </Typography>
                    ))}
                  </Box>
                ))}
              </Box>
            )}
            {/* Quantity Controls */}
            <Box display="flex" alignItems="center" ml={3} mt={1}>
              <IconButton
                size="small"
                onClick={() => handleDecreaseQuantity(item.id)}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <Typography variant="body2" sx={{ mx: 1 }}>
                {item.quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleIncreaseQuantity(item.id)}
              >
                <AddIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleRemove(item.id)}
              >
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
