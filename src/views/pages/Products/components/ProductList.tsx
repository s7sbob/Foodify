// src/views/pages/Products/components/ProductList.tsx

import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Product } from '../../../../types/productTypes';
import { useTranslation } from 'react-i18next';

interface ProductListProps {
  products: Product[];
  productGroups: any[];
  posScreens: any[];
  onEdit: (product: Product) => void;
  onDelete: (productId?: string) => void;
}

/**
 * ProductList component displays a table of products.
 * It shows product name, group name, POS screen, and action buttons for editing and deleting.
 */
const ProductList: React.FC<ProductListProps> = ({
  products,
  productGroups,
  posScreens,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('fields.productName')}</TableCell>
            <TableCell>{t('fields.productGroup')}</TableCell>
            <TableCell>{t('fields.posScreen')}</TableCell>
            <TableCell>{t('actions.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) =>
            product.productId ? (
              <TableRow key={product.productId}>
                <TableCell>{product.productName}</TableCell>
                <TableCell>
                  {
                    // Find the product group name based on productGroupId
                    productGroups.find((group) => group.groupId === product.productGroupId)
                      ?.groupName || t('common.unknown')
                  }
                </TableCell>
                <TableCell>
                  {
                    // Find the POS screen name based on posScreenId
                    product.posScreenId
                      ? posScreens.find((screen) => screen.screenId === product.posScreenId)
                          ?.screenName || t('common.unknown')
                      : t('common.none') // Ensure "none" is defined in your translations
                  }
                </TableCell>
                <TableCell>
                  {/* Edit and Delete action buttons */}
                  <IconButton color="primary" onClick={() => onEdit(product)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => onDelete(product.productId)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ) : (
              // Handle case where productId is undefined
              <TableRow key={`undefined-${Math.random()}`}>
                <TableCell colSpan={4} align="center">
                  {t('notifications.productIdMissing')}
                </TableCell>
              </TableRow>
            )
          )}

          {/* Display message when there are no products */}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                {t('products.noProducts')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductList;
