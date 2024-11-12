// src/components/Product/ProductList/ProductRow.tsx

import React from 'react';
import { TableRow, TableCell, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ProductWithId, PosScreen, ProductGroup, ProductPrice } from '../../../../../types/productTypes';

interface ProductRowProps {
  product: ProductWithId; // Use ProductWithId instead of Product
  allPosScreens: PosScreen[];
  allProductGroups: ProductGroup[];
  onEdit: (product: ProductWithId) => void;
  onDelete: (productId: string) => void;
}

const ProductRow: React.FC<ProductRowProps> = ({
  product,
  allPosScreens,
  allProductGroups,
  onEdit,
  onDelete,
}) => {
  const posScreen = product.posScreenId
    ? allPosScreens.find((screen) => screen.screenId === product.posScreenId)
    : null;

  const productGroup = allProductGroups.find((group) => group.groupId === product.productGroupId);

  return (
    <TableRow key={product.productId}>
      <TableCell>{product.productName}</TableCell>
      <TableCell>
        {/* Display all prices */}
        {product.productPrices && product.productPrices.length > 0 ? (
          product.productPrices.map((price: ProductPrice, index: number) => (
            <Typography key={index}>
              {price.productPriceName}: {price.price}
            </Typography>
          ))
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell>{product.discount ?? '-'}</TableCell>
      <TableCell>{product.vat ?? '-'}</TableCell>
      <TableCell>
        {posScreen ? posScreen.screenName : 'لا يوجد'}
      </TableCell>
      <TableCell>
        {productGroup ? productGroup.groupName : 'غير معروف'}
      </TableCell>
      <TableCell>
        {product.productPrices && product.productPrices.length > 0 ? (
          product.productPrices.map((price: ProductPrice, index: number) => (
            <Typography key={index}>
              {price.lineType === 3
                ? 'نوع سعر المجموعة: 3 (تعليق ومجموعة منتجات)'
                : price.lineType === 2
                ? 'نوع سعر المجموعة: 2 (تعليق)'
                : 'نوع سعر المجموعة: 1 (سعر فقط)'}
            </Typography>
          ))
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell>
        <IconButton
          color="primary"
          aria-label="تعديل"
          onClick={() => onEdit(product)}
        >
          <EditIcon />
        </IconButton>
        <IconButton
          color="secondary"
          aria-label="حذف"
          onClick={() => onDelete(product.productId)} // Now productId is guaranteed to be string
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default ProductRow;
