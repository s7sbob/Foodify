// src/pages/ProductsPage.tsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { AppState } from '../../../store/Store';
import { Product } from '../../../types/productTypes';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AddProductForm from './AddProductForm';
import EditProductForm from './EditProductForm';
import { useNotification } from '../../../context/NotificationContext';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { showNotification } = useNotification();

  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token = useSelector((state: AppState) => state.auth.token);

  const [openAddProductModal, setOpenAddProductModal] = useState<boolean>(false);
  const [openEditProductModal, setOpenEditProductModal] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get<Product[]>(`${baseurl}/Product/GetProducts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products.');
      showNotification('Failed to fetch products.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // فتح وإغلاق نموذج إضافة منتج
  const handleAddProductModalOpen = () => {
    setOpenAddProductModal(true);
  };

  const handleAddProductModalClose = () => {
    setOpenAddProductModal(false);
  };

  // فتح وإغلاق نموذج تعديل منتج
  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setOpenEditProductModal(true);
  };

  const handleEditProductModalClose = () => {
    setOpenEditProductModal(false);
    setProductToEdit(null);
  };

  // حذف منتج
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await axios.delete(`${baseurl}/Product/DeleteProduct/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showNotification('Product deleted successfully!', 'success', 'Success');
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      showNotification('Failed to delete product.', 'error', 'Error');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Products
      </Typography>

      {/* زر إضافة منتج */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddProductModalOpen}
          startIcon={<AddIcon />}
        >
          Add Product
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>VAT</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.productId}>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>
                    {product.productPrices && product.productPrices.length > 0
                      ? product.productPrices[0].price
                      : '-'}
                  </TableCell>
                  <TableCell>{product.discount}</TableCell>
                  <TableCell>{product.vat}</TableCell>
                  <TableCell>
                    {/* أزرار التعديل والحذف */}
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* نموذج إضافة منتج */}
      <AddProductForm
        open={openAddProductModal}
        handleClose={handleAddProductModalClose}
        onProductAdded={fetchProducts}
      />

      {/* نموذج تعديل منتج */}
      {productToEdit && (
        <EditProductForm
          open={openEditProductModal}
          handleClose={handleEditProductModalClose}
          productData={productToEdit}
          onProductUpdated={fetchProducts}
        />
      )}
    </Box>
  );
};

export default ProductsPage;
