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
      alignItems="left"
      gap={2}
      sx={{
        overflowX: 'auto',
        flexGrow: 1,
        padding: 1,
        bgcolor: '#f5f5f5', // Light background for the entire container
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
              selectedScreenId === category.screenId ? '#1E88E5' : '#FFF',
            borderRadius: '5px', // Rounded corners
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'left',
            padding: '10px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            boxShadow:
              selectedScreenId === category.screenId
                ? '0px 4px 10px rgba(0, 0, 0, 0.2)' // Box shadow for the selected tab
                : '0px 2px 5px rgba(0, 0, 0, 0.1)',
            minWidth: '100px',
            width: '96px', // Fixed width
            height: '103px', // Fixed height
            '&:hover': {
              bgcolor:
                selectedScreenId === category.screenId
                  ? '#1565C0'
                  : 'rgba(0, 0, 0, 0.05)', // Subtle hover effect for unselected
            },
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: '5px', // Rounded image
              backgroundImage: `url(${getImageUrl(category.img)})`, // Set the image as background
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 'bold',
              fontSize: '16px',
              textAlign: 'left',
            }}
          >
            {category.screenName}
          </Typography>
        </Button>
      ))}
    </Box>
  );
};

export default CategoryTabs;
