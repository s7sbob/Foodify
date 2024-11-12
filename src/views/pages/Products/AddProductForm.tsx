// src/components/Product/AddProductForm.tsx

import React, { useState, useEffect } from 'react';
import {
  Typography,
  TextField,
  Grid,
  Button,
  CircularProgress,
  Box,
  MenuItem,
  IconButton,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSelector } from 'react-redux';
import { AppState } from '../../../store/Store';
import { useNotification } from '../../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Product, ProductPrice, PriceComment } from '../../../types/productTypes';
import { v4 as uuidv4 } from 'uuid';

interface AddProductFormProps {
  onProductAdded: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onProductAdded }) => {
  const [formData, setFormData] = useState<Product>({
    productName: '',
    productGroupId: '',
    productPrices: [],
    branchId: '',
    companyId: '',
    status: true,
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
        const companyResponse = await axios.get(`${baseurl}/Company/GetCompanyData`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const companyData = companyResponse.data;
        setBranches(companyData.branches);
        setFormData((prev) => ({
          ...prev,
          companyId: companyData.companyId,
        }));

        // Fetch product groups
        const groupsResponse = await axios.get(`${baseurl}/ProductGroups/GetAll`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProductGroups(groupsResponse.data);

        // Fetch pos screens
        const screensResponse = await axios.get(`${baseurl}/PosScreen/GetPosScreens`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosScreens(screensResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        showNotification('فشل في جلب البيانات المطلوبة.', 'error', 'خطأ');
      }
    };

    fetchData();
  }, [baseurl, token, showNotification]);

  // Handlers to add product price
  const handleAddPrice = () => {
    const newPrice: ProductPrice = {
      productPriceId: undefined, // بدلاً من null
      productPriceName: '',
      lineType: 0,
      price: 0,
      groupPriceType: undefined, // سيتم تحديده لاحقًا
      groupPrice: 0,
      qtyToSelect: 1,
      priceComments: [],
      branchId: formData.branchId,
      companyId: formData.companyId!,
      priceGroups: [],
      status: true,
      errors: [],
    };
    setFormData((prev) => ({
      ...prev,
      productPrices: [...prev.productPrices, newPrice],
    }));
  };

  // Handlers to remove product price
  const handleRemovePrice = (priceIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      productPrices: prev.productPrices.filter((_, i) => i !== priceIndex),
    }));
  };

  // Handlers to update product price fields
  const handlePriceChange = (
    priceIndex: number,
    field: keyof ProductPrice,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      productPrices: prev.productPrices.map((price, i) =>
        i === priceIndex ? { ...price, [field]: value } : price
      ),
    }));
  };

  // Handlers to add comments to a product price
  const handleAddComment = (priceIndex: number) => {
    const newComment: PriceComment = {
      commentId: uuidv4(),
      name: '',
      link: '',
      branchId: formData.branchId,
      companyId: formData.companyId!,
      status: true,
      errors: [],
    };
    setFormData((prev) => ({
      ...prev,
      productPrices: prev.productPrices.map((price, i) =>
        i === priceIndex
          ? { ...price, priceComments: [...price.priceComments, newComment] }
          : price
      ),
    }));
  };

  // Handlers to remove comment from a product price
  const handleRemoveComment = (priceIndex: number, commentIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      productPrices: prev.productPrices.map((price, i) =>
        i === priceIndex
          ? {
              ...price,
              priceComments: price.priceComments.filter((_, j) => j !== commentIndex),
            }
          : price
      ),
    }));
  };

  // Handlers to update comment fields
  const handleCommentChange = (
    priceIndex: number,
    commentIndex: number,
    field: keyof PriceComment,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      productPrices: prev.productPrices.map((price, i) =>
        i === priceIndex
          ? {
              ...price,
              priceComments: price.priceComments.map((comment, j) =>
                j === commentIndex ? { ...comment, [field]: value } : comment
              ),
            }
          : price
      ),
    }));
  };

  // Handlers to add group products
  const handleAddGroupProduct = (priceIndex: number) => {
    const newGroupProduct = {
      groupProductId: uuidv4(),
      quantityToSelect: 1,
      groupPriceType: 1, // default to 'zero'
      groupPrice: 0,
    };
    setFormData((prev) => ({
      ...prev,
      productPrices: prev.productPrices.map((price, i) =>
        i === priceIndex
          ? { ...price, priceGroups: [...price.priceGroups, newGroupProduct] }
          : price
      ),
    }));
  };

  // Handlers to remove group product from a product price
  const handleRemoveGroupProduct = (priceIndex: number, groupIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      productPrices: prev.productPrices.map((price, i) =>
        i === priceIndex
          ? {
              ...price,
              priceGroups: price.priceGroups.filter((_, j) => j !== groupIndex),
            }
          : price
      ),
    }));
  };

  // Handlers to update group product fields
  const handleGroupProductChange = (
    priceIndex: number,
    groupIndex: number,
    field: string, // Since priceGroups is any[], we use string
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      productPrices: prev.productPrices.map((price, i) =>
        i === priceIndex
          ? {
              ...price,
              priceGroups: price.priceGroups.map((group, j) =>
                j === groupIndex ? { ...group, [field]: value } : group
              ),
            }
          : price
      ),
    }));
  };

  // حالات للتحكم في عرض أزرار "إضافة تعليق" و"إضافة منتجات المجموعة" داخل كل سعر
  const [showAddCommentButtons, setShowAddCommentButtons] = useState<boolean>(false);
  const [showAddGroupProductButtons, setShowAddGroupProductButtons] = useState<boolean>(false);

  // Handle global Add Comment button
  const handleGlobalAddComment = () => {
    if (formData.productPrices.length === 0) {
      showNotification('يرجى إضافة سعر أولاً.', 'warning', 'لا توجد أسعار');
      return;
    }
    setShowAddCommentButtons(true);
  };

  // Handle global Add Group Products button
  const handleGlobalAddGroupProduct = () => {
    if (formData.productPrices.length === 0) {
      showNotification('يرجى إضافة سعر أولاً.', 'warning', 'لا توجد أسعار');
      return;
    }
    setShowAddGroupProductButtons(true);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!token) {
      showNotification('يجب تسجيل الدخول لإجراء هذه العملية.', 'error', 'غير مصرح');
      navigate('/login');
      return;
    }

    // Validate required fields
    if (!formData.productName || !formData.productGroupId || !formData.branchId) {
      showNotification('يرجى ملء جميع الحقول المطلوبة.', 'warning', 'بيانات غير مكتملة');
      return;
    }

    // Validate product prices and comments
    for (const price of formData.productPrices) {
      if (!price.productPriceName || price.price <= 0) {
        showNotification('يرجى ملء جميع حقول أسعار المنتجات بشكل صحيح.', 'warning', 'بيانات غير مكتملة');
        return;
      }

      // Validate comments
      for (const comment of price.priceComments) {
        if (!comment.name || !comment.link) {
          showNotification('يرجى ملء جميع حقول التعليقات بشكل صحيح.', 'warning', 'بيانات غير مكتملة');
          return;
        }
      }

      // Validate group products
      for (const group of price.priceGroups) {
        if (!group.groupPriceType || !group.groupProductId) {
          showNotification('يرجى ملء جميع حقول منتجات المجموعة بشكل صحيح.', 'warning', 'بيانات غير مكتملة');
          return;
        }
        if (group.groupPriceType === 3 && (!group.groupPrice || group.groupPrice <= 0)) {
          showNotification('يرجى إدخال سعر المجموعة بشكل صحيح.', 'warning', 'بيانات غير مكتملة');
          return;
        }
      }
    }

    setLoading(true);
    try {
      // Build FormData
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

      // Add product prices
      formData.productPrices.forEach((price, priceIndex) => {
        formPayload.append(`productPrices[${priceIndex}].productPriceName`, price.productPriceName);
        formPayload.append(`productPrices[${priceIndex}].price`, price.price.toString());
        formPayload.append(`productPrices[${priceIndex}].branchId`, price.branchId);
        formPayload.append(`productPrices[${priceIndex}].companyId`, price.companyId);
        if (price.groupPriceType !== undefined) {
          formPayload.append(`productPrices[${priceIndex}].groupPriceType`, price.groupPriceType.toString());
        }
        formPayload.append(`productPrices[${priceIndex}].groupPrice`, price.groupPrice.toString());
        formPayload.append(`productPrices[${priceIndex}].qtyToSelect`, price.qtyToSelect.toString());
        formPayload.append(`productPrices[${priceIndex}].status`, price.status.toString());

        // Add price comments
        price.priceComments.forEach((comment, commentIndex) => {
          formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].name`, comment.name);
          formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].link`, comment.link);
          formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].branchId`, comment.branchId);
          formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].companyId`, comment.companyId);
          formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].status`, comment.status.toString());
        });

        // Add price groups
        price.priceGroups.forEach((group, groupIndex) => {
          formPayload.append(`productPrices[${priceIndex}].priceGroups[${groupIndex}].groupProductId`, group.groupProductId);
          formPayload.append(`productPrices[${priceIndex}].priceGroups[${groupIndex}].quantityToSelect`, group.quantityToSelect.toString());
          formPayload.append(`productPrices[${priceIndex}].priceGroups[${groupIndex}].groupPriceType`, group.groupPriceType.toString());
          formPayload.append(`productPrices[${priceIndex}].priceGroups[${groupIndex}].groupPrice`, group.groupPrice.toString());
        });
      });

      // Add image if exists
      if (imageFile) {
        formPayload.append('imageFile', imageFile);
      }

      console.log('FormData Entries:');
      for (let pair of formPayload.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      // Send POST request
      await axios.post(`${baseurl}/Product/CreateProduct`, formPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          // 'Content-Type' is set automatically by Axios for FormData
        },
      });

      showNotification('تم إضافة المنتج بنجاح!', 'success', 'نجاح');
      onProductAdded();

      // Reset form
      setFormData({
        productName: '',
        productGroupId: '',
        productPrices: [],
        branchId: '',
        companyId: formData.companyId, // Retain companyId
        posScreenId: '',
        status: true,
      });
      setImageFile(null);
      setShowAddCommentButtons(false);
      setShowAddGroupProductButtons(false);
    } catch (err) {
      console.error('Error adding product:', err);
      showNotification('فشل في إضافة المنتج.', 'error', 'خطأ');
    } finally {
      setLoading(false);
    }
  };

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
            onChange={(e) =>
              setFormData({ ...formData, productName: e.target.value })
            }
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
            onChange={(e) =>
              setFormData({ ...formData, productName2: e.target.value })
            }
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
            onChange={(e) =>
              setFormData({ ...formData, productGroupId: e.target.value })
            }
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
            onChange={(e) =>
              setFormData({ ...formData, branchId: e.target.value })
            }
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
            onChange={(e) =>
              setFormData({ ...formData, posScreenId: e.target.value })
            }
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
            onChange={(e) =>
              setFormData({
                ...formData,
                discount: e.target.value ? parseFloat(e.target.value) : undefined,
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
                vat: e.target.value ? parseFloat(e.target.value) : undefined,
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

        {/* الأزرار الرئيسية */}
        <Grid item xs={12} sm={4}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleAddPrice}
            fullWidth
          >
            إضافة سعر
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleGlobalAddComment}
            fullWidth
          >
            إضافة مجموعة من التعليقات
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            variant="outlined"
            color="success"
            onClick={handleGlobalAddGroupProduct}
            fullWidth
          >
            إضافة منتجات المجموعة
          </Button>
        </Grid>

        {/* عرض أسعار المنتجات */}
        {formData.productPrices.map((price, priceIndex) => (
          <Paper
            key={priceIndex}
            variant="outlined"
            sx={{ padding: 2, mt: 2, width: '100%', position: 'relative' }}
          >
            {/* زر حذف السعر */}
            <IconButton
              aria-label="delete-price"
              onClick={() => handleRemovePrice(priceIndex)}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <DeleteIcon />
            </IconButton>
            <Typography variant="subtitle1" gutterBottom>
              سعر {priceIndex + 1}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="اسم السعر"
                  name="productPriceName"
                  value={price.productPriceName}
                  onChange={(e) =>
                    handlePriceChange(priceIndex, 'productPriceName', e.target.value)
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="السعر"
                  name="price"
                  type="number"
                  value={price.price}
                  onChange={(e) =>
                    handlePriceChange(priceIndex, 'price', parseFloat(e.target.value))
                  }
                  fullWidth
                  required
                />
              </Grid>
            </Grid>

            {/* أزرار إضافة تعليق و منتجات المجموعة داخل كل سعر */}
            {(showAddCommentButtons || showAddGroupProductButtons) && (
              <Box mt={2} display="flex" gap={2}>
                {showAddCommentButtons && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleAddComment(priceIndex)}
                  >
                    إضافة تعليق
                  </Button>
                )}
                {showAddGroupProductButtons && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleAddGroupProduct(priceIndex)}
                  >
                    إضافة منتجات المجموعة
                  </Button>
                )}
              </Box>
            )}

            {/* عرض التعليقات */}
            {price.priceComments.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle2">التعليقات</Typography>
                {price.priceComments.map((comment, commentIndex) => (
                  <Paper
                    key={comment.commentId || commentIndex}
                    variant="outlined"
                    sx={{ padding: 2, mt: 1, backgroundColor: '#f1f1f1' }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={5}>
                        <TextField
                          label="اسم التعليق"
                          name="name"
                          value={comment.name}
                          onChange={(e) =>
                            handleCommentChange(
                              priceIndex,
                              commentIndex,
                              'name',
                              e.target.value
                            )
                          }
                          fullWidth
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          label="الوصل"
                          name="link"
                          value={comment.link}
                          onChange={(e) =>
                            handleCommentChange(
                              priceIndex,
                              commentIndex,
                              'link',
                              e.target.value
                            )
                          }
                          fullWidth
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <IconButton
                          aria-label="delete-comment"
                          onClick={() => handleRemoveComment(priceIndex, commentIndex)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Box>
            )}

            {/* عرض منتجات المجموعة */}
            {price.priceGroups.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle2">منتجات المجموعة</Typography>
                {price.priceGroups.map((group: any, groupIndex: number) => (
                  <Paper
                    key={group.groupProductId || groupIndex}
                    variant="outlined"
                    sx={{ padding: 2, mt: 1, backgroundColor: '#e8f5e9' }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={3}>
                        <TextField
                          label="كمية الاختيار"
                          name="quantityToSelect"
                          type="number"
                          value={group.quantityToSelect}
                          onChange={(e) =>
                            handleGroupProductChange(
                              priceIndex,
                              groupIndex,
                              'quantityToSelect',
                              e.target.value ? parseInt(e.target.value) : 1
                            )
                          }
                          fullWidth
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          select
                          label="نوع سعر المجموعة"
                          name="groupPriceType"
                          value={group.groupPriceType}
                          onChange={(e) =>
                            handleGroupProductChange(
                              priceIndex,
                              groupIndex,
                              'groupPriceType',
                              parseInt(e.target.value)
                            )
                          }
                          fullWidth
                          required
                        >
                          <MenuItem value={1}>zero</MenuItem>
                          <MenuItem value={2}>asproduct</MenuItem>
                          <MenuItem value={3}>manual</MenuItem>
                        </TextField>
                      </Grid>
                      {/* عرض سعر المجموعة فقط إذا كان نوع السعر 'manual' */}
                      {group.groupPriceType === 3 && (
                        <Grid item xs={12} sm={3}>
                          <TextField
                            label="سعر المجموعة"
                            name="groupPrice"
                            type="number"
                            value={group.groupPrice}
                            onChange={(e) =>
                              handleGroupProductChange(
                                priceIndex,
                                groupIndex,
                                'groupPrice',
                                e.target.value ? parseFloat(e.target.value) : 0
                              )
                            }
                            fullWidth
                            required
                          />
                        </Grid>
                      )}
                      <Grid
                        item
                        xs={12}
                        sm={group.groupPriceType === 3 ? 3 : 6}
                      >
                        <IconButton
                          aria-label="delete-group-product"
                          onClick={() => handleRemoveGroupProduct(priceIndex, groupIndex)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>
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
