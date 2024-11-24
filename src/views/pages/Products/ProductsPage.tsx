// src/views/pages/Products/ProductsPage.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Button,
  Collapse,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNotification } from '../../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppState } from '../../../store/Store';
import { PriceComment, Product, ProductPrice, SelectedProduct } from '../../../types/productTypes';
import axios from 'axios';
import { getProductGroups, getPosScreens, updateProduct } from '../../../services/apiService'; // استبدال deleteProduct بـ updateProduct
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
   * افترضنا أن الـ API يقوم بإرجاع المنتجات التي لها isDeleted=false فقط
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /**
   * Handle editing a product by setting the product to edit and its prices.
   */
  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    // Deep clone to avoid mutating original data
    const clonedProductPrices = product.productPrices.map((pp) => ({ ...pp }));
    setProductPrices(clonedProductPrices);
    console.log('Editing product:', product);
  };

  /**
   * Handle deleting a product by setting isDeleted=true and using updateProduct API
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
      // إيجاد المنتج المراد حذفه
      const productToDelete = products.find((p) => p.productId === productId);
      if (!productToDelete) {
        showNotification(t('notifications.productNotFound'), 'error');
        return;
      }
  
      // تعيين isDeleted=true
      const updatedProduct: Product = {
        ...productToDelete,
        isDeleted: true,
      };
  
      // بناء FormData لتحديث المنتج
      const formPayload = new FormData();
      formPayload.append('productId', updatedProduct.productId);
      formPayload.append('productName', updatedProduct.productName);
      formPayload.append('productName2', updatedProduct.productName2 || '');
      formPayload.append('productGroupId', updatedProduct.productGroupId);
      formPayload.append('branchId', updatedProduct.branchId);
      formPayload.append('posScreenId', updatedProduct.posScreenId || '');
      formPayload.append('discount', updatedProduct.discount?.toString() || '0');
      formPayload.append('vat', updatedProduct.vat?.toString() || '0');
      formPayload.append('companyId', updatedProduct.companyId);
      formPayload.append('status', updatedProduct.status.toString());
  
      // **إضافة isDeleted للمنتج نفسه**
      formPayload.append('isDeleted', updatedProduct.isDeleted ? 'true' : 'false');
  
      // إضافة productPrices مع isDeleted=false أو حسب حالتها
      updatedProduct.productPrices.forEach((entry, priceIndex) => {
        formPayload.append(`productPrices[${priceIndex}].isDeleted`, entry.isDeleted ? 'true' : 'false');
        formPayload.append(`productPrices[${priceIndex}].productPriceId`, entry.productPriceId || '');
        formPayload.append(`productPrices[${priceIndex}].lineType`, entry.lineType.toString());
  
        if (entry.lineType === 1) {
          // Price entry
          formPayload.append(`productPrices[${priceIndex}].productPriceName`, entry.productPriceName || '');
          formPayload.append(`productPrices[${priceIndex}].price`, entry.price?.toString() || '0');
        } else if (entry.lineType === 2) {
          // Comment Group
          if (entry.priceComments) {
            entry.priceComments.forEach((comment, commentIndex) => {
              formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].commentId`, comment.commentId || '');
              formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].name`, comment.name);
              formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].productPriceId`, comment.productPriceId || '');
              formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].branchId`, comment.branchId);
              formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].companyId`, comment.companyId);
              formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].status`, comment.status.toString());
              formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].isDeleted`, comment.isDeleted ? 'true' : 'false');
            });
          }
        } else if (entry.lineType === 3) {
          // Group Product
          formPayload.append(`productPrices[${priceIndex}].qtyToSelect`, entry.qtyToSelect?.toString() || '0');
          formPayload.append(`productPrices[${priceIndex}].groupPriceType`, entry.groupPriceType?.toString() || '0');
          formPayload.append(`productPrices[${priceIndex}].groupPrice`, entry.groupPrice?.toString() || '0');
  
          if (entry.priceGroups) {
            entry.priceGroups.forEach((pg, pgIndex) => {
              formPayload.append(`productPrices[${priceIndex}].priceGroups[${pgIndex}].productId`, pg.productId);
              formPayload.append(`productPrices[${priceIndex}].priceGroups[${pgIndex}].productPriceId`, pg.productPriceId);
            });
          }
        }
  
        formPayload.append(`productPrices[${priceIndex}].branchId`, entry.branchId);
        formPayload.append(`productPrices[${priceIndex}].companyId`, entry.companyId);
        formPayload.append(`productPrices[${priceIndex}].status`, entry.status.toString());
      });
  
  
      // إرسال التعديل باستخدام updateProduct API
      await updateProduct(baseurl, token, updatedProduct.productId, formPayload);
  
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
   * If editing, set productPriceId as '', else use uuidv4()
   */
  const handleAddEntry = (lineType: number) => {
    const isEditing = !!productToEdit;

    let newEntry: ProductPrice = {
      productPriceId: isEditing ? '' : uuidv4(), // Assign ID based on editing mode
      lineType,
      branchId: isEditing ? productToEdit?.branchId || '' : '',
      companyId: isEditing ? productToEdit?.companyId || '' : '',
      status: true,
      productId: isEditing ? productToEdit?.productId || '' : '',
      isDeleted: false, // Set isDeleted=false by default
      productPriceName: '',
      priceName: '',
      productName: '',
      errors: []
    };

    switch (lineType) {
      case 1: // Price
        newEntry.productPriceName = '';
        newEntry.price = 0.0;
        break;
      case 2: // Comment Group
        newEntry.priceComments = [
          {
            commentId: isEditing ? '' : uuidv4(),
            name: '',
            productPriceId: isEditing ? '' : uuidv4(),
            branchId: isEditing ? productToEdit?.branchId || '' : '',
            companyId: isEditing ? productToEdit?.companyId || '' : '',
            status: true,
            isDeleted: false, // Set isDeleted=false by default
            errors: [],
          },
        ];
        break;
      case 3: // Product Group
        newEntry.qtyToSelect = 1.0;
        newEntry.groupPriceType = 1;
        newEntry.groupPrice = 0.0;
        newEntry.priceGroups = []; // Initialize priceGroups
        break;
      default:
        break;
    }

    setProductPrices((prev) => [...prev, newEntry]);
  };

  /**
   * Remove a product price entry at the specified index.
   * If editing, set isDeleted=true; else remove it from the list.
   */
  const handleRemoveEntry = (index: number) => {
    if (productToEdit) {
      // In editing mode, set isDeleted=true
      setProductPrices((prev) => {
        const updated = [...prev];
        updated[index].isDeleted = true;
        return updated;
      });
    } else {
      // In add mode, remove the entry directly
      setProductPrices((prev) => prev.filter((_, i) => i !== index));
    }
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
   * If editing, set commentId as '', else use uuidv4()
   */
  const handleAddComment = (priceIndex: number) => {
    const isEditing = !!productToEdit;

    const newComment: PriceComment = {
      commentId: isEditing ? '' : uuidv4(), // If editing, commentId is empty
      name: '',
      productPriceId: productPrices[priceIndex].productPriceId || '',
      branchId: productToEdit ? productToEdit.branchId : '',
      companyId: productToEdit ? productToEdit.companyId || '' : '',
      status: true,
      isDeleted: false, // Set isDeleted=false by default
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
   * If editing, set isDeleted=true; else remove it from the list.
   */
  const handleRemoveComment = (priceIndex: number, commentIndex: number) => {
    if (productToEdit) {
      // In editing mode, set isDeleted=true for the comment
      setProductPrices((prev) => {
        const updated = [...prev];
        const price = updated[priceIndex];
        if (price.priceComments && price.priceComments[commentIndex]) {
          price.priceComments[commentIndex].isDeleted = true;
        }
        return updated;
      });
    } else {
      // In add mode, remove the comment directly
      setProductPrices((prev) => {
        const updated = [...prev];
        const price = updated[priceIndex];
        if (price.priceComments) {
          price.priceComments = price.priceComments.filter((_, i) => i !== commentIndex);
        }
        return updated;
      });
    }
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
  const handleSelectProductPrices = (selectedProducts: SelectedProduct[]) => {
    if (currentGroupPriceIndex === null) return;

    const updatedPrices = [...productPrices];
    updatedPrices[currentGroupPriceIndex].priceGroups = selectedProducts.map((product) => ({
      productId: product.productId,
      productPriceId: product.productPriceId,
      productName: product.productName,
      priceName: product.priceName,
      price: product.price,
      quantity: 1, // Default or based on your logic
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
          {/* Save Button */}
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
          {/* Reset Button */}
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
                onDelete={handleDeleteProduct} // تعديل دالة onDelete لتستخدم handleDeleteProduct المعدلة
              />
            )}
          </Box>
        </Collapse>
      </Box>

      {/* Main Content */}
      <Grid container spacing={2}>
        {/* Left Side: Add/Edit Product Form */}
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

        {/* Right Side: Display Product Price Entries */}
        <Grid item xs={12} md={6}>
          {/* Three Buttons */}
          <Grid container spacing={2} mb={2}>
            <Grid item xs={4}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleAddEntry(1)} // lineType 1: Price
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
                onClick={() => handleAddEntry(2)} // lineType 2: Comment Group
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
                onClick={() => handleAddEntry(3)} // lineType 3: Group Products
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
