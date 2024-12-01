// src/views/pages/ProductsPage/components/SidebarLower.tsx

import React from 'react';
import { Button, Box, Typography, useTheme } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../../store/Store';
import { updateItemQuantity } from '../../../../store/slices/cartSlice';

const SidebarLower: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const cart = useSelector((state: AppState) => state.cart);
  const selectedItemId = cart.selectedItemId;

  // دالة لمعالجة الضغط على الأزرار
  const handleNumpadClick = (value: string) => {
    if (!selectedItemId) return;

    const item = cart.items.find(item => item.id === selectedItemId);

    if (!item) return;

    let newQuantity = item.quantity;

    if (value === '.' || value === ',') {
      // يمكنك تحديد كيفية التعامل مع النقاط والفواصل إذا لزم الأمر
      return;
    } else {
      const num = parseInt(value, 10);
      if (!isNaN(num)) {
        newQuantity = newQuantity * 10 + num;
      }
    }

    dispatch(updateItemQuantity({ id: item.id, quantity: newQuantity }));
  };

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
        {/* Subtotal */}
        <Box display="flex" justifyContent="space-between" mb={0.5}>
          <Typography variant="body2">الإجمالي الفرعي :</Typography>
          <Typography variant="body2">{cart.subtotal.toFixed(2)} LE</Typography>
        </Box>
        {/* Discount */}
        <Box display="flex" justifyContent="space-between" mb={0.5}>
          <Typography variant="body2">الخصم :</Typography>
          <Typography variant="body2">{cart.discount.toFixed(2)} LE</Typography>
        </Box>
        {/* VAT */}
        <Box display="flex" justifyContent="space-between" mb={0.5}>
          <Typography variant="body2">الضريبة :</Typography>
          <Typography variant="body2">{cart.vat.toFixed(2)} LE</Typography>
        </Box>
        {/* Service */}
        <Box display="flex" justifyContent="space-between" mb={0.5}>
          <Typography variant="body2">الخدمة :</Typography>
          <Typography variant="body2">{cart.service.toFixed(2)} LE</Typography>
        </Box>
      </Box>

      {/* Numpad Buttons */}
      <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={0.5}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', '.'].map((value) => (
          <Button
            key={value}
            variant="contained"
            onClick={() => handleNumpadClick(value)}
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
