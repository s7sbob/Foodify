// src/components/Product/ProductPricesForm/ProductPricesForm.tsx

import React from 'react';
import { Typography } from '@mui/material';
import ProductPriceItem from './ProductPriceItem';
import { ProductPrice } from '../../../../../types/productTypes';

interface ProductPricesFormProps {
  productPrices: ProductPrice[];
  setProductPrices: (prices: ProductPrice[]) => void;
  showAddCommentButtons: boolean;
  showAddGroupProductButtons: boolean;
}

const ProductPricesForm: React.FC<ProductPricesFormProps> = ({
  productPrices,
  setProductPrices,
  showAddCommentButtons,
  showAddGroupProductButtons,
}) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        أسعار المنتج
      </Typography>
      {productPrices.map((price, index) => (
        <ProductPriceItem
          key={price.productPriceId || index}
          price={price}
          index={index}
          handlePriceChange={(i, field, value) => {
            const updatedPrices = [...productPrices];
            (updatedPrices[i] as any)[field] = value;
            setProductPrices(updatedPrices);
          }}
          handleDeletePrice={(i) => {
            const updatedPrices = [...productPrices];
            updatedPrices.splice(i, 1);
            setProductPrices(updatedPrices);
          }}
          showAddCommentButtons={showAddCommentButtons}
          showAddGroupProductButtons={showAddGroupProductButtons}
        />
      ))}
    </>
  );
};

export default ProductPricesForm;
