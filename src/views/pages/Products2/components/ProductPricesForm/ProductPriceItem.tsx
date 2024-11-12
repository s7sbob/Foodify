// src/components/Product/ProductPricesForm/ProductPriceItem.tsx

import React from 'react';
import { TextField, Grid, IconButton, Typography, Paper, Button, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { ProductPrice, PriceComment, GroupProduct } from '../../../../../types/productTypes';
import { v4 as uuidv4 } from 'uuid';

interface ProductPriceItemProps {
  price: ProductPrice;
  index: number;
  handlePriceChange: (index: number, field: string, value: any) => void;
  handleDeletePrice: (index: number) => void;
  showAddCommentButtons: boolean;
  showAddGroupProductButtons: boolean;
}

const ProductPriceItem: React.FC<ProductPriceItemProps> = ({
  price,
  index,
  handlePriceChange,
  handleDeletePrice,
  showAddCommentButtons,
  showAddGroupProductButtons,
}) => {
  // Handlers for Comments
  const handleAddComment = () => {
    const newComment: PriceComment = {
      commentId: uuidv4(),
      name: '',
      link: '',
      branchId: price.branchId,
      companyId: price.companyId,
      status: true,
    };
    const updatedComments = [...price.priceComments, newComment];
    handlePriceChange(index, 'priceComments', updatedComments);
  };

  const handleRemoveComment = (commentIndex: number) => {
    const updatedComments = price.priceComments.filter((_, i) => i !== commentIndex);
    handlePriceChange(index, 'priceComments', updatedComments);
  };

  const handleCommentChange = (
    commentIndex: number,
    field: keyof PriceComment,
    value: string
  ) => {
    const updatedComments = price.priceComments.map((comment, i) =>
      i === commentIndex ? { ...comment, [field]: value } : comment
    );
    handlePriceChange(index, 'priceComments', updatedComments);
  };

  // Handlers for Group Products
  const handleAddGroupProduct = () => {
    const newGroupProduct: GroupProduct = {
      groupProductId: uuidv4(),
      quantityToSelect: 1,
      groupPriceType: 1, // Default to Zero
      groupPrice: 0, // Default to 0
    };
    const updatedGroups = [...price.priceGroups, newGroupProduct];
    handlePriceChange(index, 'priceGroups', updatedGroups);
  };

  const handleRemoveGroupProduct = (groupIndex: number) => {
    const updatedGroups = price.priceGroups.filter((_, i) => i !== groupIndex);
    handlePriceChange(index, 'priceGroups', updatedGroups);
  };

  const handleGroupProductChange = (
    groupIndex: number,
    field: keyof GroupProduct,
    value: string | number
  ) => {
    const updatedGroups = price.priceGroups.map((group, i) =>
      i === groupIndex ? { ...group, [field]: value } : group
    );
    handlePriceChange(index, 'priceGroups', updatedGroups);
  };

  return (
    <Paper variant="outlined" sx={{ padding: 2, mt: 2 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Delete Button */}
        <Grid item xs={12} sm={1}>
          <IconButton
            color="secondary"
            aria-label="حذف السعر"
            onClick={() => handleDeletePrice(index)}
          >
            <DeleteIcon />
          </IconButton>
        </Grid>

        {/* Price Name */}
        <Grid item xs={12} sm={5}>
          <TextField
            label="اسم السعر"
            name="productPriceName"
            value={price.productPriceName}
            onChange={(e) => handlePriceChange(index, 'productPriceName', e.target.value)}
            fullWidth
            required
          />
        </Grid>

        {/* Price */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="السعر"
            name="price"
            type="number"
            value={price.price}
            onChange={(e) => handlePriceChange(index, 'price', parseFloat(e.target.value))}
            fullWidth
            required
          />
        </Grid>
      </Grid>

      {/* Comments Section */}
      {price.priceComments.length > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle2">التعليقات</Typography>
          {price.priceComments.map((comment, commentIndex) => (
            <Paper
              key={comment.commentId || commentIndex}
              variant="outlined"
              sx={{ padding: 2, mt: 1, backgroundColor: '#f1f1f1' }}
            >
              <Grid container spacing={2} alignItems="center">
                {/* Comment Name */}
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="اسم التعليق"
                    name="name"
                    value={comment.name}
                    onChange={(e) =>
                      handleCommentChange(commentIndex, 'name', e.target.value)
                    }
                    fullWidth
                    required
                  />
                </Grid>

                {/* Comment Link */}
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="رابط التعليق"
                    name="link"
                    value={comment.link}
                    onChange={(e) =>
                      handleCommentChange(commentIndex, 'link', e.target.value)
                    }
                    fullWidth
                    required
                  />
                </Grid>

                {/* Delete Comment */}
                <Grid item xs={12} sm={2}>
                  <IconButton
                    color="secondary"
                    aria-label="حذف التعليق"
                    onClick={() => handleRemoveComment(commentIndex)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          ))}

          {/* Add Comment Button */}
          {showAddCommentButtons && (
            <Box mt={2}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={handleAddComment}
              >
                إضافة تعليق
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Group Products Section */}
      {price.priceGroups.length > 0 && (
        <Box mt={2}>
          <Typography variant="subtitle2">منتجات المجموعة</Typography>
          {price.priceGroups.map((group, groupIndex) => (
            <Paper
              key={group.groupProductId || groupIndex}
              variant="outlined"
              sx={{ padding: 2, mt: 1, backgroundColor: '#e8f5e9' }}
            >
              <Grid container spacing={2} alignItems="center">
                {/* Quantity to Select */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="الكمية المختارة من مجموعة الأصناف"
                    name="quantityToSelect"
                    type="number"
                    value={group.quantityToSelect}
                    onChange={(e) =>
                      handleGroupProductChange(
                        groupIndex,
                        'quantityToSelect',
                        e.target.value ? parseInt(e.target.value) : 1
                      )
                    }
                    fullWidth
                    required
                  />
                </Grid>

                {/* Group Price Type */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    label="نوع سعر المجموعة"
                    name="groupPriceType"
                    value={group.groupPriceType}
                    onChange={(e) =>
                      handleGroupProductChange(
                        groupIndex,
                        'groupPriceType',
                        parseInt(e.target.value)
                      )
                    }
                    fullWidth
                    required
                  >
                    <option value={1}>Zero</option>
                    <option value={2}>As Product</option>
                    <option value={3}>Manual</option>
                  </TextField>
                </Grid>

                {/* Group Price (Only if Group Price Type is Manual) */}
                {group.groupPriceType === 3 && (
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="سعر المجموعة"
                      name="groupPrice"
                      type="number"
                      value={group.groupPrice}
                      onChange={(e) =>
                        handleGroupProductChange(
                          groupIndex,
                          'groupPrice',
                          e.target.value ? parseFloat(e.target.value) : 0
                        )
                      }
                      fullWidth
                      required
                    />
                  </Grid>
                )}

                {/* Delete Group Product */}
                <Grid item xs={12} sm={group.groupPriceType === 3 ? 4 : 8}>
                  <IconButton
                    color="secondary"
                    aria-label="حذف منتج المجموعة"
                    onClick={() => handleRemoveGroupProduct(groupIndex)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          ))}

          {/* Add Group Product Button */}
          {showAddGroupProductButtons && (
            <Box mt={2}>
              <Button
                variant="contained"
                color="success"
                startIcon={<AddIcon />}
                onClick={handleAddGroupProduct}
              >
                إضافة منتج مجموعة
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default ProductPriceItem;
