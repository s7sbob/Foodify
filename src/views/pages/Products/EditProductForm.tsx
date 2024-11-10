// src/components/Product/EditProductForm.tsx

import React, { useState, useEffect } from 'react';
import {
  Typography,
  TextField,
  Grid,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Box,
  MenuItem,
} from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { AppState } from '../../../store/Store';
import { useNotification } from '../../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Product, ProductPrice } from '../../../types/productTypes';
import { getCompanyData, getProductGroups, getPosScreens } from '../../../services/apiService';

interface EditProductFormProps {
  productData: Product;
  onProductUpdated: () => void;
  onCancel: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({
  productData,
  onProductUpdated,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Product>({
    ...productData,
    productPrices: productData.productPrices || [], // ضمان أن productPrices مصفوفة
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token = useSelector((state: AppState) => state.auth.token);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // البيانات المجلوبة من الـ APIs
  const [branches, setBranches] = useState<any[]>([]);
  const [productGroups, setProductGroups] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState<string>('');
  const [posScreens, setPosScreens] = useState<any[]>([]);

  // التحقق من وجود token
  useEffect(() => {
    if (!token) {
      showNotification('يجب تسجيل الدخول لتعديل المنتج.', 'error', 'غير مصرح');
      navigate('/login');
    }
  }, [token, navigate, showNotification]);

  // جلب البيانات عند تحميل المكون
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        const companyData = await getCompanyData(baseurl, token);
        setBranches(companyData.branches);
        setCompanyId(companyData.companyId);

        const productGroupsData = await getProductGroups(baseurl, token);
        setProductGroups(productGroupsData);

        const posScreensData = await getPosScreens(baseurl, token);
        setPosScreens(posScreensData);
      } catch (error) {
        console.error('Error fetching data:', error);
        showNotification('فشل في جلب البيانات المطلوبة.', 'error', 'خطأ');
      }
    };

    fetchData();
  }, [baseurl, token, showNotification]);

  // حالة التبويبات
  const [tabValue, setTabValue] = useState<number>(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    setFormData({
      ...productData,
      productPrices: productData.productPrices || [], // ضمان أن productPrices مصفوفة
    });
  }, [productData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'discount' || name === 'vat'
          ? parseFloat(value)
          : value,
    }));
  };

  const handleSelectChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value as string,
      }));
    }
  };

  // دالة لتحديث ProductPrice عند معرفة الفهرس الأصلي
  const setProductPriceAtIndex = (fullIndex: number, updatedPrice: ProductPrice) => {
    if (fullIndex === -1) {
      // إضافة عنصر جديد في نهاية المصفوفة الأصلية
      setFormData((prev) => ({
        ...prev,
        productPrices: [...prev.productPrices, updatedPrice],
      }));
    } else {
      const updatedProductPrices = [...formData.productPrices];
      if (updatedProductPrices[fullIndex]) {
        updatedProductPrices[fullIndex] = updatedPrice;
        setFormData((prev) => ({
          ...prev,
          productPrices: updatedProductPrices,
        }));
      }
    }
  };

  const handlePricesChange = (prices: ProductPrice[]) => {
    // تحديث BranchId و CompanyId لكل ProductPrice
    const updatedPrices = prices.map((price) => ({
      ...price,
      branchId: formData.branchId,
      companyId: formData.companyId,
      // إذا كان LineType 3، ترك GroupPriceType كما هو أو تعيينه إلى 1
      groupPriceType: price.lineType === 3 ? price.groupPriceType ?? 1 : 1,
    }));
    setFormData((prev) => ({
      ...prev,
      productPrices: updatedPrices,
    }));
  };

  const handleSubmit = async () => {
    if (!token) {
      showNotification('يجب تسجيل الدخول لإجراء هذه العملية.', 'error', 'غير مصرح');
      navigate('/login');
      return;
    }

    if (
      !formData.productName ||
      !formData.productGroupId ||
      !formData.productPrices ||
      !formData.branchId
    ) {
      showNotification('يرجى ملء جميع الحقول المطلوبة.', 'warning', 'بيانات غير كاملة');
      return;
    }

    // تعيين CompanyId
    formData.companyId = companyId;

    // تحديث ProductPrices
    const updatedProductPrices = formData.productPrices.map((price) => {
      // إذا كان LineType 3، تأكد من أن GroupPriceType هو 1، 2، أو 3
      if (price.lineType === 3) {
        if (![1, 2, 3].includes(price.groupPriceType ?? 1)) {
          showNotification(`GroupPriceType يجب أن تكون 1، 2، أو 3`, 'warning', 'بيانات غير صحيحة');
          throw new Error('Invalid GroupPriceType');
        }
      } else {
        // إذا لم يكن LineType 3، تعيين GroupPriceType إلى 1 تلقائيًا
        price.groupPriceType = 1;
      }

      return {
        ...price,
        branchId: formData.branchId!,
        companyId: formData.companyId!,
      };
    });

    // بناء FormData
    const formPayload = new FormData();
    formPayload.append('productId', formData.productId || '');
    formPayload.append('productName', formData.productName);
    formPayload.append('productName2', formData.productName2 || '');
    formPayload.append('productGroupId', formData.productGroupId);
    formPayload.append('branchId', formData.branchId);
    formPayload.append('posScreenId', formData.posScreenId || '');
    formPayload.append('discount', formData.discount?.toString() || '0');
    formPayload.append('vat', formData.vat?.toString() || '0');
    formPayload.append('companyId', formData.companyId!);
    formPayload.append('status', formData.status.toString());

    // إضافة ProductPrices
    updatedProductPrices.forEach((price, index) => {
      formPayload.append(`productPrices[${index}].productPriceName`, price.productPriceName);
      formPayload.append(`productPrices[${index}].price`, price.price.toString());
      formPayload.append(`productPrices[${index}].groupPriceType`, price.groupPriceType?.toString() || '1');
      formPayload.append(`productPrices[${index}].groupPrice`, price.groupPrice.toString());
      formPayload.append(`productPrices[${index}].qtyToSelect`, price.qtyToSelect.toString());
      formPayload.append(`productPrices[${index}].lineType`, price.lineType.toString());
      formPayload.append(`productPrices[${index}].branchId`, price.branchId);
      formPayload.append(`productPrices[${index}].companyId`, price.companyId);

      // إضافة PriceComments
      price.priceComments.forEach((comment, cIndex) => {
        formPayload.append(`productPrices[${index}].priceComments[${cIndex}].name`, comment.name);
        formPayload.append(`productPrices[${index}].priceComments[${cIndex}].branchId`, comment.branchId);
      });
    });

    // تضمين الصورة إذا كانت موجودة
    if (imageFile) {
      formPayload.append('imageFile', imageFile);
    }

    console.log('FormData Entries:');
    for (let pair of formPayload.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    setLoading(true);
    try {
      await axios.post(`${baseurl}/Product/UpdateProduct`, formPayload, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          // 'Content-Type' سيتم تحديده تلقائيًا بواسطة Axios عند استخدام FormData
        },
      });
      showNotification('تم تحديث المنتج بنجاح!', 'success', 'نجاح');
      onProductUpdated();
    } catch (err) {
      console.error('Error updating product:', err);
      showNotification('فشل في تحديث المنتج.', 'error', 'خطأ');
    } finally {
      setLoading(false);
    }
  };

  // إضافة تحقق من البيانات
  useEffect(() => {
    console.log('Form Data:', formData);
  }, [formData]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        تعديل المنتج
      </Typography>
      <Grid container spacing={2}>
        {/* اسم المنتج */}
        <Grid item xs={12}>
          <TextField
            label="اسم المنتج"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            fullWidth
            required
          />
        </Grid>
        {/* اسم المنتج 2 */}
        <Grid item xs={12}>
          <TextField
            label="اسم المنتج 2"
            name="productName2"
            value={formData.productName2}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        {/* مجموعة المنتج */}
        <Grid item xs={12}>
          <TextField
            select
            label="مجموعة المنتج"
            name="productGroupId"
            value={formData.productGroupId}
            onChange={handleSelectChange}
            fullWidth
            required
          >
            {productGroups.map((group) => (
              <MenuItem key={group.groupId} value={group.groupId}>
                {group.groupName}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        {/* الفرع */}
        <Grid item xs={12}>
          <TextField
            select
            label="الفرع"
            name="branchId"
            value={formData.branchId}
            onChange={handleSelectChange}
            fullWidth
            required
          >
            {branches.map((branch) => (
              <MenuItem key={branch.branchId} value={branch.branchId}>
                {branch.branchName}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        {/* شاشة نقاط البيع (اختياري) */}
        <Grid item xs={12}>
          <TextField
            select
            label="شاشة نقاط البيع"
            name="posScreenId"
            value={formData.posScreenId || ''}
            onChange={handleSelectChange}
            fullWidth
          >
            <MenuItem value="">لا شيء</MenuItem>
            {posScreens.map((screen) => (
              <MenuItem key={screen.screenId} value={screen.screenId}>
                {screen.screenName}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        {/* الخصم */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="الخصم"
            name="discount"
            type="number"
            value={formData.discount ?? ''}
            onChange={handleChange}
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
            onChange={handleChange}
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

        {/* التبويبات */}
        <Grid item xs={12}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab label="إضافة سعر" />
            <Tab label="تعليقات" />
            <Tab label="منتجات المجموعة" />
          </Tabs>
        </Grid>


        {/* أزرار الحفظ والإلغاء */}
        <Grid item xs={12}>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'حفظ التغييرات'}
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button
            onClick={onCancel}
            color="secondary"
            variant="outlined"
            disabled={loading}
            fullWidth
          >
            إلغاء
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EditProductForm;
