// src/views/pages/Products/AddProductForm.tsx

import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import {
  Typography,
  TextField,
  Grid,
  Button,
  CircularProgress,
  Box,
  Autocomplete,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from '../../../store/Store';
import { useNotification } from '../../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Product, ProductPrice } from '../../../types/productTypes';
import {
  getCompanyData,
  getProductGroups,
  getPosScreens,
  createProduct,
} from '../../../services/apiService';

interface AddProductFormProps {
  onProductAdded: () => void;
  productPrices: ProductPrice[];
  setProductPrices: React.Dispatch<React.SetStateAction<ProductPrice[]>>;
  handleAddEntry: (lineType: number) => void;
}

export interface AddProductFormRef {
  resetForm: () => void;
  submitForm: () => void;
}

const AddProductForm = forwardRef<AddProductFormRef, AddProductFormProps>(
  ({ onProductAdded, productPrices, setProductPrices, handleAddEntry }, ref) => {
    const [formData, setFormData] = useState<Product>({
      productId: '',
      productName: '',
      productName2: '',
      productGroupId: '',
      productPrices: [],
      branchId: '',
      companyId: '',
      status: true,
      posScreenId: '',
      discount: 0,
      vat: 0,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
    const token = useSelector((state: AppState) => state.auth.token);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    // Fetch necessary data: branches, productGroups, posScreens
    const [branches, setBranches] = useState<any[]>([]);
    const [productGroups, setProductGroups] = useState<any[]>([]);
    const [posScreens, setPosScreens] = useState<any[]>([]);

    useEffect(() => {
      const fetchData = async () => {
        if (!token) return;
        try {
          // Fetch company data
          const companyData = await getCompanyData(baseurl, token);
          setBranches(companyData.branches);
          setFormData((prev) => ({
            ...prev,
            companyId: companyData.companyId,
          }));

          // Fetch product groups
          const groups = await getProductGroups(baseurl, token);
          setProductGroups(groups);

          // Fetch pos screens
          const screens = await getPosScreens(baseurl, token);
          setPosScreens(screens);
        } catch (error) {
          console.error('Error fetching data:', error);
          showNotification('فشل في جلب البيانات المطلوبة.', 'error', 'خطأ');
        }
      };

      fetchData();
    }, [baseurl, token, showNotification]);

    // Handle form submission
    const handleSubmit = async () => {
      if (!token) {
        showNotification('يجب تسجيل الدخول لإجراء هذه العملية.', 'error', 'غير مصرح');
        navigate('/login');
        return;
      }

      // التحقق من الحقول المطلوبة
      if (!formData.productName || !formData.productGroupId || !formData.branchId) {
        showNotification('يرجى ملء جميع الحقول المطلوبة.', 'warning', 'بيانات غير مكتملة');
        return;
      }

      // التحقق الإضافي بناءً على lineType
      for (const [index, entry] of productPrices.entries()) {
        if (entry.lineType === 1) {
          // price
          if (!entry.productPriceName || entry.price === undefined || entry.price <= 0) {
            showNotification(
              `يرجى ملء جميع حقول سعر المنتج في الإدخال رقم ${index + 1}.`,
              'warning',
              'بيانات غير مكتملة'
            );
            return;
          }
        } else if (entry.lineType === 2) {
          // commentGroup
          // التحقق من كل تعليق داخل مجموعة التعليقات
          if (entry.priceComments) {
            for (const [cIndex, comment] of entry.priceComments.entries()) {
              if (!comment.name || !comment.description) {
                showNotification(
                  `يرجى ملء جميع حقول التعليقات في الإدخال رقم ${index + 1}, التعليق رقم ${
                    cIndex + 1
                  }.`,
                  'warning',
                  'بيانات غير مكتملة'
                );
                return;
              }
            }
          }
        } else if (entry.lineType === 3) {
          // groupProduct
          if (
            entry.qtyToSelect === undefined ||
            entry.qtyToSelect <= 0 ||
            !entry.groupPriceType
          ) {
            showNotification(
              `يرجى ملء جميع حقول منتجات المجموعة في الإدخال رقم ${index + 1}.`,
              'warning',
              'بيانات غير مكتملة'
            );
            return;
          }
          if (
            entry.groupPriceType === 3 &&
            (entry.groupPrice === undefined || entry.groupPrice <= 0)
          ) {
            showNotification(
              `يرجى إدخال سعر المجموعة بشكل صحيح في الإدخال رقم ${index + 1}.`,
              'warning',
              'بيانات غير مكتملة'
            );
            return;
          }
        }
      }

      setLoading(true);
      try {
        // بناء FormData
        const formPayload = new FormData();
        formPayload.append('productName', formData.productName);
        formPayload.append('productName2', formData.productName2 || '');
        formPayload.append('productGroupId', formData.productGroupId);
        formPayload.append('branchId', formData.branchId);
        formPayload.append('posScreenId', formData.posScreenId || '');
        formPayload.append('discount', formData.discount?.toString() || '0');
        formPayload.append('vat', formData.vat?.toString() || '0');
        formPayload.append('companyId', formData.companyId!);
        formPayload.append('status', formData.status.toString());

        // إضافة productPrices مع الأنواع المختلفة
        productPrices.forEach((entry, priceIndex) => {
          formPayload.append(`productPrices[${priceIndex}].lineType`, entry.lineType.toString());
          if (entry.lineType === 1) {
            // price
            formPayload.append(
              `productPrices[${priceIndex}].productPriceName`,
              entry.productPriceName!
            );
            formPayload.append(`productPrices[${priceIndex}].price`, entry.price!.toString());
          } else if (entry.lineType === 2) {
            // commentGroup
            // إضافة التعليقات
            if (entry.priceComments) {
              entry.priceComments.forEach((comment, commentIndex) => {
                formPayload.append(
                  `productPrices[${priceIndex}].priceComments[${commentIndex}].name`,
                  comment.name
                );
                formPayload.append(
                  `productPrices[${priceIndex}].priceComments[${commentIndex}].description`,
                  comment.description || ''
                );
                formPayload.append(
                  `productPrices[${priceIndex}].priceComments[${commentIndex}].productPriceId`,
                  comment.productPriceId
                );
                formPayload.append(
                  `productPrices[${priceIndex}].priceComments[${commentIndex}].branchId`,
                  formData.branchId // استخدام branchId من النموذج
                );
                formPayload.append(
                  `productPrices[${priceIndex}].priceComments[${commentIndex}].companyId`,
                  formData.companyId! // استخدام companyId من النموذج
                );
                formPayload.append(
                  `productPrices[${priceIndex}].priceComments[${commentIndex}].status`,
                  comment.status.toString()
                );
              });
            }
          } else if (entry.lineType === 3) {
            // groupProduct
            formPayload.append(
              `productPrices[${priceIndex}].qtyToSelect`,
              entry.qtyToSelect!.toString()
            );
            formPayload.append(
              `productPrices[${priceIndex}].groupPriceType`,
              entry.groupPriceType!.toString()
            );
            formPayload.append(
              `productPrices[${priceIndex}].groupPrice`,
              entry.groupPrice!.toString()
            );

            // Assuming priceGroups is an array of selected products
            if (entry.priceGroups && entry.priceGroups.length > 0) {
              entry.priceGroups.forEach((pg, pgIndex) => {
                formPayload.append(
                  `productPrices[${priceIndex}].priceGroups[${pgIndex}].productId`,
                  pg.productId
                );
                formPayload.append(
                  `productPrices[${priceIndex}].priceGroups[${pgIndex}].productPriceId`,
                  pg.productPriceId
                );
                formPayload.append(
                  `productPrices[${priceIndex}].priceGroups[${pgIndex}].quantity`,
                  pg.quantity.toString()
                );
              });
            }
          }

          formPayload.append(`productPrices[${priceIndex}].branchId`, formData.branchId);
          formPayload.append(`productPrices[${priceIndex}].companyId`, formData.companyId!);
          formPayload.append(`productPrices[${priceIndex}].status`, entry.status.toString());
        });

        // إضافة الصورة إذا كانت موجودة
        if (imageFile) {
          formPayload.append('imageFile', imageFile);
        }

        console.log('FormData Entries:');
        for (let pair of formPayload.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }

        // إرسال طلب POST باستخدام وظيفة createProduct من apiService
        await createProduct(baseurl, token, formPayload);

        showNotification('تم إضافة المنتج بنجاح!', 'success', 'نجاح');
        onProductAdded();

        // إعادة تعيين النموذج
        resetForm();
        setImageFile(null);
      } catch (err) {
        console.error('Error adding product:', err);
        showNotification('فشل في إضافة المنتج.', 'error', 'خطأ');
      } finally {
        setLoading(false);
      }
    };

    // Derived selected options for Autocomplete
    const selectedProductGroup = useMemo(
      () => productGroups.find((group) => group.groupId === formData.productGroupId) || null,
      [productGroups, formData.productGroupId]
    );

    const selectedBranch = useMemo(
      () => branches.find((branch) => branch.branchId === formData.branchId) || null,
      [branches, formData.branchId]
    );

    const selectedPosScreen = useMemo(
      () => posScreens.find((screen) => screen.screenId === formData.posScreenId) || null,
      [posScreens, formData.posScreenId]
    );

    // Expose resetForm and submitForm via ref
    useImperativeHandle(ref, () => ({
      resetForm: () => {
        setFormData({
          productId: '',
          productName: '',
          productName2: '',
          productGroupId: '',
          productPrices: [],
          branchId: '',
          companyId: formData.companyId, // الاحتفاظ بـ companyId
          posScreenId: '',
          discount: 0,
          vat: 0,
          status: true,
        });
        setImageFile(null);
        setProductPrices([]); // إعادة تعيين الأسطر الناتجة
      },
      submitForm: handleSubmit,
    }));

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          إضافة منتج جديد
        </Typography>

        {/* الحقول الأساسية */}
        <Grid container spacing={2}>
          {/* اسم المنتج */}
          <Grid item xs={12}>
            <TextField
              label="اسم المنتج"
              name="productName"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              fullWidth
              required
            />
          </Grid>
          {/* اسم المنتج 2 */}
          <Grid item xs={12}>
            <TextField
              label="اسم المنتج 2"
              name="productName2"
              value={formData.productName2 || ''}
              onChange={(e) => setFormData({ ...formData, productName2: e.target.value })}
              fullWidth
            />
          </Grid>
          {/* مجموعة المنتج باستخدام Autocomplete */}
          <Grid item xs={12}>
            <Autocomplete
              options={productGroups}
              getOptionLabel={(option) => option.groupName}
              value={selectedProductGroup}
              onChange={(event, newValue) => {
                setFormData({
                  ...formData,
                  productGroupId: newValue ? newValue.groupId : '',
                });
              }}
              renderInput={(params) => (
                <TextField {...params} label="مجموعة المنتج" required fullWidth />
              )}
              isOptionEqualToValue={(option, value) => option.groupId === value.groupId}
            />
          </Grid>
          {/* الفرع باستخدام Autocomplete */}
          <Grid item xs={12}>
            <Autocomplete
              options={branches}
              getOptionLabel={(option) => option.branchName}
              value={selectedBranch}
              onChange={(event, newValue) => {
                setFormData({
                  ...formData,
                  branchId: newValue ? newValue.branchId : '',
                });
              }}
              renderInput={(params) => <TextField {...params} label="الفرع" required fullWidth />}
              isOptionEqualToValue={(option, value) => option.branchId === value.branchId}
            />
          </Grid>
          {/* شاشة نقاط البيع (اختياري) باستخدام Autocomplete */}
          <Grid item xs={12}>
            <Autocomplete
              options={posScreens}
              getOptionLabel={(option) => option.screenName}
              value={selectedPosScreen}
              onChange={(event, newValue) => {
                setFormData({
                  ...formData,
                  posScreenId: newValue ? newValue.screenId : '',
                });
              }}
              renderInput={(params) => (
                <TextField {...params} label="شاشة نقاط البيع" fullWidth />
              )}
              isOptionEqualToValue={(option, value) => option.screenId === value.screenId}
            />
          </Grid>
          {/* الخصم */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="الخصم"
              name="discount"
              type="number"
              value={formData.discount ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discount: e.target.value ? parseFloat(e.target.value) : 0,
                })
              }
              fullWidth
            />
          </Grid>
          {/* ضريبة القيمة المضافة */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="ضريبة القيمة المضافة"
              name="vat"
              type="number"
              value={formData.vat ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  vat: e.target.value ? parseFloat(e.target.value) : 0,
                })
              }
              fullWidth
            />
          </Grid>
          {/* تحميل الصورة */}
          <Grid item xs={12}>
            <Button variant="contained" component="label">
              تحميل الصورة
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImageFile(e.target.files[0]);
                  }
                }}
              />
            </Button>
            {imageFile && <Typography variant="body2">{imageFile.name}</Typography>}
          </Grid>
        </Grid>

        {/* الأزرار الرئيسية في الأسفل */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => handleAddEntry(1)} // lineType 1: price
              fullWidth
            >
              إضافة سعر
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => handleAddEntry(2)} // lineType 2: commentGroup
              fullWidth
            >
              إضافة مجموعة تعليقات
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              color="success"
              onClick={() => handleAddEntry(3)} // lineType 3: groupProduct
              fullWidth
            >
              إضافة منتجات المجموعة
            </Button>
          </Grid>
        </Grid>
      </Box>
    );
  }
);

export default AddProductForm;
function resetForm() {
  throw new Error('Function not implemented.');
}

