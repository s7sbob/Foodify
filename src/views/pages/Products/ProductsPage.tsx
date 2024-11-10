// src/pages/ProductsPage.tsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Paper,
} from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { AppState } from '../../../store/Store';
import { Product } from '../../../types/productTypes';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddProductForm from './AddProductForm';
import EditProductForm from './EditProductForm';
import { useNotification } from '../../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { getProductGroups, getPosScreens } from '../../../services/apiService';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { showNotification } = useNotification();

  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token = useSelector((state: AppState) => state.auth.token);

  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const navigate = useNavigate();

  // بيانات مجموعات المنتجات وشاشات نقاط البيع
  const [allProductGroups, setAllProductGroups] = useState<any[]>([]);
  const [allPosScreens, setAllPosScreens] = useState<any[]>([]);

  const fetchAdditionalData = async () => {
    if (!token) return;
    try {
      const groups = await getProductGroups(baseurl, token);
      setAllProductGroups(groups);

      const screens = await getPosScreens(baseurl, token);
      setAllPosScreens(screens);
    } catch (error) {
      console.error('Error fetching additional data:', error);
      showNotification('فشل في جلب البيانات الإضافية.', 'error', 'خطأ');
    }
  };

  const fetchProducts = async () => {
    if (!token) {
      showNotification('يجب تسجيل الدخول لعرض المنتجات.', 'error', 'غير مصرح');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get<Product[]>(`${baseurl}/Product/GetProducts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('فشل في جلب المنتجات.');
      showNotification('فشل في جلب المنتجات.', 'error', 'خطأ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchAdditionalData();
  }, [token]);

  // التعامل مع تعديل المنتج
  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
  };

  // التعامل مع حذف المنتج
  const handleDeleteProduct = async (productId?: string) => {
    if (!token) {
      showNotification('يجب تسجيل الدخول لإجراء هذه العملية.', 'error', 'غير مصرح');
      navigate('/login');
      return;
    }

    if (!productId) {
      showNotification('معرف المنتج غير موجود.', 'error', 'خطأ');
      return;
    }

    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا المنتج؟')) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${baseurl}/Product/DeleteProduct/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showNotification('تم حذف المنتج بنجاح!', 'success', 'نجاح');
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      showNotification('فشل في حذف المنتج.', 'error', 'خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        المنتجات
      </Typography>

      <Grid container spacing={2}>
        {/* الجزء الأيسر: نموذج إضافة المنتج الجديد */}
        <Grid item xs={12} md={4}>
          {productToEdit ? (
            <EditProductForm
              productData={productToEdit}
              onProductUpdated={() => {
                fetchProducts();
                setProductToEdit(null);
              }}
              onCancel={() => setProductToEdit(null)}
            />
          ) : (
            <AddProductForm onProductAdded={fetchProducts} />
          )}
        </Grid>

        {/* الجزء الأيمن: جدول المنتجات */}
        <Grid item xs={12} md={8}>
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>اسم المنتج</TableCell>
                    <TableCell>السعر</TableCell>
                    <TableCell>الخصم</TableCell>
                    <TableCell>ضريبة القيمة المضافة</TableCell>
                    <TableCell>شاشة نقاط البيع</TableCell>
                    <TableCell>مجموعة المنتج</TableCell>
                    <TableCell>نوع سعر المجموعة</TableCell>
                    <TableCell>الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    product.productId ? ( // Ensure productId is defined
                      <TableRow key={product.productId}>
                        <TableCell>{product.productName}</TableCell>
                        <TableCell>
                          {/* عرض جميع الأسعار */}
                          {product.productPrices && product.productPrices.length > 0 ? (
                            product.productPrices.map((price, index) => (
                              <Typography key={index}>
                                {price.productPriceName}: {price.price}
                              </Typography>
                            ))
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>{product.discount ?? '-'}</TableCell>
                        <TableCell>{product.vat ?? '-'}</TableCell>
                        <TableCell>
                          {product.posScreenId
                            ? allPosScreens.find(screen => screen.screenId === product.posScreenId)?.screenName || 'غير معروف'
                            : 'لا يوجد'}
                        </TableCell>
                        <TableCell>
                          {allProductGroups.find(group => group.groupId === product.productGroupId)?.groupName || 'غير معروف'}
                        </TableCell>
                        <TableCell>
                          {product.productPrices && product.productPrices.length > 0 ? (
                            product.productPrices.map((price, index) => (
                              <Typography key={index}>
                                {price.lineType === 3
                                  ? `GroupPriceType: ${price.groupPriceType ?? 'غير محدد'}`
                                  : 'GroupPriceType: 1'}
                              </Typography>
                            ))
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            aria-label="Edit"
                            onClick={() => handleEditProduct(product)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="secondary"
                            aria-label="Delete"
                            onClick={() => handleDeleteProduct(product.productId)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ) : (
                      // Handle case where productId is undefined
                      <TableRow key={`undefined-${Math.random()}`}>
                        <TableCell colSpan={8} align="center">
                          بيانات منتج غير صحيحة (معرف المنتج مفقود).
                        </TableCell>
                      </TableRow>
                    )
                  ))}
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        لا توجد منتجات لعرضها.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductsPage;
