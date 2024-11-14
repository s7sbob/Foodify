import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography,
  TextField,
  Grid,
  Button,
  CircularProgress,
  Box,
  IconButton,
  Divider,
  Paper,
  Autocomplete,
  MenuItem, // Import Autocomplete
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useSelector } from 'react-redux';
import { AppState } from '../../../store/Store';
import { useNotification } from '../../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Product, ProductPrice, PriceComment } from '../../../types/productTypes';
import { v4 as uuidv4 } from 'uuid';
import {
  getCompanyData,
  getProductGroups,
  getPosScreens,
  createProduct,
} from '../../../services/apiService';
import StyledAccordion from './StyledAccordion'; // Import the styled Accordion

interface AddProductFormProps {
  onProductAdded: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onProductAdded }) => {
  const [formData, setFormData] = useState<Product>({
    productId: '',
    productName: '',
    productGroupId: '',
    productPrices: [],
    branchId: '',
    companyId: '',
    status: true,
    posScreenId: '',
    discount: 0,
    vat: 0,
    productName2: '',
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

  // Handlers to add different types of entries
  const handleAddEntry = (lineType: number) => {
    let newEntry: ProductPrice = {
      productPriceId: uuidv4(),
      lineType,
      branchId: formData.branchId,
      companyId: formData.companyId!,
      status: true,
    };

    switch (lineType) {
      case 1: // price
        newEntry.productPriceName = '';
        newEntry.price = 0.0;
        break;
      case 2: // commentGroup
        newEntry.priceComments = [];
        break;
      case 3: // groupProduct
        newEntry.qtyToSelect = 1.0;
        newEntry.groupPriceType = 1;
        newEntry.groupPrice = 0.0;
        newEntry.priceGroups = [];
        break;
      default:
        break;
    }

    setFormData((prev) => ({
      ...prev,
      productPrices: [...prev.productPrices, newEntry],
    }));
  };

  // Handlers to remove an entry
  const handleRemoveEntry = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      productPrices: prev.productPrices.filter((_, i) => i !== index),
    }));
  };

  // Handlers to update entry fields based on lineType
  const handleEntryChange = (
    index: number,
    field: keyof ProductPrice,
    value: any
  ) => {
    const updatedPrices = [...formData.productPrices];
    updatedPrices[index] = {
      ...updatedPrices[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      productPrices: updatedPrices,
    }));
  };

  // Handlers for comments within commentGroup
  const handleAddComment = (priceIndex: number) => {
    const newComment: PriceComment = {
      commentId: uuidv4(),
      name: '',
      description: '',
      productPriceId: formData.productPrices[priceIndex].productPriceId,
      branchId: formData.branchId,
      companyId: formData.companyId!,
      status: true,
      errors: [],
    };
    const updatedPrices = [...formData.productPrices];
    updatedPrices[priceIndex].priceComments = [
      ...(updatedPrices[priceIndex].priceComments || []),
      newComment,
    ];
    setFormData((prev) => ({
      ...prev,
      productPrices: updatedPrices,
    }));
  };

  const handleRemoveComment = (priceIndex: number, commentIndex: number) => {
    const updatedPrices = [...formData.productPrices];
    updatedPrices[priceIndex].priceComments = updatedPrices[priceIndex].priceComments?.filter(
      (_, i) => i !== commentIndex
    );
    setFormData((prev) => ({
      ...prev,
      productPrices: updatedPrices,
    }));
  };

  const handleCommentChange = (
    priceIndex: number,
    commentIndex: number,
    field: keyof PriceComment,
    value: string
  ) => {
    const updatedPrices = [...formData.productPrices];
    const updatedComments = updatedPrices[priceIndex].priceComments?.map((comment, i) =>
      i === commentIndex ? { ...comment, [field]: value } : comment
    );
    updatedPrices[priceIndex].priceComments = updatedComments;
    setFormData((prev) => ({
      ...prev,
      productPrices: updatedPrices,
    }));
  };

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
    for (const [index, entry] of formData.productPrices.entries()) {
      if (entry.lineType === 1) { // price
        if (!entry.productPriceName || entry.price === undefined || entry.price <= 0) {
          showNotification(`يرجى ملء جميع حقول سعر المنتج في الإدخال رقم ${index + 1}.`, 'warning', 'بيانات غير مكتملة');
          return;
        }
      } else if (entry.lineType === 2) { // commentGroup
        // التحقق من كل تعليق داخل مجموعة التعليقات
        if (entry.priceComments) {
          for (const [cIndex, comment] of entry.priceComments.entries()) {
            if (!comment.name || !comment.description) {
              showNotification(`يرجى ملء جميع حقول التعليقات في الإدخال رقم ${index + 1}, التعليق رقم ${cIndex + 1}.`, 'warning', 'بيانات غير مكتملة');
              return;
            }
          }
        }
      } else if (entry.lineType === 3) { // groupProduct
        if (entry.qtyToSelect === undefined || entry.qtyToSelect <= 0 || !entry.groupPriceType) {
          showNotification(`يرجى ملء جميع حقول منتجات المجموعة في الإدخال رقم ${index + 1}.`, 'warning', 'بيانات غير مكتملة');
          return;
        }
        if (entry.groupPriceType === 3 && (entry.groupPrice === undefined || entry.groupPrice <= 0)) {
          showNotification(`يرجى إدخال سعر المجموعة بشكل صحيح في الإدخال رقم ${index + 1}.`, 'warning', 'بيانات غير مكتملة');
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
      formData.productPrices.forEach((entry, priceIndex) => {
        formPayload.append(`productPrices[${priceIndex}].lineType`, entry.lineType.toString());
        if (entry.lineType === 1) { // price
          formPayload.append(`productPrices[${priceIndex}].productPriceName`, entry.productPriceName!);
          formPayload.append(`productPrices[${priceIndex}].price`, entry.price!.toString());
        } else if (entry.lineType === 2) { // commentGroup
          // إضافة التعليقات
          if (entry.priceComments) {
            entry.priceComments.forEach((comment, commentIndex) => {
              formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].name`, comment.name);
              formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].description`, comment.description || '');
              formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].productPriceId`, comment.productPriceId);
              formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].branchId`, comment.branchId);
              formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].companyId`, comment.companyId);
              formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].status`, comment.status.toString());
            });
          }
        } else if (entry.lineType === 3) { // groupProduct
          formPayload.append(`productPrices[${priceIndex}].qtyToSelect`, entry.qtyToSelect!.toString());
          formPayload.append(`productPrices[${priceIndex}].groupPriceType`, entry.groupPriceType!.toString());
          formPayload.append(`productPrices[${priceIndex}].groupPrice`, entry.groupPrice!.toString());
        }

        formPayload.append(`productPrices[${priceIndex}].branchId`, entry.branchId);
        formPayload.append(`productPrices[${priceIndex}].companyId`, entry.companyId);
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
      setFormData({
        productId: '',
        productName: '',
        productGroupId: '',
        productPrices: [],
        branchId: '',
        companyId: formData.companyId, // الاحتفاظ بـ companyId
        posScreenId: '',
        discount: 0,
        vat: 0,
        productName2: '',
        status: true,
      });
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

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        إضافة منتج جديد
      </Typography>
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
              <TextField
                {...params}
                label="مجموعة المنتج"
                required
                fullWidth
              />
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
            renderInput={(params) => (
              <TextField
                {...params}
                label="الفرع"
                required
                fullWidth
              />
            )}
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
              <TextField
                {...params}
                label="شاشة نقاط البيع"
                fullWidth
              />
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

        {/* الأزرار الرئيسية لإضافة الإدخالات المختلفة */}
        <Grid item xs={12} sm={4}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleAddEntry(1)} // lineType 1: price
            fullWidth
          >
            إضافة سعر
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => handleAddEntry(2)} // lineType 2: commentGroup
            fullWidth
          >
            إضافة مجموعة تعليقات
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            variant="outlined"
            color="success"
            onClick={() => handleAddEntry(3)} // lineType 3: groupProduct
            fullWidth
          >
            إضافة منتجات المجموعة
          </Button>
        </Grid>

        {/* عرض الإدخالات المختلفة */}
        {formData.productPrices.map((entry, index) => (
          <React.Fragment key={entry.productPriceId}>
            {entry.lineType === 1 ? (
              // Fixed form for lineType 1 (Price)
              <Paper variant="outlined" sx={{ padding: 2, marginTop: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  {/* اسم السعر */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={`اسم السعر ${index + 1}`}
                      name="productPriceName"
                      value={entry.productPriceName || ''}
                      onChange={(e) => handleEntryChange(index, 'productPriceName', e.target.value)}
                      fullWidth
                      required
                    />
                  </Grid>
                  {/* السعر */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label={`السعر ${index + 1}`}
                      name="price"
                      type="number"
                      value={entry.price ?? ''}
                      onChange={(e) =>
                        handleEntryChange(index, 'price', e.target.value ? parseFloat(e.target.value) : 0)
                      }
                      fullWidth
                      required
                    />
                  </Grid>
                  {/* زر حذف الإدخال */}
                  <Grid item xs={12} sm={2}>
                    <IconButton
                      aria-label="delete-entry"
                      onClick={() => handleRemoveEntry(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            ) : (
              // StyledAccordion for other lineTypes
              <>
                <StyledAccordion
                  title={
                    entry.lineType === 2
                      ? `مجموعة تعليقات ${index + 1}`
                      : `منتجات المجموعة ${index + 1}`
                  }
                >
                  <Grid container spacing={2}>
                    {/* حقل بناءً على lineType */}
                    {entry.lineType === 2 && (
                      <>
                        {/* زر إضافة تعليق */}
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => handleAddComment(index)}
                            fullWidth
                          >
                            إضافة تعليق
                          </Button>
                        </Grid>
                        {/* عرض التعليقات */}
                        {entry.priceComments &&
                          entry.priceComments.map((comment, cIndex) => (
                            <Grid item xs={12} key={comment.commentId}>
                              <Paper variant="outlined" sx={{ padding: 2, position: 'relative' }}>
                                <IconButton
                                  aria-label="delete-comment"
                                  onClick={() => handleRemoveComment(index, cIndex)}
                                  color="error"
                                  size="small"
                                  sx={{ position: 'absolute', top: 8, right: 8 }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                                <Typography variant="subtitle1" color="textSecondary">
                                  تعليق {cIndex + 1}
                                </Typography>
                                <TextField
                                  label="اسم التعليق *"
                                  name={`name-${cIndex}`}
                                  value={comment.name}
                                  onChange={(e) => handleCommentChange(index, cIndex, 'name', e.target.value)}
                                  fullWidth
                                  required
                                  variant="outlined"
                                  size="small"
                                  sx={{ mt: 1 }}
                                />
                                <TextField
                                  label="الوصف *"
                                  name={`description-${cIndex}`}
                                  value={comment.description || ''}
                                  onChange={(e) => handleCommentChange(index, cIndex, 'description', e.target.value)}
                                  fullWidth
                                  required
                                  variant="outlined"
                                  size="small"
                                  sx={{ mt: 2 }}
                                />
                              </Paper>
                            </Grid>
                          ))}
                      </>
                    )}

                    {entry.lineType === 3 && (
                      <>
                        {/* كمية الاختيار */}
                        <Grid item xs={12} sm={4}>
                          <TextField
                            label="كمية الاختيار"
                            name="qtyToSelect"
                            type="number"
                            value={entry.qtyToSelect || ''}
                            onChange={(e) =>
                              handleEntryChange(index, 'qtyToSelect', e.target.value ? parseFloat(e.target.value) : 0)
                            }
                            fullWidth
                            required
                          />
                        </Grid>
                        {/* نوع سعر المجموعة */}
                        <Grid item xs={12} sm={4}>
                          <TextField
                            select
                            label="نوع سعر المجموعة"
                            name="groupPriceType"
                            value={entry.groupPriceType || ''}
                            onChange={(e) =>
                              handleEntryChange(index, 'groupPriceType', e.target.value ? parseInt(e.target.value as string) : 1)
                            }
                            fullWidth
                            required
                          >
                            <MenuItem value={1}>zero</MenuItem>
                            <MenuItem value={2}>asproduct</MenuItem>
                            <MenuItem value={3}>manual</MenuItem>
                          </TextField>
                        </Grid>
                        {/* سعر المجموعة فقط إذا كان النوع 'manual' */}
                        {entry.groupPriceType === 3 && (
                          <Grid item xs={12} sm={4}>
                            <TextField
                              label="سعر المجموعة"
                              name="groupPrice"
                              type="number"
                              value={entry.groupPrice || ''}
                              onChange={(e) =>
                                handleEntryChange(index, 'groupPrice', e.target.value ? parseFloat(e.target.value) : 0)
                              }
                              fullWidth
                              required
                            />
                          </Grid>
                        )}
                      </>
                    )}

                    {/* زر حذف الإدخال */}
                    <Grid item xs={12}>
                      <IconButton
                        aria-label="delete-entry"
                        onClick={() => handleRemoveEntry(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </StyledAccordion>
                <Divider />
              </>
            )}
          </React.Fragment>
        ))}

        {/* زر إضافة المنتج */}
        <Grid item xs={12}>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : 'إضافة المنتج'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddProductForm;
