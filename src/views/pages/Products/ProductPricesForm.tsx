// src/components/Product/ProductPricesForm.tsx

import React from 'react';
import { ProductPrice } from '../../../types/productTypes';
import {
  TextField,
  Button,
  Grid,
  IconButton,
  Typography,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface ProductPricesFormProps {
  productPrices: ProductPrice[];
  setProductPrices: (prices: ProductPrice[]) => void;
}

const ProductPricesForm: React.FC<ProductPricesFormProps> = ({ productPrices, setProductPrices }) => {
  const handleAddPrice = () => {
    const newPrice: ProductPrice = {
      productPriceId: '',
      productPriceName: '',
      lineType: 0,
      price: 0,
      priceComments: [],
      qtyToSelect: 0,
      priceGroups: [],
      groupPriceType: 0,
      groupPrice: 0,
      branchId: '',
      companyId: '',
      status: true,
      errors: [],
    };
    setProductPrices([...productPrices, newPrice]);
  };

  const handlePriceChange = <K extends keyof ProductPrice>(
    index: number,
    field: K,
    value: ProductPrice[K]
  ) => {
    const updatedPrices = [...productPrices];
    updatedPrices[index][field] = value;
    setProductPrices(updatedPrices);
  };

  const handleDeletePrice = (index: number) => {
    const updatedPrices = [...productPrices];
    updatedPrices.splice(index, 1);
    setProductPrices(updatedPrices);
  };

  return (
    <Paper variant="outlined" sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Product Prices
      </Typography>
      {productPrices.map((price, index) => (
        <Grid container spacing={2} key={index} alignItems="center">
          {/* اسم السعر */}
          <Grid item xs={12} sm={3}>
            <TextField
              label="Price Name"
              name="productPriceName"
              value={price.productPriceName}
              onChange={(e) =>
                handlePriceChange(index, 'productPriceName', e.target.value)
              }
              fullWidth
              required
            />
          </Grid>
          {/* السعر */}
          <Grid item xs={12} sm={2}>
            <TextField
              label="Price"
              name="price"
              type="number"
              value={price.price}
              onChange={(e) => handlePriceChange(index, 'price', parseFloat(e.target.value))}
              fullWidth
              required
            />
          </Grid>
          {/* الكمية للاختيار */}
          <Grid item xs={12} sm={2}>
            <TextField
              label="Quantity to Select"
              name="qtyToSelect"
              type="number"
              value={price.qtyToSelect}
              onChange={(e) => handlePriceChange(index, 'qtyToSelect', parseFloat(e.target.value))}
              fullWidth
            />
          </Grid>
          {/* نوع الخط */}
          <Grid item xs={12} sm={2}>
            <TextField
              label="Line Type"
              name="lineType"
              type="number"
              value={price.lineType}
              onChange={(e) => handlePriceChange(index, 'lineType', parseInt(e.target.value))}
              fullWidth
            />
          </Grid>
          {/* زر الحذف */}
          <Grid item xs={12} sm={1}>
            <IconButton
              color="secondary"
              aria-label="Delete Price"
              onClick={() => handleDeletePrice(index)}
            >
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      ))}
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddPrice}
        sx={{ mt: 2 }}
      >
        Add Price
      </Button>
    </Paper>
  );
};

export default ProductPricesForm;
