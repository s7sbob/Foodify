// src/pages/ProductsPage.tsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
} from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { AppState } from '../../../store/Store';
import { Product, ProductGroup, PosScreen, Branch } from '../../../types/productTypes';
import EditProductForm from './components/Product/EditProductForm';
import AddProductForm from './components/Product/AddProductForm';
import ProductList from './components/ProductList/ProductList';
import { useNotification } from '../../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { getProductGroups, getPosScreens, getCompanyData } from '../../../services/apiService';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { showNotification } = useNotification();

  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token = useSelector((state: AppState) => state.auth.token);

  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const navigate = useNavigate();

  // Additional data
  const [allProductGroups, setAllProductGroups] = useState<ProductGroup[]>([]);
  const [allPosScreens, setAllPosScreens] = useState<PosScreen[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [companyId, setCompanyId] = useState<string>('');

  const fetchAdditionalData = async () => {
    if (!token) return;
    try {
      const companyData = await getCompanyData(baseurl, token);
      setAllBranches(companyData.branches);
      setCompanyId(companyData.companyId);

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
      showNotification('يجب أن تكون مسجلاً للدخول لعرض المنتجات.', 'error', 'غير مصرح');
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
    fetchAdditionalData();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Handle edit product
  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
  };

  // Handle delete product
  const handleDeleteProduct = async (productId?: string) => {
    if (!token) {
      showNotification('يجب أن تكون مسجلاً للدخول لأداء هذا الإجراء.', 'error', 'غير مصرح');
      navigate('/login');
      return;
    }

    if (!productId) {
      showNotification('معرف المنتج مفقود.', 'error', 'خطأ');
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
    <Box sx={{ width: '100%', padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        المنتجات
      </Typography>

      <Grid container spacing={4}>
        {/* Left Side: Add/Edit Product Form */}
        <Grid item xs={12} md={5}>
          {productToEdit ? (
            <EditProductForm
              productData={productToEdit}
              onProductUpdated={() => {
                fetchProducts();
                setProductToEdit(null);
              }}
              onCancel={() => setProductToEdit(null)}
              branches={allBranches}
              productGroups={allProductGroups}
              posScreens={allPosScreens}
            />
          ) : (
            <AddProductForm
              onProductAdded={fetchProducts}
              branches={allBranches}
              productGroups={allProductGroups}
              posScreens={allPosScreens}
              companyId={companyId}
            />
          )}
        </Grid>

        {/* Right Side: Product List */}
        <Grid item xs={12} md={7}>
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <ProductList
              products={products}
              allPosScreens={allPosScreens}
              allProductGroups={allProductGroups}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductsPage;
