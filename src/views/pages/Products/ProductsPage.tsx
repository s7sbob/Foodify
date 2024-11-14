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
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
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

  // Additional Data
  const [allProductGroups, setAllProductGroups] = useState<any[]>([]);
  const [allPosScreens, setAllPosScreens] = useState<any[]>([]);

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // Handle Edit Product
  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
  };

  // Handle Delete Product
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

  // Filtered Products based on Search Query
  const filteredProducts = products.filter((product) =>
    product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    allProductGroups.find(group => group.groupId === product.productGroupId)?.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.posScreenId 
      ? allPosScreens.find(screen => screen.screenId === product.posScreenId)?.screenName.toLowerCase().includes(searchQuery.toLowerCase()) 
      : 'لا يوجد'.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        المنتجات
      </Typography>

      <Grid container spacing={2}>
        {/* Left Side: Add or Edit Product Form */}
        <Grid item xs={12} md={8}>
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

        {/* Right Side: Search Bar and Products Table */}
        <Grid item xs={12} md={4}>
          {/* Search Bar */}
          <Box mb={2}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="بحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

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
                    <TableCell>اسم المجموعة</TableCell>
                    <TableCell>الشاشة</TableCell>
                    <TableCell>الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((product) => (
                    product.productId ? (
                      <TableRow key={product.productId}>
                        <TableCell>{product.productName}</TableCell>
                        <TableCell>
                          {allProductGroups.find(group => group.groupId === product.productGroupId)?.groupName || 'غير معروف'}
                        </TableCell>
                        <TableCell>
                          {product.posScreenId
                            ? allPosScreens.find(screen => screen.screenId === product.posScreenId)?.screenName || 'غير معروف'
                            : 'لا يوجد'}
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
                        <TableCell colSpan={4} align="center">
                          بيانات منتج غير صحيحة (معرف المنتج مفقود).
                        </TableCell>
                      </TableRow>
                    )
                  ))}

                  {filteredProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
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
