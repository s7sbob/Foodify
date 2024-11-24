// src/views/pages/ProductsPage/components/CategoryTabs.tsx

import React, { useEffect } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProductPosScreens } from '../../../../store/slices/productPosScreensSlice';
import {
  fetchAllProducts,
  setSelectedScreenId,
} from '../../../../store/slices/productsSlice';
import { AppState } from '../../../../store/Store';
import { getImageUrl } from '../../../../utils/getImageUrl';

const CategoryTabs: React.FC = () => {
  const dispatch = useDispatch();
  const productPosScreensState = useSelector(
    (state: AppState) => state.productPosScreens
  );
  const { productPosScreens, loading, error } = productPosScreensState;

  const selectedScreenId = useSelector(
    (state: AppState) => state.products.selectedScreenId
  );

  const theme = useTheme();

  useEffect(() => {
    dispatch(fetchProductPosScreens());
    dispatch(fetchAllProducts());
  }, [dispatch]);

  const handleCategoryClick = (screenId: string) => {
    dispatch(setSelectedScreenId(screenId));
  };

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ: {error}</div>;
  if (!Array.isArray(productPosScreens)) {
    return <div>لا توجد بيانات متاحة</div>;
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      sx={{
        overflowX: 'auto',
        flexGrow: 1,
        padding: 1,
        bgcolor: 'transparent',
      }}
    >
      {productPosScreens.map((category) => (
        <Button
          key={category.screenId}
          onClick={() => handleCategoryClick(category.screenId)}
          sx={{
            color:
              selectedScreenId === category.screenId
                ? '#FFF'
                : theme.palette.text.primary,
            bgcolor:
              selectedScreenId === category.screenId ? '#1E88E5' : 'transparent',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 1,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            boxShadow:
              selectedScreenId === category.screenId
                ? '0px 4px 8px rgba(0, 0, 0, 0.2)'
                : 'none',
            minWidth: '80px',
            '&:hover': {
              bgcolor:
                selectedScreenId === category.screenId
                  ? '#1565C0'
                  : 'rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          <img
            src={getImageUrl(category.img)}
            alt={category.screenName}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '4px',
              marginBottom: '4px',
            }}
          />
          <Typography
            variant="caption"
            sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
          >
            {category.screenName}
          </Typography>
        </Button>
      ))}
    </Box>
  );
};

export default CategoryTabs;
