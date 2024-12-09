// src/views/pages/Products/ProductsPage.tsx

import React, { useEffect, useState, useRef, useMemo } from 'react';
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
import { getProductGroups, getPosScreens, updateProduct } from '../../../services/apiService';
import { v4 as uuidv4 } from 'uuid';
import ProductList from './components/ProductList';
import ProductForm, { ProductFormRef } from './components/ProductForm';
import ProductPriceList from './components/ProductPriceList';
import SelectProductPriceDialog from './SelectProductPriceDialog';
import { useTranslation } from 'react-i18next';

const ProductsPage: React.FC = () => {
  const { t } = useTranslation(); // تهيئة الـ translation hook

  // تعريف الحالة والمتغيرات
  const [products, setProducts] = useState<Product[]>([]);
  const [productPrices, setProductPrices] = useState<ProductPrice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token = useSelector((state: AppState) => state.auth.token);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const navigate = useNavigate();

  // بيانات إضافية مثل مجموعات المنتجات وشاشات POS
  const [allProductGroups, setAllProductGroups] = useState<any[]>([]);
  const [allPosScreens, setAllPosScreens] = useState<any[]>([]);

  // حالة لإظهار أو إخفاء جدول المنتجات
  const [showProductsTable, setShowProductsTable] = useState<boolean>(false);

  // حالة لفتح وإغلاق SelectProductPriceDialog
  const [openSelectDialog, setOpenSelectDialog] = useState<boolean>(false);
  const [currentGroupPriceIndex, setCurrentGroupPriceIndex] = useState<number | null>(null);

  // إنشاء مرجع لـ ProductForm للتحكم في النموذج من هذا المكون
  const productFormRef = useRef<ProductFormRef>(null);

  /**
   * دالة لجلب البيانات الإضافية مثل مجموعات المنتجات وشاشات POS
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
   * دالة لجلب المنتجات من الـ API وتحديث الحالة
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

  // جلب المنتجات والبيانات الإضافية عند تحميل المكون
  useEffect(() => {
    fetchProducts();
    fetchAdditionalData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /**
   * دالة للتعامل مع تعديل منتج ما
   */
  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    // نسخ عميق لتجنب تعديل البيانات الأصلية
    const clonedProductPrices = product.productPrices.map((pp) => ({ ...pp }));
    setProductPrices(clonedProductPrices);
    console.log('Editing product:', product);
  };

  /**
   * دالة للتعامل مع حذف منتج ما بتعيين isDeleted=true واستخدام updateProduct API
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
      const productToDelete = products.find((p) => p.productId === productId);
      if (!productToDelete) {
        showNotification(t('notifications.productNotFound'), 'error');
        return;
      }

      const updatedProduct: Product = {
        ...productToDelete,
        isDeleted: true,
      };

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
      formPayload.append('isDeleted', updatedProduct.isDeleted ? 'true' : 'false');

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
              formPayload.append(`productPrices[${priceIndex}].priceGroups[${pgIndex}].productPriceGroupId`, pg.productPriceGroupId || '');
              formPayload.append(`productPrices[${priceIndex}].priceGroups[${pgIndex}].productPriceId`, pg.productPriceId);
              formPayload.append(`productPrices[${priceIndex}].priceGroups[${pgIndex}].branchId`, pg.branchId);
              formPayload.append(`productPrices[${priceIndex}].priceGroups[${pgIndex}].companyId`, pg.companyId);
              formPayload.append(`productPrices[${priceIndex}].priceGroups[${pgIndex}].isDeleted`, pg.isDeleted ? 'true' : 'false');
              formPayload.append(`productPrices[${priceIndex}].priceGroups[${pgIndex}].status`, pg.status.toString());
              formPayload.append(`productPrices[${priceIndex}].priceGroups[${pgIndex}].quantity`, pg.quantity.toString());
            });
          }
        }

        formPayload.append(`productPrices[${priceIndex}].branchId`, entry.branchId);
        formPayload.append(`productPrices[${priceIndex}].companyId`, entry.companyId);
        formPayload.append(`productPrices[${priceIndex}].status`, entry.status.toString());
      });

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
   * إعادة تعيين النماذج والحالات المتعلقة بتعديل المنتج
   */
  const handleResetForm = () => {
    setProductToEdit(null);
    setProductPrices([]);
  };

  /**
   * دالة لمعالجة حذف منتج مختار ضمن مجموعة المنتجات.
   * @param priceIndex مؤشر المنتج في productPrices
   * @param selectedProductIndex مؤشر المنتج المختار في priceGroups
   */
  const handleDeleteSelectedProduct = (priceIndex: number, selectedProductIndex: number) => {
    const updatedPrices = [...productPrices];
    const priceEntry = updatedPrices[priceIndex];

    if (priceEntry.priceGroups && priceEntry.priceGroups[selectedProductIndex]) {
      // تعيين isDeleted إلى true
      updatedPrices[priceIndex].priceGroups![selectedProductIndex].isDeleted = true;
      setProductPrices(updatedPrices);
      showNotification(t('notifications.productMarkedAsDeleted'), 'info');
    } else {
      showNotification(t('notifications.productNotFound'), 'error');
    }
  };

  /**
   * دوال لإدارة حالة productPrices
   */
  const handleAddEntry = (lineType: number) => {
    const isEditing = !!productToEdit;

    let newEntry: ProductPrice = {
      productPriceId: isEditing ? '' : uuidv4(),
      lineType,
      branchId: isEditing ? productToEdit?.branchId || '' : '',
      companyId: isEditing ? productToEdit?.companyId || '' : '',
      status: true,
      productId: isEditing ? productToEdit?.productId || '' : '',
      productName: '',
      priceName: '',
      isDeleted: false,
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
            isDeleted: false,
            errors: [],
          },
        ];
        break;
      case 3: // Product Group
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

  const handleRemoveEntry = (index: number) => {
    if (productToEdit) {
      setProductPrices((prev) => {
        const updated = [...prev];
        updated[index].isDeleted = true;
        return updated;
      });
    } else {
      setProductPrices((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleEntryChange = (index: number, field: keyof ProductPrice, value: any) => {
    const updatedPrices = [...productPrices];
    updatedPrices[index] = {
      ...updatedPrices[index],
      [field]: value,
    };
    setProductPrices(updatedPrices);
  };

  const handleAddComment = (priceIndex: number) => {
    const isEditing = !!productToEdit;
    const newComment: PriceComment = {
      commentId: isEditing ? '' : uuidv4(),
      name: '',
      productPriceId: productPrices[priceIndex].productPriceId || '',
      branchId: isEditing ? productToEdit?.branchId || '' : '',
      companyId: isEditing ? productToEdit?.companyId || '' : '',
      status: true,
      isDeleted: false,
      errors: [],
    };

    const updatedPrices = [...productPrices];
    updatedPrices[priceIndex].priceComments = [
      ...(updatedPrices[priceIndex].priceComments || []),
      newComment,
    ];
    setProductPrices(updatedPrices);
  };

  const handleRemoveComment = (priceIndex: number, commentIndex: number) => {
    if (productToEdit) {
      setProductPrices((prev) => {
        const updated = [...prev];
        const price = updated[priceIndex];
        if (price.priceComments && price.priceComments[commentIndex]) {
          price.priceComments[commentIndex].isDeleted = true;
        }
        return updated;
      });
    } else {
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

  const handleOpenSelectDialog = (index: number) => {
    setCurrentGroupPriceIndex(index);
    setOpenSelectDialog(true);
  };

  const handleCloseSelectDialog = () => {
    setOpenSelectDialog(false);
    setCurrentGroupPriceIndex(null);
  };

  const handleSelectProductPrices = (selectedProducts: SelectedProduct[]) => {
    if (currentGroupPriceIndex === null) return;

    const updatedPrices = [...productPrices];
    const existingPriceGroupEntries = updatedPrices[currentGroupPriceIndex].priceGroups || [];

    // إنشاء خريطة للمنتجات الحالية
    const existingMap = new Map<string, SelectedProduct>();
    existingPriceGroupEntries.forEach((pg) => {
      existingMap.set(pg.productPriceId, pg);
    });

    // إنشاء خريطة من المنتجات المختارة
    const selectedMap = new Map<string, SelectedProduct>();
    selectedProducts.forEach((sp) => {
      selectedMap.set(sp.productPriceId, sp);
    });

    // تحديث المنتجات الحالية: تعيين isDeleted=true إذا لم تعد مختارة
    existingPriceGroupEntries.forEach((pg, pgIndex) => {
      if (!selectedMap.has(pg.productPriceId)) {
        updatedPrices[currentGroupPriceIndex].priceGroups![pgIndex].isDeleted = true;
      }
    });

    // إضافة المنتجات الجديدة أو تحديث الموجودة
    selectedProducts.forEach((sp) => {
      const existingEntry = updatedPrices[currentGroupPriceIndex].priceGroups?.find(
        (pg) => pg.productPriceId === sp.productPriceId
      );
      if (existingEntry) {
        // إذا كانت موجودة بالفعل، تأكد من أن isDeleted=false
        existingEntry.isDeleted = false;
        existingEntry.status = sp.status;       // تحديث الحقل status
        existingEntry.quantity = sp.quantity;   // تحديث الحقل quantity
      } else {
        // إضافة كائن جديد
        updatedPrices[currentGroupPriceIndex].priceGroups!.push({
          productId: sp.productId,
          productPriceId: sp.productPriceId,
          productName: sp.productName,
          priceName: sp.priceName,
          price: sp.price,
          branchId: productToEdit ? productToEdit.branchId : '',
          companyId: productToEdit ? productToEdit.companyId : '',
          isDeleted: false,
          status: true,   // تعيين قيمة افتراضية أو تحديدها حسب الحاجة
          quantity: 1,    // تعيين قيمة افتراضية أو تحديدها حسب الحاجة
          productPriceGroupId: uuidv4(), // توليد معرف فريد
        });
      }
    });

    setProductPrices(updatedPrices);
    handleCloseSelectDialog();
  };

  // إنشاء Map لربط productPriceId بالبيانات (productName, priceName, price)
  const productPricesMap = useMemo(() => {
    const map = new Map<string, { productName: string; priceName: string; price: number }>();
    products.forEach((prod) => {
      prod.productPrices.forEach((pp) => {
        map.set(pp.productPriceId, {
          productName: prod.productName,
          priceName: pp.productPriceName || '',
          price: pp.price || 0,
        });
      });
    });
    return map;
  }, [products]);

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

      <Box mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowProductsTable(!showProductsTable)}
        >
          {showProductsTable ? t('buttons.hideProducts') : t('buttons.showProducts')}
        </Button>
        <Collapse in={showProductsTable}>
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
          <Grid container spacing={2} mb={2}>
            <Grid item xs={4}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleAddEntry(1)}
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
                onClick={() => handleAddEntry(2)}
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
                onClick={() => handleAddEntry(3)}
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
            handleDeleteSelectedProduct={handleDeleteSelectedProduct} // تمرير الدالة هنا
            productPricesMap={productPricesMap}
          />

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
