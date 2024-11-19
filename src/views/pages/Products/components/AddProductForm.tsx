// src/views/pages/Products/components/AddProductForm.tsx

import React, { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';

import {
  Typography,
  TextField,
  Grid,
  Button,
  Box,
  Autocomplete,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../store/Store';
import { useNotification } from '../../../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Product, ProductPrice } from '../../../../types/productTypes';
import {
  getCompanyData,
  getProductGroups,
  getPosScreens,
  createProduct,
} from '../../../../services/apiService';
import { useTranslation } from 'react-i18next';

interface AddProductFormProps {
  onProductAdded: () => void;
  productPrices: ProductPrice[];
  setProductPrices: React.Dispatch<React.SetStateAction<ProductPrice[]>>;
}

export interface AddProductFormRef {
  resetForm: () => void;
  submitForm: () => void;
}

/**
 * AddProductForm component handles adding a new product.
 * It includes form fields for product details and buttons to add price entries.
 */
const AddProductForm = forwardRef<AddProductFormRef, AddProductFormProps>(
  ({ onProductAdded, productPrices, setProductPrices }, ref) => {
    const { t } = useTranslation();

    // State variables for form data and loading state
    const [formData, setFormData] = useState<Product>({
      productId: '',
      productName: '',
      productName2: '',
      productGroupId: '',
      productPrices: [],
      branchId: '',
      companyId: '',
      status: true,
      posScreenId: '',
      discount: 0,
      vat: 0,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Hooks for global state and navigation
    const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
    const token = useSelector((state: AppState) => state.auth.token);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    // State variables for fetched data
    const [branches, setBranches] = useState<any[]>([]);
    const [productGroups, setProductGroups] = useState<any[]>([]);
    const [posScreens, setPosScreens] = useState<any[]>([]);

    // Fetch necessary data: company info, branches, product groups, and POS screens
    useEffect(() => {
      const fetchData = async () => {
        if (!token) return;
        try {
          // Fetch company data
          const companyData = await getCompanyData(baseurl, token);
          setBranches(companyData.branches);
          setFormData((prev) => ({
            ...prev,
            companyId: companyData.companyId,
          }));

          // Fetch product groups
          const groups = await getProductGroups(baseurl, token);
          setProductGroups(groups);

          // Fetch POS screens
          const screens = await getPosScreens(baseurl, token);
          setPosScreens(screens);
        } catch (error) {
          console.error('Error fetching data:', error);
          showNotification(t('notifications.fetchDataFailed'), 'error');
        }
      };

      fetchData();
    }, [baseurl, token, showNotification, t]);

    // Handle form submission
    const handleSubmit = async () => {
      if (!token) {
        showNotification(t('notifications.tokenMissing'), 'error');
        navigate('/login');
        return;
      }

      // Validate required fields
      if (!formData.productName || !formData.productGroupId || !formData.branchId) {
        showNotification(t('notifications.incompleteData'), 'warning');
        return;
      }

      // Additional validation based on lineType
      for (const [index, entry] of productPrices.entries()) {
        if (entry.lineType === 1) {
          // Price entry validation
          if (!entry.productPriceName || entry.price === undefined || entry.price <= 0) {
            showNotification(
              `${t('fields.productName')} ${index + 1}: ${t('notifications.incompleteData')}`,
              'warning'
            );
            return;
          }
        } else if (entry.lineType === 2) {
          // Comment group validation
          if (entry.priceComments) {
            for (const [cIndex, comment] of entry.priceComments.entries()) {
              if (!comment.name ) {
                showNotification(
                  `${t('productPriceList.comment')} ${cIndex + 1} in ${t('productPriceList.commentGroup')} ${index + 1}: ${t('notifications.incompleteData')}`,
                  'warning'
                );
                return;
              }
            }
          }
        } else if (entry.lineType === 3) {
          // Group product validation
          if (
            entry.qtyToSelect === undefined ||
            entry.qtyToSelect <= 0 ||
            !entry.groupPriceType
          ) {
            showNotification(
              `${t('productPriceList.qtyToSelect')} ${index + 1}: ${t('notifications.incompleteData')}`,
              'warning'
            );
            return;
          }
          if (
            entry.groupPriceType === 3 &&
            (entry.groupPrice === undefined || entry.groupPrice <= 0)
          ) {
            showNotification(
              `${t('productPriceList.groupPrice')} ${index + 1}: ${t('notifications.incompleteData')}`,
              'warning'
            );
            return;
          }
        }
      }

      setLoading(true);
      try {
        // Build FormData for submission
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

        // Add productPrices with different lineTypes
        productPrices.forEach((entry, priceIndex) => {
          formPayload.append(`productPrices[${priceIndex}].lineType`, entry.lineType.toString());
        
          if (entry.lineType === 1) {
            formPayload.append(`productPrices[${priceIndex}].productPriceName`, entry.productPriceName!);
            formPayload.append(`productPrices[${priceIndex}].price`, entry.price!.toString());
          } else if (entry.lineType === 2) {
            if (entry.priceComments) {
              entry.priceComments.forEach((comment, commentIndex) => {
                formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].name`, comment.name);
                // فقط إذا كان productPriceId غير فارغ
                if (comment.productPriceId) {
                  formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].productPriceId`, comment.productPriceId);
                }
                formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].branchId`, formData.branchId);
                formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].companyId`, formData.companyId!);
                formPayload.append(`productPrices[${priceIndex}].priceComments[${commentIndex}].status`, comment.status.toString());
              });
            }
          } else if (entry.lineType === 3) {
            formPayload.append(`productPrices[${priceIndex}].qtyToSelect`, entry.qtyToSelect!.toString());
            formPayload.append(`productPrices[${priceIndex}].groupPriceType`, entry.groupPriceType!.toString());
            formPayload.append(`productPrices[${priceIndex}].groupPrice`, entry.groupPrice!.toString());
        
            if (entry.priceGroups && entry.priceGroups.length > 0) {
              entry.priceGroups.forEach((pg, pgIndex) => {
                formPayload.append(`productPrices[${priceIndex}].priceGroups[${pgIndex}].productId`, pg.productId);
                formPayload.append(`productPrices[${priceIndex}].priceGroups[${pgIndex}].productPriceId`, pg.productPriceId);
              });
            }
          }
        
          // لا تقم بإرسال productId للمنتج الجديد
          // formPayload.append(`productPrices[${priceIndex}].productId`, formData.productId);
          
          formPayload.append(`productPrices[${priceIndex}].branchId`, formData.branchId);
          formPayload.append(`productPrices[${priceIndex}].companyId`, formData.companyId!);
          formPayload.append(`productPrices[${priceIndex}].status`, entry.status.toString());
        });

        // Add image file if available
        if (imageFile) {
          formPayload.append('imageFile', imageFile);
        }

        // Debug: Log FormData entries
        console.log('FormData Entries:');
        for (let pair of formPayload.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }

        // Submit the form data using createProduct API
        await createProduct(baseurl, token, formPayload);

        showNotification(t('notifications.productAddedSuccess'), 'success');
        onProductAdded();

        // Reset the form
        resetFormInternal();
        setImageFile(null);
      } catch (err) {
        console.error('Error adding product:', err);
        showNotification(t('notifications.saveProductFailed'), 'error');
      } finally {
        setLoading(false);
      }
    };

    const resetFormInternal = () => {
      setFormData({
        productId: '',
        productName: '',
        productName2: '',
        productGroupId: '',
        productPrices: [],
        branchId: '',
        companyId: formData.companyId, // Retain companyId
        posScreenId: '',
        discount: 0,
        vat: 0,
        status: true,
      });
      setImageFile(null);
      setProductPrices([]); // Reset productPrices
    };

    // Derived selected options for Autocomplete fields
    const selectedProductGroup = useMemo(
      () => productGroups.find((group) => group.groupId === formData.productGroupId) || null,
      [productGroups, formData.productGroupId]
    );

    const selectedBranch = useMemo(
      () => branches.find((branch) => branch.branchId === formData.branchId) || null,
      [branches, formData.branchId]
    );

    const selectedPosScreen = useMemo(
      () => posScreens.find((screen) => screen.screenId === formData.posScreenId) || null,
      [posScreens, formData.posScreenId]
    );

    // Expose resetForm and submitForm via ref
    useImperativeHandle(ref, () => ({
      resetForm: () => {
        resetFormInternal();
      },
      submitForm: handleSubmit,
    }));

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {t('products.addNewProduct')}
        </Typography>

        {/* Basic Fields */}
        <Grid container spacing={2}>
          {/* Product Name */}
          <Grid item xs={12}>
            <TextField
              label={t('fields.productName')}
              name="productName"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              fullWidth
              required
            />
          </Grid>

          {/* Product Name 2 */}
          <Grid item xs={12}>
            <TextField
              label={t('fields.productName2')}
              name="productName2"
              value={formData.productName2 || ''}
              onChange={(e) => setFormData({ ...formData, productName2: e.target.value })}
              fullWidth
            />
          </Grid>

          {/* Product Group */}
          <Grid item xs={12}>
            <Autocomplete
              options={productGroups}
              getOptionLabel={(option) => option.groupName}
              value={selectedProductGroup}
              onChange={(event, newValue) => {
                setFormData({
                  ...formData,
                  productGroupId: newValue ? newValue.groupId : '',
                });
              }}
              renderInput={(params) => (
                <TextField {...params} label={t('fields.productGroup')} required fullWidth />
              )}
              isOptionEqualToValue={(option, value) => option.groupId === value.groupId}
            />
          </Grid>

          {/* Branch */}
          <Grid item xs={12}>
            <Autocomplete
              options={branches}
              getOptionLabel={(option) => option.branchName}
              value={selectedBranch}
              onChange={(event, newValue) => {
                setFormData({
                  ...formData,
                  branchId: newValue ? newValue.branchId : '',
                });
              }}
              renderInput={(params) => (
                <TextField {...params} label={t('fields.branch')} required fullWidth />
              )}
              isOptionEqualToValue={(option, value) => option.branchId === value.branchId}
            />
          </Grid>

          {/* POS Screen */}
          <Grid item xs={12}>
            <Autocomplete
              options={posScreens}
              getOptionLabel={(option) => option.screenName}
              value={selectedPosScreen}
              onChange={(event, newValue) => {
                setFormData({
                  ...formData,
                  posScreenId: newValue ? newValue.screenId : '',
                });
              }}
              renderInput={(params) => (
                <TextField {...params} label={t('fields.posScreen')} fullWidth />
              )}
              isOptionEqualToValue={(option, value) => option.screenId === value.screenId}
            />
          </Grid>

          {/* Discount */}
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('fields.discount')}
              name="discount"
              type="number"
              value={formData.discount ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discount: e.target.value ? parseFloat(e.target.value) : 0,
                })
              }
              fullWidth
            />
          </Grid>

          {/* VAT */}
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('fields.vat')}
              name="vat"
              type="number"
              value={formData.vat ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  vat: e.target.value ? parseFloat(e.target.value) : 0,
                })
              }
              fullWidth
            />
          </Grid>

          {/* Upload Image */}
          <Grid item xs={12}>
            <Button variant="contained" component="label">
              {t('fields.uploadImage')}
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
        </Grid>

        {/* The Main Buttons have been removed from here */}
      </Box>
    );
  }
);

export default AddProductForm;
