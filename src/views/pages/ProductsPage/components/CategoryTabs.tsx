// src/views/pages/ProductsPage/components/CategoryTabs.tsx

import React, { useEffect } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProductPosScreens } from '../../../../store/slices/productPosScreensSlice';
import {
  fetchAllProducts,
  setSelectedPosScreenId, 
} from '../../../../store/slices/productsSlice'; 
import { AppState } from '../../../../store/Store'; 

import { getImageUrl } from '../../../../utils/getImageUrl';

const CategoryTabs: React.FC = () => {
  const dispatch = useDispatch();
  const productPosScreensState = useSelector(
    (state: AppState) => state.productPosScreens
  );
  const { productPosScreens, loading, error } = productPosScreensState;

  const selectedPosScreenId = useSelector(
    (state: AppState) => state.products.selectedPosScreenId 
  );

  const theme = useTheme();

  useEffect(() => {
    dispatch(fetchProductPosScreens());
    dispatch(fetchAllProducts());
  }, [dispatch]);

  const handleCategoryClick = (screenId: string | null) => { // السماح بـ null للزر "الكل"
    dispatch(setSelectedPosScreenId(screenId));
  };

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ: {error}</div>;
  if (!Array.isArray(productPosScreens)) {
    return <div>لا توجد بيانات متاحة</div>;
  }

  return (
    <Box
      display="flex"
      alignItems="center" // تحديث المحاذاة من 'left' إلى 'center'
      gap={2}
      sx={{
        overflowX: 'auto',
        flexGrow: 1,
        padding: 1,
        bgcolor: '#f5f5f5', // خلفية فاتحة  بالكامل
      }}
    >


      {/* عرض الفئات الأخرى */}
      {productPosScreens.map((category) => (
        <Button
          key={category.screenId}
          onClick={() => handleCategoryClick(category.screenId)}
          sx={{
            color:
              selectedPosScreenId === category.screenId
                ? '#FFF'
                : theme.palette.text.primary,
            bgcolor:
              selectedPosScreenId === category.screenId ? '#1E88E5' : '#FFF',
            borderRadius: '5px', // زوايا مستديرة
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', // محاذاة النص والرمز في الوسط
            padding: '10px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            boxShadow:
              selectedPosScreenId === category.screenId
                ? '0px 4px 10px rgba(0, 0, 0, 0.2)' // ظل لصندوق التبويب المحدد
                : '0px 2px 5px rgba(0, 0, 0, 0.1)',
            minWidth: '100px',
            width: '96px', // عرض ثابت
            height: '103px', // ارتفاع ثابت
            '&:hover': {
              bgcolor:
                selectedPosScreenId === category.screenId
                  ? '#1565C0'
                  : 'rgba(0, 0, 0, 0.05)', // تأثير hover خفيف للغير محدد
            },
          }}
        >
          <Box
            sx={{
              width: '50px',
              height: '50px',
              borderRadius: '5px', // زوايا مستديرة للصورة
              backgroundImage: `url(${getImageUrl(category.img)})`, // تعيين الصورة كخلفية
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              marginBottom: '8px',
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontWeight: 'bold',
              fontSize: '16px',
              textAlign: 'center',
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
