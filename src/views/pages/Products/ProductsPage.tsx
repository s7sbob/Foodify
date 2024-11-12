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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddProductForm from './AddProductForm';
import EditProductForm from './EditProductForm';
import { useNotification } from '../../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppState } from '../../../store/Store';
import { Product } from '../../../types/productTypes';
import axios from 'axios';
import { getProductGroups, getPosScreens, deleteProduct } from '../../../services/apiService';

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
  }, [token]); // تحديث عند تغيير token

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
      await deleteProduct(baseurl, token, productId);
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
        {/* الجزء الأيسر: نموذج إضافة أو تحرير المنتج */}
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
                    <TableCell>الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    product.productId ? (
                      <TableRow key={product.productId}>
                        <TableCell>{product.productName}</TableCell>
                        <TableCell>
                          {/* عرض جميع الأسعار */}
                          {product.productPrices && product.productPrices.length > 0 ? (
                            product.productPrices.map((price, index) => (
                              price.lineType === 1 ? (
                                <Typography key={index}>
                                  {price.productPriceName}: {price.price}
                                </Typography>
                              ) : price.lineType === 2 ? (
                                <Box key={index} sx={{ mt: 1 }}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    مجموعة تعليقات:
                                  </Typography>
                                  {price.priceComments && price.priceComments.length > 0 ? (
                                    price.priceComments.map((comment, cIndex) => (
                                      <Typography key={cIndex} variant="body2" sx={{ ml: 2 }}>
                                        - {comment.name}: {comment.description}
                                      </Typography>
                                    ))
                                  ) : (
                                    <Typography variant="body2" sx={{ ml: 2 }}>
                                      لا توجد تعليقات
                                    </Typography>
                                  )}
                                </Box>
                              ) : price.lineType === 3 ? (
                                <Box key={index} sx={{ mt: 1 }}>
                                  <Typography variant="subtitle2" color="textSecondary">
                                    منتجات المجموعة:
                                  </Typography>
                                  <Typography variant="body2" sx={{ ml: 2 }}>
                                    كمية الاختيار: {price.qtyToSelect}, نوع السعر: {price.groupPriceType}, سعر المجموعة: {price.groupPrice}
                                  </Typography>
                                </Box>
                              ) : null
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
                        <TableCell colSpan={7} align="center">
                          بيانات منتج غير صحيحة (معرف المنتج مفقود).
                        </TableCell>
                      </TableRow>
                    )
                  ))}

                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
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
