// src/views/pages/ProductsPage/components/ProductCard.tsx

import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Product, ProductPrice } from '../../../../types/product';
import { getImageUrl } from '../../../../utils/getImageUrl';
import { useDispatch } from 'react-redux';
import { addItemToCart } from '../../../../store/slices/cartSlice';
import { v4 as uuidv4 } from 'uuid';

interface ProductCardProps {
  product: Product;
}

type DialogStep = {
  type: 'sizeSelection' | number;
  data: any;
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();

  // حالة فتح النافذة المنبثقة
  const [open, setOpen] = useState(false);

  // حالة إظهار Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // خطوات الحوار
  const [dialogSteps, setDialogSteps] = useState<DialogStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // الحالات المختارة
  const [selectedSize, setSelectedSize] = useState<ProductPrice | null>(null);
  const [selectedComments, setSelectedComments] = useState<{ [id: string]: string[] }>({});
  const [selectedGroupProducts, setSelectedGroupProducts] = useState<{
    [groupId: string]: ProductPrice[];
  }>({});

  // فتح النافذة المنبثقة
  const handleOpen = () => {
    setOpen(true);
    setCurrentStepIndex(0);
    setSelectedSize(null);
    setSelectedComments({});
    setSelectedGroupProducts({});

    // إعداد الخطوات
    const sizes = product.productPrices.filter((price) => price.lineType === 1);
    const otherPrices = product.productPrices.filter((price) => price.lineType !== 1);

    const steps: DialogStep[] = [];

    // إضافة خطوة اختيار الحجم
    if (sizes.length > 0) {
      steps.push({
        type: 'sizeSelection',
        data: sizes,
      });
    }

    // إضافة بقية الخطوات بالترتيب
    steps.push(
      ...otherPrices.map((price) => ({
        type: price.lineType,
        data: price,
      }))
    );

    setDialogSteps(steps);
  };

  // إغلاق النافذة المنبثقة وإعادة تعيين الاختيارات
  const handleClose = () => {
    setOpen(false);
    setCurrentStepIndex(0);
    setSelectedSize(null);
    setSelectedComments({});
    setSelectedGroupProducts({});
  };

  // الانتقال إلى الخطوة التالية
  const handleNextStep = () => {
    if (currentStepIndex + 1 < dialogSteps.length) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleAddToCart();
    }
  };

  // اختيار الحجم
  const handleSizeSelect = (size: ProductPrice) => {
    setSelectedSize(size);
    if (dialogSteps.length === 1) {
      // إذا كان هناك خطوة واحدة فقط (الأحجام)، أضف المنتج مباشرةً
      handleAddToCart();
    } else {
      handleNextStep();
    }
  };

  // اختيار التعليقات
  const handleCommentToggle = (groupId: string, comment: string) => {
    setSelectedComments((prev) => {
      const groupComments = prev[groupId] || [];
      if (groupComments.includes(comment)) {
        return { ...prev, [groupId]: groupComments.filter((c) => c !== comment) };
      } else {
        return { ...prev, [groupId]: [...groupComments, comment] };
      }
    });
  };

  // اختيار المنتجات من المجموعة
  const handleGroupProductToggle = (groupId: string, product: ProductPrice) => {
    setSelectedGroupProducts((prev) => {
      const groupProducts = prev[groupId] || [];
      const exists = groupProducts.find((p) => p.productPriceId === product.productPriceId);
      if (exists) {
        return {
          ...prev,
          [groupId]: groupProducts.filter((p) => p.productPriceId !== product.productPriceId),
        };
      } else {
        // تحقق من أن العدد المختار لا يتجاوز qtyToSelect
        const currentGroup = dialogSteps.find(
          (step) => step.type === 3 && step.data.productPriceId === groupId
        )?.data;
        const qtyToSelect = currentGroup?.qtyToSelect || 0;
        if (groupProducts.length < qtyToSelect) {
          return {
            ...prev,
            [groupId]: [...groupProducts, product],
          };
        } else {
          // يمكنك إضافة إشعار للمستخدم بأنه لا يمكنه اختيار أكثر من العدد المحدد
          return prev;
        }
      }
    });
  };

  // إضافة المنتج إلى العربة
  const handleAddToCart = () => {
    if (selectedSize) {
      const additions = Object.values(selectedComments).flat();

      let totalPrice = selectedSize.price || 0;
      let groupProductsDetails: any[] = [];

      // حساب السعر وإعداد تفاصيل المنتجات من المجموعات
      for (const [groupId, products] of Object.entries(selectedGroupProducts)) {
        const group = dialogSteps.find(
          (step) => step.type === 3 && step.data.productPriceId === groupId
        )?.data;
        if (group) {
          if (group.groupPriceType === 0) {
            // Zero: لا تضيف شيء للسعر
          } else if (group.groupPriceType === 1) {
            // As Products: أضف أسعار المنتجات المختارة
            const groupTotal = products.reduce((sum, p) => sum + (p.price || 0), 0);
            totalPrice += groupTotal;
          } else if (group.groupPriceType === 2) {
            // Manual: استخدم groupPrice
            totalPrice += group.groupPrice || 0;
          }
          // إضافة تفاصيل المنتجات المختارة
          groupProductsDetails.push({
            groupName: group.productPriceName || 'Group',
            products: products.map((p) => p.productPriceName || p.productPriceId),
          });
        }
      }

      const cartItem = {
        id: uuidv4(),
        productId: product.productId,
        productName: product.productName,
        size: selectedSize.productPriceName || 'Standard',
        price: totalPrice,
        quantity: 1,
        total: totalPrice * 1,
        vat: product.vat,
        additions: additions.length > 0 ? additions : undefined,
        groupProducts: groupProductsDetails,
      };
      dispatch(addItemToCart(cartItem));
      setSnackbarOpen(true);
      handleClose();
    }
  };

  // إغلاق Snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // الحصول على الخطوة الحالية
  const currentStep = dialogSteps[currentStepIndex];

  // تحقق مما إذا كنا في الخطوة الأخيرة
  const isLastStep = currentStepIndex === dialogSteps.length - 1;

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
          padding: 0,
        }}
      >
        {/* الجزء الخاص بالصورة */}
        <Box
          sx={{
            flex: 1,
            backgroundImage: `url(${getImageUrl(product.productImage)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
            height: '67%',
          }}
        />
        {/* الجزء الأبيض السفلي */}
        <Box
          sx={{
            height: '33%',
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
            {selectedSize ? `${selectedSize.price} LE` : ''}
          </Typography>
        </Box>
      </Card>

      {/* نافذة منبثقة */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        {currentStep && (
          <>
            {/* معالجة الخطوات بناءً على type */}
            {currentStep.type === 'sizeSelection' && (
              <>
                <DialogTitle>اختر الحجم</DialogTitle>
                <DialogContent>
                  <Box display="flex" flexDirection="column" gap={1} mt={2}>
                    {currentStep.data.map((size: ProductPrice) => (
                      <Button
                        key={size.productPriceId}
                        variant={
                          selectedSize?.productPriceId === size.productPriceId
                            ? 'contained'
                            : 'outlined'
                        }
                        onClick={() => handleSizeSelect(size)}
                        sx={{
                          justifyContent: 'flex-start',
                        }}
                      >
                        {size.productPriceName || 'Standard'}
                      </Button>
                    ))}
                  </Box>
                </DialogContent>
                <DialogActions>
                  {dialogSteps.length === 1 ? (
                    <Button onClick={handleClose}>إلغاء</Button>
                  ) : (
                    <Button onClick={handleClose}>إلغاء</Button>
                  )}
                </DialogActions>
              </>
            )}

            {currentStep.type === 2 && (
              <>
                <DialogTitle>اختر إضافات</DialogTitle>
                <DialogContent>
                  <Typography variant="subtitle1" mt={1}>
                    {currentStep.data.productPriceName || 'إضافات'}
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1} mt={1}>
                    {currentStep.data.priceComments?.map((comment: any) => (
                      <Button
                        key={comment.commentId}
                        variant={
                          selectedComments[currentStep.data.productPriceId]?.includes(comment.name)
                            ? 'contained'
                            : 'outlined'
                        }
                        onClick={() =>
                          handleCommentToggle(currentStep.data.productPriceId, comment.name)
                        }
                        sx={{
                          justifyContent: 'flex-start',
                        }}
                      >
                        {comment.name}
                      </Button>
                    ))}
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose}>إلغاء</Button>
                  {isLastStep ? (
                    <Button onClick={handleAddToCart} variant="contained">
                      إضافة
                    </Button>
                  ) : (
                    <Button onClick={handleNextStep}>التالي</Button>
                  )}
                </DialogActions>
              </>
            )}

            {currentStep.type === 3 && (
              <>
                <DialogTitle>
                  اختر من {currentStep.data.productPriceName || 'المجموعة'}
                </DialogTitle>
                <DialogContent>
                  <Typography variant="subtitle1" mt={1}>
                    يمكنك اختيار {currentStep.data.qtyToSelect} عناصر
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1} mt={1}>
                    {currentStep.data.priceGroups?.map((groupProduct: ProductPrice) => (
                      <FormControlLabel
                        key={groupProduct.productPriceId}
                        control={
                          <Checkbox
                            checked={
                              selectedGroupProducts[currentStep.data.productPriceId]?.some(
                                (p) => p.productPriceId === groupProduct.productPriceId
                              ) || false
                            }
                            onChange={() =>
                              handleGroupProductToggle(
                                currentStep.data.productPriceId,
                                groupProduct
                              )
                            }
                          />
                        }
                        label={groupProduct.productPriceName || 'منتج'}
                      />
                    ))}
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose}>إلغاء</Button>
                  {isLastStep ? (
                    <Button onClick={handleAddToCart} variant="contained">
                      إضافة
                    </Button>
                  ) : (
                    <Button onClick={handleNextStep}>التالي</Button>
                  )}
                </DialogActions>
              </>
            )}
          </>
        )}
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
