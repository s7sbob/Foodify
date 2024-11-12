// src/components/Product/EditProductForm.tsx

import React, { useState } from 'react';
import {
  Typography,
  Grid,
  Button,
  CircularProgress,
  Box,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../../store/Store';
import { useNotification } from '../../../../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Product, ProductPrice, PriceComment, GroupProduct, Branch, ProductGroup, PosScreen } from '../../../../../types/productTypes';
import { v4 as uuidv4 } from 'uuid';
import ProductDetails from './ProductDetails';
import ImageUploader from './ImageUploader';
import ActionButtons from './ActionButtons';
import ProductPricesForm from '../ProductPricesForm/ProductPricesForm';

interface EditProductFormProps {
  productData: Product;
  onProductUpdated: () => void;
  onCancel: () => void;
  branches: Branch[];
  productGroups: ProductGroup[];
  posScreens: PosScreen[];
}

const EditProductForm: React.FC<EditProductFormProps> = ({
  productData,
  onProductUpdated,
  onCancel,
  branches,
  productGroups,
  posScreens,
}) => {
  const [formData, setFormData] = useState<Product>({
    ...productData,
    productPrices: productData.productPrices || [],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token = useSelector((state: AppState) => state.auth.token);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // State to control visibility of Add Comment and Add Group Product buttons
  const [showAddCommentButtons, setShowAddCommentButtons] = useState<boolean>(false);
  const [showAddGroupProductButtons, setShowAddGroupProductButtons] = useState<boolean>(false);

  // Handle form submission
  const handleSubmit = async () => {
    if (!token) {
      showNotification('يجب أن تكون مسجلاً للدخول لأداء هذا الإجراء.', 'error', 'غير مصرح');
      navigate('/login');
      return;
    }

    // Validate required fields
    if (!formData.productName || !formData.productGroupId || !formData.branchId) {
      showNotification('يرجى ملء جميع الحقول المطلوبة.', 'warning', 'بيانات غير كاملة');
      return;
    }

    // Validate product prices and comments
    for (const price of formData.productPrices) {
      if (!price.productPriceName || price.price <= 0) {
        showNotification('يرجى ملء جميع حقول سعر المنتج بشكل صحيح.', 'warning', 'بيانات غير كاملة');
        return;
      }

      // Validate comments
      for (const comment of price.priceComments) {
        if (!comment.name || !comment.link) {
          showNotification('يرجى ملء جميع حقول التعليق بشكل صحيح.', 'warning', 'بيانات غير كاملة');
          return;
        }
      }

      // Validate group products
      for (const group of price.priceGroups) {
        if (!group.groupPriceType || !group.groupProductId) {
          showNotification('يرجى ملء جميع حقول مجموعة المنتج بشكل صحيح.', 'warning', 'بيانات غير كاملة');
          return;
        }
        if (group.groupPriceType === 3 && (!group.groupPrice || group.groupPrice <= 0)) {
          showNotification('يرجى إدخال سعر المجموعة بشكل صحيح.', 'warning', 'بيانات غير كاملة');
          return;
        }
      }
    }

    setLoading(true);
    try {
      // Build FormData
      const formPayload = new FormData();
      formPayload.append('productId', formData.productId || '');
      formPayload.append('productName', formData.productName);
      formPayload.append('productName2', formData.productName2 || '');
      formPayload.append('productGroupId', formData.productGroupId);
      formPayload.append('branchId', formData.branchId);
      formPayload.append('posScreenId', formData.posScreenId || '');
      formPayload.append('discount', formData.discount?.toString() || '0');
      formPayload.append('vat', formData.vat?.toString() || '0');
      formPayload.append('companyId', formData.companyId);
      formPayload.append('status', formData.status.toString());

      // Add product prices
      formData.productPrices.forEach((price, priceIndex) => {
        formPayload.append(`productPrices[${priceIndex}].productPriceId`, price.productPriceId || uuidv4());
        formPayload.append(`productPrices[${priceIndex}].productPriceName`, price.productPriceName);
        formPayload.append(`productPrices[${priceIndex}].price`, price.price.toString());
        formPayload.append(`productPrices[${priceIndex}].branchId`, price.branchId);
        formPayload.append(`productPrices[${priceIndex}].companyId`, price.companyId);
        formPayload.append(`productPrices[${priceIndex}].status`, price.status.toString());

        // Determine lineType based on content
        if (price.priceComments.length > 0 && price.priceGroups.length > 0) {
          price.lineType = 3;
        } else if (price.priceComments.length > 0) {
          price.lineType = 2;
        } else {
          price.lineType = 1;
        }
        formPayload.append(`productPrices[${priceIndex}].lineType`, price.lineType.toString());

        // Add price comments
        price.priceComments.forEach((comment, commentIndex) => {
          formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].commentId`, comment.commentId || uuidv4());
          formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].name`, comment.name);
          formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].link`, comment.link);
          formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].branchId`, comment.branchId);
          formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].companyId`, comment.companyId);
          formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].status`, comment.status.toString());
        });

        // Add group products
        price.priceGroups.forEach((group, groupIndex) => {
          formPayload.append(`productPrices[${priceIndex}].priceGroups[${groupIndex}].groupProductId`, group.groupProductId);
          formPayload.append(`productPrices[${priceIndex}].priceGroups[${groupIndex}].quantityToSelect`, group.quantityToSelect.toString());
          formPayload.append(`productPrices[${priceIndex}].priceGroups[${groupIndex}].groupPriceType`, group.groupPriceType.toString());
          if (group.groupPriceType === 3) {
            formPayload.append(`productPrices[${priceIndex}].priceGroups[${groupIndex}].groupPrice`, group.groupPrice?.toString() || '0');
          }
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
      await axios.post(`${baseurl}/Product/UpdateProduct`, formPayload, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          // 'Content-Type' is set automatically by Axios for FormData
        },
      });
      showNotification('تم تحديث المنتج بنجاح!', 'success', 'نجاح');
      onProductUpdated();
    } catch (err) {
      console.error('Error updating product:', err);
      showNotification('فشل في تحديث المنتج.', 'error', 'خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        تعديل المنتج
      </Typography>
      <Grid container spacing={2}>
        {/* Product Details */}
        <ProductDetails
          formData={formData}
          handleChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
          productGroups={productGroups}
          branches={branches}
          posScreens={posScreens}
        />

        {/* Image Uploader */}
        <Grid item xs={12}>
          <ImageUploader imageFile={imageFile} setImageFile={setImageFile} />
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <ActionButtons
            handleAddPrice={() => {
              const newPrice: ProductPrice = {
                productPriceId: uuidv4(),
                productPriceName: '',
                price: 0,
                qtyToSelect: 1, // Default value since it's removed from UI
                priceComments: [],
                priceGroups: [],
                branchId: formData.branchId,
                companyId: formData.companyId,
                status: true,
                lineType: 1,
                groupPrice: 0
              };
              setFormData((prev) => ({
                ...prev,
                productPrices: [...prev.productPrices, newPrice],
              }));
            }}
            handleGlobalAddComment={() => {
              if (formData.productPrices.length === 0) {
                showNotification('يرجى إضافة سعر أولاً.', 'warning', 'لا يوجد أسعار');
                return;
              }
              setShowAddCommentButtons(!showAddCommentButtons);
            }}
            handleGlobalAddGroupProduct={() => {
              if (formData.productPrices.length === 0) {
                showNotification('يرجى إضافة سعر أولاً.', 'warning', 'لا يوجد أسعار');
                return;
              }
              setShowAddGroupProductButtons(!showAddGroupProductButtons);
            }}
          />
        </Grid>

        {/* Product Prices Form */}
        <Grid item xs={12}>
          <ProductPricesForm
            productPrices={formData.productPrices}
            setProductPrices={(prices) => setFormData({ ...formData, productPrices: prices })}
            showAddCommentButtons={showAddCommentButtons}
            showAddGroupProductButtons={showAddGroupProductButtons}
          />
        </Grid>

        {/* Submit Button */}
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

export default EditProductForm;
