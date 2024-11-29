// src/views/pages/ProductsPage/components/ProductCard.tsx

import React, { useState } from 'react';
import {
  Card,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { Product, ProductPrice } from '../../../../types/product';
import { getImageUrl } from '../../../../utils/getImageUrl';
import { useDispatch, useSelector } from 'react-redux';
import { addItemToCart } from '../../../../store/slices/cartSlice';
import { fetchAllProductPrices } from '../../../../store/slices/productPricesSlice';
import { AppState } from '../../../../store/Store';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();

  // حالة فتح النافذة المنبثقة
  const [open, setOpen] = useState(false);

  // حالة إظهار Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // جلب بيانات الأحجام والأسعار من Redux Store
  const productPricesState = useSelector((state: AppState) => state.productPrices);
  const { prices, loading, error } = productPricesState;

  // فتح النافذة المنبثقة وجلب بيانات الأحجام
  const handleOpen = () => {
    setOpen(true);
    dispatch(fetchAllProductPrices(product.productId));
  };

  // إغلاق النافذة المنبثقة
  const handleClose = () => {
    setOpen(false);
  };

  // إضافة المنتج إلى العربة
  const handleAddToCart = (selectedPrice: ProductPrice) => {
    if (selectedPrice) {
      const cartItem = {
        productId: product.productId,
        productName: product.productName,
        size: selectedPrice.productPriceName || 'Standard',
        price: selectedPrice.price || 0,
        quantity: 1, // دائماً نضيف 1 عند الضغط على زر الحجم
        total: (selectedPrice.price || 0) * 1,
        vat: product.vat,
        priceName: product.priceName,
      };
      dispatch(addItemToCart(cartItem));
      setSnackbarOpen(true); // إظهار الإشعار
    }
  };

  // إغلاق Snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Card
        onClick={handleOpen}
        sx={{
          width: '140px',
          height: '161px',
          borderRadius: '10px',
          boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.03)',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
          },
          display: 'flex',
          flexDirection: 'column',
          padding: 0, // تأكد من عدم وجود فراغات داخل الكارد
        }}
      >
        {/* الجزء الخاص بالصورة */}
        <Box
          sx={{
            flex: 1,
            backgroundImage: `url(${getImageUrl(product.productImage)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%', // الصورة تمتد بعرض الكارد بالكامل
            height: '67%', // الصورة تغطي الجزء العلوي فقط
          }}
        />
        {/* الجزء الأبيض السفلي */}
        <Box
          sx={{
            height: '33%', // الجزء الأبيض يأخذ المساحة المتبقية
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '8px 4px',
          }}
        >
          <Typography
            variant="body2"
            component="div"
            sx={{
              fontWeight: 'bold',
              fontSize: '0.8rem',
            }}
          >
            {product.productName}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: '0.7rem',
            }}
          >
            {product.productPrices[0]?.price
              ? `${product.productPrices[0].price} LE`
              : ''}
          </Typography>
        </Box>
      </Card>

      {/* Modal لاختيار الحجم */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>اختر الحجم</DialogTitle>
        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">خطأ: {error}</Typography>
          ) : prices.length === 0 ? (
            <Typography>لا توجد أحجام متاحة لهذا المنتج.</Typography>
          ) : (
            <Box
              display="flex"
              flexWrap="wrap"
              gap={1}
              mt={2}
              justifyContent="center"
            >
              {prices.map(price => (
                <Button
                  key={price.productPriceId}
                  variant="contained"
                  onClick={() => handleAddToCart(price)}
                  sx={{
                    flex: '1 0 45%',
                    textAlign: 'center',
                    whiteSpace: 'normal', // للسماح بتفاف النص
                    padding: '8px',
                    minHeight: '40px', // زيادة ارتفاع الزر لتحسين رؤية النص
                  }}
                >
                  {price.priceName ? price.priceName : 'حجم غير معروف'}
                </Button>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>إلغاء</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar لإشعار المستخدم */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          تم إضافة المنتج إلى العربة بنجاح!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductCard;
