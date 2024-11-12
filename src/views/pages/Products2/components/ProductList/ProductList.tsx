// src/components/Product/ProductList/ProductList.tsx

import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
} from '@mui/material';
import ProductRow from './ProductRow';
import { Product, ProductWithId, PosScreen, ProductGroup } from '../../../../../types/productTypes';

interface ProductListProps {
  products: Product[];
  allPosScreens: PosScreen[];
  allProductGroups: ProductGroup[];
  onEdit: (product: ProductWithId) => void;
  onDelete: (productId: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  allPosScreens,
  allProductGroups,
  onEdit,
  onDelete,
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>اسم المنتج</TableCell>
            <TableCell>السعر</TableCell>
            <TableCell>الخصم (%)</TableCell>
            <TableCell>ضريبة القيمة المضافة (%)</TableCell>
            <TableCell>شاشة POS</TableCell>
            <TableCell>مجموعة المنتج</TableCell>
            <TableCell>نوع سعر المجموعة</TableCell>
            <TableCell>الإجراءات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            product.productId ? (
              <ProductRow
                key={product.productId}
                product={product as ProductWithId} // Type assertion
                allPosScreens={allPosScreens}
                allProductGroups={allProductGroups}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ) : (
              <TableRow key={`undefined-${Math.random()}`}>
                <TableCell colSpan={8} align="center">
                  بيانات المنتج غير صالحة (مفقود معرف المنتج).
                </TableCell>
              </TableRow>
            )
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} align="center">
                لا توجد منتجات لعرضها.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductList;
