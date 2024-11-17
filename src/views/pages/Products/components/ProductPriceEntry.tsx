// src/views/pages/Products/components/ProductPriceEntry.tsx

import React, { useRef, useEffect } from 'react';
import { TextField, Grid, IconButton, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ProductPrice } from '../../../../types/productTypes';
import { useTranslation } from 'react-i18next';

interface ProductPriceEntryProps {
  entry: ProductPrice;
  index: number;
  handleEntryChange: (index: number, field: keyof ProductPrice, value: any) => void;
  handleRemoveEntry: (index: number) => void;
  autoFocus?: boolean; // إضافة خاصية للتركيز التلقائي
}

/**
 * ProductPriceEntry component handles individual price entries.
 * It includes fields for price name and price value.
 */
const ProductPriceEntry: React.FC<ProductPriceEntryProps> = ({
  entry,
  index,
  handleEntryChange,
  handleRemoveEntry,
  autoFocus,
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <Paper variant="outlined" sx={{ padding: 2, marginTop: 2 }}>
      <Grid container spacing={2} alignItems="center">
        {/* اسم السعر */}
        <Grid item xs={12} sm={6}>
          <TextField
            label={`${t('productPriceList.priceName')} ${index + 1}`}
            name="productPriceName"
            value={entry.productPriceName || ''}
            onChange={(e) => handleEntryChange(index, 'productPriceName', e.target.value)}
            fullWidth
            required
            inputRef={inputRef} // ربط المرجع بالحقل
          />
        </Grid>

        {/* السعر */}
        <Grid item xs={12} sm={4}>
          <TextField
            label={`${t('productPriceList.price')} ${index + 1}`}
            name="price"
            type="number"
            value={entry.price ?? ''}
            onChange={(e) =>
              handleEntryChange(index, 'price', e.target.value ? parseFloat(e.target.value) : 0)
            }
            fullWidth
            required
          />
        </Grid>

        {/* زر حذف المدخل */}
        <Grid item xs={12} sm={2}>
          <IconButton
            aria-label={t('buttons.delete') as string}
            onClick={() => handleRemoveEntry(index)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProductPriceEntry;
