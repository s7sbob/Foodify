// src/views/pages/Products/ProductsPage.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Button,
  Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNotification } from '../../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppState } from '../../../store/Store';
import { Product, ProductPrice, PriceComment } from '../../../types/productTypes';
import axios from 'axios';
import { getProductGroups, getPosScreens, deleteProduct } from '../../../services/apiService';
import { v4 as uuidv4 } from 'uuid';
import ProductList from './components/ProductList';
import ProductForm, { ProductFormRef } from './components/ProductForm';
import ProductPriceList from './components/ProductPriceList';
import SelectProductPriceDialog from './SelectProductPriceDialog';
import { useTranslation } from 'react-i18next';

/**
 * ProductsPage component is the main page for managing products.
 * It includes product listing, adding, editing, and deleting functionalities.
 */
const ProductsPage: React.FC = () => {
  const { t } = useTranslation(); // Initialize the translation hook

  // State variables and hooks
  const [products, setProducts] = useState<Product[]>([]);
  const [productPrices, setProductPrices] = useState<ProductPrice[]>([]);
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

  // Toggle Products Table visibility
  const [showProductsTable, setShowProductsTable] = useState<boolean>(false);

  // State for SelectProductPriceDialog
  const [openSelectDialog, setOpenSelectDialog] = useState<boolean>(false);
  const [currentGroupPriceIndex, setCurrentGroupPriceIndex] = useState<number | null>(null);

  // Create a ref to ProductForm to control form actions from this component
  const productFormRef = useRef<ProductFormRef>(null);

  /**
   * Fetch additional data required for the page, such as product groups and POS screens.
   */
  const fetchAdditionalData = async () => {
    if (!token) return;
    try {
      const groups = await getProductGroups(baseurl, token);
      setAllProductGroups(groups);

      const screens = await getPosScreens(baseurl, token);
      setAllPosScreens(screens);
    } catch (error) {
      console.error('Error fetching additional data:', error);
      showNotification(t('notifications.fetchDataFailed'), 'error');
    }
  };

  /**
   * Fetch products from the API and update the state.
   */
  const fetchProducts = async () => {
    if (!token) {
      showNotification(t('notifications.tokenMissing'), 'error');
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
      setError(t('notifications.fetchProductsFailed'));
      showNotification(t('notifications.fetchProductsFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products and additional data on component mount
  useEffect(() => {
    fetchProducts();
    fetchAdditionalData();
  }, [token]);

  /**
   * Handle editing a product by setting the product to edit and its prices.
   */
  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setProductPrices(product.productPrices || []);
  };

  /**
   * Handle deleting a product after confirmation.
   */
  const handleDeleteProduct = async (productId?: string) => {
    if (!token) {
      showNotification(t('notifications.tokenMissing'), 'error');
      navigate('/login');
      return;
    }

    if (!productId) {
      showNotification(t('notifications.productIdMissing'), 'error');
      return;
    }

    if (!window.confirm(t('confirmations.deleteProduct') as string)) {
      return;
    }

    setLoading(true);
    try {
      await deleteProduct(baseurl, token, productId);
      showNotification(t('notifications.productDeletedSuccess'), 'success');
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      showNotification(t('notifications.productDeleteFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset forms and state related to product editing.
   */
  const handleResetForm = () => {
    setProductToEdit(null);
    setProductPrices([]);
  };

  // Handlers for managing productPrices state

  /**
   * Add a new product price entry based on the specified lineType.
   */
  const handleAddEntry = (lineType: number) => {
    let newEntry: ProductPrice = {
      productPriceId: uuidv4(),
      lineType,
      branchId: '', // سيتم تعيينها من النموذج
      companyId: '', // سيتم تعيينها من النموذج
      status: true,
    };

    switch (lineType) {
      case 1: // السعر
        newEntry.productPriceName = '';
        newEntry.price = 0.0;
        break;
      case 2: // مجموعة تعليقات
        newEntry.priceComments = [
          {
            commentId: uuidv4(),
            name: '',
            productPriceId: newEntry.productPriceId,
            branchId: '', // سيتم تعيينها من النموذج
            companyId: '', // سيتم تعيينها من النموذج
            status: true,
            errors: [],
          },
        ];
        break;
      case 3: // مجموعة منتجات
        newEntry.qtyToSelect = 1.0;
        newEntry.groupPriceType = 1;
        newEntry.groupPrice = 0.0;
        newEntry.priceGroups = [];
        break;
      default:
        break;
    }

    setProductPrices((prev) => [...prev, newEntry]);
  };

  /**
   * Remove a product price entry at the specified index.
   */
  const handleRemoveEntry = (index: number) => {
    setProductPrices((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Handle changes to a product price entry.
   */
  const handleEntryChange = (index: number, field: keyof ProductPrice, value: any) => {
    const updatedPrices = [...productPrices];
    updatedPrices[index] = {
      ...updatedPrices[index],
      [field]: value,
    };
    setProductPrices(updatedPrices);
  };

  /**
   * Add a comment to a comment group at the specified index.
   */
  const handleAddComment = (priceIndex: number) => {
    const newComment: PriceComment = {
      commentId: uuidv4(),
      name: '',
      productPriceId: productPrices[priceIndex].productPriceId,
      branchId: '', // سيتم تعيينها من النموذج
      companyId: '', // سيتم تعيينها من النموذج
      status: true,
      errors: [],
    };
    const updatedPrices = [...productPrices];
    updatedPrices[priceIndex].priceComments = [
      ...(updatedPrices[priceIndex].priceComments || []),
      newComment,
    ];
    setProductPrices(updatedPrices);
  };

  /**
   * Remove a comment from a comment group.
   */
  const handleRemoveComment = (priceIndex: number, commentIndex: number) => {
    const updatedPrices = [...productPrices];
    updatedPrices[priceIndex].priceComments = updatedPrices[priceIndex].priceComments?.filter(
      (_, i) => i !== commentIndex
    );
    setProductPrices(updatedPrices);
  };

  /**
   * Handle changes to a comment within a comment group.
   */
  const handleCommentChange = (
    priceIndex: number,
    commentIndex: number,
    field: keyof PriceComment,
    value: string
  ) => {
    const updatedPrices = [...productPrices];
    const updatedComments = updatedPrices[priceIndex].priceComments?.map((comment, i) =>
      i === commentIndex ? { ...comment, [field]: value } : comment
    );
    updatedPrices[priceIndex].priceComments = updatedComments;
    setProductPrices(updatedPrices);
  };

  /**
   * Open the SelectProductPriceDialog to select products for a group.
   */
  const handleOpenSelectDialog = (index: number) => {
    setCurrentGroupPriceIndex(index);
    setOpenSelectDialog(true);
  };

  /**
   * Close the SelectProductPriceDialog.
   */
  const handleCloseSelectDialog = () => {
    setOpenSelectDialog(false);
    setCurrentGroupPriceIndex(null);
  };

  /**
   * Handle the selection of product prices in the dialog.
   */
  const handleSelectProductPrices = (selectedProducts: any[]) => {
    if (currentGroupPriceIndex === null) return;

    const updatedPrices = [...productPrices];
    updatedPrices[currentGroupPriceIndex].priceGroups = selectedProducts.map((product: any) => ({
      productId: product.productId,
      productPriceId: product.productPriceId,
      quantity: product.quantity,
    }));

    setProductPrices(updatedPrices);
    handleCloseSelectDialog();
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header with Title and Action Buttons */}
      <Grid container alignItems="center" justifyContent="space-between" spacing={2} mb={2}>
        <Grid item>
          <Typography variant="h4" gutterBottom>
            {t('products.title')}
          </Typography>
        </Grid>
        <Grid item>
          {/* زر حفظ المنتج */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              productFormRef.current?.submitForm();
            }}
            sx={{ mr: 2 }}
          >
            {productToEdit ? t('buttons.saveChanges') : t('buttons.saveProduct')}
          </Button>
          {/* زر إعادة الضبط */}
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              productFormRef.current?.resetForm();
              handleResetForm();
            }}
            startIcon={<DeleteIcon />}
          >
            {t('buttons.reset')}
          </Button>
        </Grid>
      </Grid>

      {/* Toggle Products Table Visibility */}
      <Box mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowProductsTable(!showProductsTable)}
        >
          {showProductsTable ? t('buttons.hideProducts') : t('buttons.showProducts')}
        </Button>
        <Collapse in={showProductsTable}>
          {/* Products Table */}
          <Box mt={2}>
            {loading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <ProductList
                products={products}
                productGroups={allProductGroups}
                posScreens={allPosScreens}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            )}
          </Box>
        </Collapse>
      </Box>

      {/* Main Content */}
      <Grid container spacing={2}>
        {/* الجانب الأيسر: نموذج إضافة/تعديل المنتج */}
        <Grid item xs={12} md={6}>
          <ProductForm
            ref={productFormRef}
            isEditing={!!productToEdit}
            productToEdit={productToEdit}
            onProductAdded={() => {
              fetchProducts();
              setProductPrices([]);
            }}
            onProductUpdated={() => {
              fetchProducts();
              setProductToEdit(null);
              setProductPrices([]);
            }}
            onCancelEdit={() => {
              setProductToEdit(null);
              setProductPrices([]);
            }}
            productPrices={productPrices}
            setProductPrices={setProductPrices}
          />
        </Grid>

        {/* الجانب الأيمن: عرض الإدخالات */}
        <Grid item xs={12} md={6}>
          {/* الأزرار الثلاثة */}
          <Grid container spacing={2} mb={2}>
            <Grid item xs={4}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleAddEntry(1)} // lineType 1: سعر
                fullWidth
                startIcon={<AddIcon />}
              >
                {t('buttons.addPrice')}
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleAddEntry(2)} // lineType 2: مجموعة تعليقات
                fullWidth
                startIcon={<AddIcon />}
              >
                {t('buttons.addCommentGroup')}
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                variant="outlined"
                color="success"
                onClick={() => handleAddEntry(3)} // lineType 3: مجموعة منتجات
                fullWidth
                startIcon={<AddIcon />}
              >
                {t('buttons.addGroupProducts')}
              </Button>
            </Grid>
          </Grid>

          <ProductPriceList
            productPrices={productPrices}
            handleEntryChange={handleEntryChange}
            handleRemoveEntry={handleRemoveEntry}
            handleAddComment={handleAddComment}
            handleRemoveComment={handleRemoveComment}
            handleCommentChange={handleCommentChange}
            handleOpenSelectDialog={handleOpenSelectDialog}
          />
          {/* SelectProductPriceDialog */}
          {currentGroupPriceIndex !== null && (
            <SelectProductPriceDialog
              open={openSelectDialog}
              onClose={handleCloseSelectDialog}
              onSelect={handleSelectProductPrices}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductsPage;
