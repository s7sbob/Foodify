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
import { Product } from '../../../types/productTypes';
import { v4 as uuidv4 } from 'uuid';

interface AddProductFormProps {
  onProductAdded: () => void;
}

interface PriceEntry {
  id: string;
  productPriceName: string;
  price: number;
}

interface CommentEntry {
  id: string;
  name: string;
  link: string;
}

interface GroupProductEntry {
  id: string;
  quantityToSelect: number;
  groupPriceType: number; // 1: zero, 2: asproduct, 3: manual
  groupPrice?: number;
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

  // State for entries
  const [prices, setPrices] = useState<PriceEntry[]>([]);
  const [comments, setComments] = useState<CommentEntry[]>([]);
  const [groupProducts, setGroupProducts] = useState<GroupProductEntry[]>([]);

  // Handlers to add entries
  const handleAddPrice = () => {
    const newPrice: PriceEntry = {
      id: uuidv4(),
      productPriceName: '',
      price: 0,
    };
    setPrices((prev) => [...prev, newPrice]);
  };

  const handleAddComment = () => {
    const newComment: CommentEntry = {
      id: uuidv4(),
      name: '',
      link: '',
    };
    setComments((prev) => [...prev, newComment]);
  };

  const handleAddGroupProduct = () => {
    const newGroupProduct: GroupProductEntry = {
      id: uuidv4(),
      quantityToSelect: 1,
      groupPriceType: 1, // default to 'zero'
      groupPrice: undefined,
    };
    setGroupProducts((prev) => [...prev, newGroupProduct]);
  };

  // Handlers to remove entries
  const handleRemovePrice = (id: string) => {
    setPrices((prev) => prev.filter((price) => price.id !== id));
  };

  const handleRemoveComment = (id: string) => {
    setComments((prev) => prev.filter((comment) => comment.id !== id));
  };

  const handleRemoveGroupProduct = (id: string) => {
    setGroupProducts((prev) => prev.filter((group) => group.id !== id));
  };

  // Handlers to update entries
  const handlePriceChange = (
    id: string,
    field: keyof PriceEntry,
    value: string | number
  ) => {
    setPrices((prev) =>
      prev.map((price) =>
        price.id === id ? { ...price, [field]: value } : price
      )
    );
  };

  const handleCommentChange = (
    id: string,
    field: keyof CommentEntry,
    value: string
  ) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === id ? { ...comment, [field]: value } : comment
      )
    );
  };

  const handleGroupProductChange = (
    id: string,
    field: keyof GroupProductEntry,
    value: string | number
  ) => {
    setGroupProducts((prev) =>
      prev.map((group) => {
        if (group.id === id) {
          if (field === 'groupPriceType') {
            const groupPriceType = typeof value === 'string' ? parseInt(value) : value;
            return { ...group, groupPriceType, groupPrice: groupPriceType === 3 ? group.groupPrice ?? 0 : undefined };
          }
          return { ...group, [field]: value };
        }
        return group;
      })
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!token) {
      showNotification('يجب تسجيل الدخول لإجراء هذه العملية.', 'error', 'غير مصرح');
      navigate('/login');
      return;
    }

    // Validate required fields
    if (
      !formData.productName ||
      !formData.productGroupId ||
      !formData.branchId
    ) {
      showNotification('يرجى ملء جميع الحقول المطلوبة.', 'warning', 'بيانات غير كاملة');
      return;
    }

    // Validate prices
    for (const price of prices) {
      if (!price.productPriceName || price.price <= 0) {
        showNotification('يرجى ملء جميع حقول أسعار المنتجات بشكل صحيح.', 'warning', 'بيانات غير كاملة');
        return;
      }
    }

    // Validate comments
    for (const comment of comments) {
      if (!comment.name || !comment.link) {
        showNotification('يرجى ملء جميع حقول التعليقات بشكل صحيح.', 'warning', 'بيانات غير كاملة');
        return;
      }
    }

    // Validate group products
    for (const group of groupProducts) {
      if (!group.quantityToSelect || group.quantityToSelect <= 0) {
        showNotification('يرجى ملء كمية الاختيار بشكل صحيح.', 'warning', 'بيانات غير كاملة');
        return;
      }
      if (![1, 2, 3].includes(group.groupPriceType)) {
        showNotification('نوع سعر المجموعة غير صحيح.', 'warning', 'بيانات غير صحيحة');
        return;
      }
      if (group.groupPriceType === 3 && (!group.groupPrice || group.groupPrice <= 0)) {
        showNotification('يرجى إدخال سعر المجموعة بشكل صحيح.', 'warning', 'بيانات غير كاملة');
        return;
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

      // Add prices with branchId and companyId
      prices.forEach((price, index) => {
        formPayload.append(`productPrices[${index}].productPriceName`, price.productPriceName);
        formPayload.append(`productPrices[${index}].price`, price.price.toString());
        formPayload.append(`productPrices[${index}].branchId`, formData.branchId);
        formPayload.append(`productPrices[${index}].companyId`, formData.companyId!);
      });

      // Add comments
      comments.forEach((comment, index) => {
        formPayload.append(`comments[${index}].name`, comment.name);
        formPayload.append(`comments[${index}].link`, comment.link);
      });

      // Add group products
      groupProducts.forEach((group, index) => {
        formPayload.append(`groupProducts[${index}].quantityToSelect`, group.quantityToSelect.toString());
        formPayload.append(`groupProducts[${index}].groupPriceType`, group.groupPriceType.toString());
        if (group.groupPriceType === 3 && group.groupPrice !== undefined) {
          formPayload.append(`groupProducts[${index}].groupPrice`, group.groupPrice.toString());
        }
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
      setPrices([]);
      setComments([]);
      setGroupProducts([]);
      setImageFile(null);
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

        {/* أزرار إضافة الإدخالات */}
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
            onClick={handleAddComment}
            fullWidth
          >
            إضافة تعليق
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            variant="outlined"
            color="success"
            onClick={handleAddGroupProduct}
            fullWidth
          >
            إضافة منتجات المجموعة
          </Button>
        </Grid>

        {/* عرض أسعار المنتجات */}
        {prices.map((price) => (
          <Paper
            key={price.id}
            variant="outlined"
            sx={{ padding: 2, mt: 2, width: '100%', position: 'relative' }}
          >
            <IconButton
              aria-label="delete"
              onClick={() => handleRemovePrice(price.id)}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <DeleteIcon />
            </IconButton>
            <Typography variant="subtitle1" gutterBottom>
              سعر
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="اسم السعر"
                  name="productPriceName"
                  value={price.productPriceName}
                  onChange={(e) =>
                    handlePriceChange(price.id, 'productPriceName', e.target.value)
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
                    handlePriceChange(price.id, 'price', parseFloat(e.target.value))
                  }
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
          </Paper>
        ))}

        {/* عرض التعليقات */}
        {comments.map((comment) => (
          <Paper
            key={comment.id}
            variant="outlined"
            sx={{ padding: 2, mt: 2, width: '100%', position: 'relative' }}
          >
            <IconButton
              aria-label="delete"
              onClick={() => handleRemoveComment(comment.id)}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <DeleteIcon />
            </IconButton>
            <Typography variant="subtitle1" gutterBottom>
              تعليق
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="اسم التعليق"
                  name="name"
                  value={comment.name}
                  onChange={(e) =>
                    handleCommentChange(comment.id, 'name', e.target.value)
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="الوصل"
                  name="link"
                  value={comment.link}
                  onChange={(e) =>
                    handleCommentChange(comment.id, 'link', e.target.value)
                  }
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
          </Paper>
        ))}

        {/* عرض منتجات المجموعة */}
        {groupProducts.map((group) => (
          <Paper
            key={group.id}
            variant="outlined"
            sx={{ padding: 2, mt: 2, width: '100%', position: 'relative' }}
          >
            <IconButton
              aria-label="delete"
              onClick={() => handleRemoveGroupProduct(group.id)}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <DeleteIcon />
            </IconButton>
            <Typography variant="subtitle1" gutterBottom>
              منتجات المجموعة
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="كمية الاختيار"
                  name="quantityToSelect"
                  type="number"
                  value={group.quantityToSelect}
                  onChange={(e) =>
                    handleGroupProductChange(
                      group.id,
                      'quantityToSelect',
                      e.target.value ? parseInt(e.target.value) : 1
                    )
                  }
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="نوع سعر المجموعة"
                  name="groupPriceType"
                  value={group.groupPriceType}
                  onChange={(e) =>
                    handleGroupProductChange(
                      group.id,
                      'groupPriceType',
                      e.target.value
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
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="سعر المجموعة"
                    name="groupPrice"
                    type="number"
                    value={group.groupPrice || ''}
                    onChange={(e) =>
                      handleGroupProductChange(
                        group.id,
                        'groupPrice',
                        e.target.value ? parseFloat(e.target.value) : 0
                      )
                    }
                    fullWidth
                    required
                  />
                </Grid>
              )}
            </Grid>
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
