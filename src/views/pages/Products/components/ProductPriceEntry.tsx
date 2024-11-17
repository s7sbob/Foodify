// src/components/ProductPriceEntry.tsx

import React from 'react';
import { Paper, Grid, TextField, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ProductPrice } from '../../../../types/productTypes';
import { useTranslation } from 'react-i18next';

interface ProductPriceEntryProps {
  entry: ProductPrice;
  index: number;
  handleEntryChange: (index: number, field: keyof ProductPrice, value: any) => void;
  handleRemoveEntry: (index: number) => void;
}

const ProductPriceEntry: React.FC<ProductPriceEntryProps> = ({
  entry,
  index,
  handleEntryChange,
  handleRemoveEntry,
}) => {
  const { t } = useTranslation();

  return (
    <Paper variant="outlined" sx={{ padding: 2, marginTop: 2 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Price Name */}
        <Grid item xs={12} sm={6}>
          <TextField
            label={`${t('productPriceList.priceName')} ${index + 1}`} // Ensure "priceName" exists under "productPriceList"
            name="productPriceName"
            value={entry.productPriceName || ''}
            onChange={(e) => handleEntryChange(index, 'productPriceName', e.target.value)}
            fullWidth
            required
          />
        </Grid>

        {/* Price */}
        <Grid item xs={12} sm={4}>
          <TextField
            label={`${t('productPriceList.price')} ${index + 1}`}
            name="price"
            type="number"
            value={entry.price ?? ''}
            onChange={(e) =>
              handleEntryChange(
                index,
                'price',
                e.target.value ? parseFloat(e.target.value) : 0
              )
            }
            fullWidth
            required
          />
        </Grid>

        {/* Delete Entry Button */}
        <Grid item xs={12} sm={2}>
          <IconButton
            aria-label={t('buttons.delete') as string} // Use "buttons.delete" if defined; otherwise, add "buttons.deleteEntry"
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
