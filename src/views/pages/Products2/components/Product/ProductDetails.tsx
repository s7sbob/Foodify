// src/components/Product/ProductDetails.tsx

import React from 'react';
import { TextField, Grid, MenuItem } from '@mui/material';
import { Product, ProductGroup, Branch, PosScreen } from '../../../../../types/productTypes';

interface ProductDetailsProps {
  formData: Product;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  productGroups: ProductGroup[];
  branches: Branch[];
  posScreens: PosScreen[];
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  formData,
  handleChange,
  productGroups,
  branches,
  posScreens,
}) => {
  return (
    <>
      {/* Product Name */}
      <Grid item xs={12}>
        <TextField
          label="اسم المنتج"
          name="productName"
          value={formData.productName}
          onChange={handleChange}
          fullWidth
          required
        />
      </Grid>
      
      {/* Product Name 2 */}
      <Grid item xs={12}>
        <TextField
          label="اسم المنتج 2"
          name="productName2"
          value={formData.productName2 || ''}
          onChange={handleChange}
          fullWidth
        />
      </Grid>
      
      {/* Product Group */}
      <Grid item xs={12}>
        <TextField
          select
          label="مجموعة المنتج"
          name="productGroupId"
          value={formData.productGroupId}
          onChange={handleChange}
          fullWidth
          required
        >
          {productGroups.map((group) => (
            <MenuItem key={group.groupId} value={group.groupId}>
              {group.groupName}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      
      {/* Branch */}
      <Grid item xs={12}>
        <TextField
          select
          label="الفرع"
          name="branchId"
          value={formData.branchId}
          onChange={handleChange}
          fullWidth
          required
        >
          {branches.map((branch) => (
            <MenuItem key={branch.branchId} value={branch.branchId}>
              {branch.branchName}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      
      {/* POS Screen (Optional) */}
      <Grid item xs={12}>
        <TextField
          select
          label="شاشة POS"
          name="posScreenId"
          value={formData.posScreenId || ''}
          onChange={handleChange}
          fullWidth
        >
          <MenuItem value="">لا يوجد</MenuItem>
          {posScreens.map((screen) => (
            <MenuItem key={screen.screenId} value={screen.screenId}>
              {screen.screenName}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      
      {/* Discount */}
      <Grid item xs={12} sm={6}>
        <TextField
          label="الخصم (%)"
          name="discount"
          type="number"
          value={formData.discount ?? ''}
          onChange={handleChange}
          fullWidth
        />
      </Grid>
      
      {/* VAT */}
      <Grid item xs={12} sm={6}>
        <TextField
          label="ضريبة القيمة المضافة (%)"
          name="vat"
          type="number"
          value={formData.vat ?? ''}
          onChange={handleChange}
          fullWidth
        />
      </Grid>
    </>
  );
};

export default ProductDetails;
