// src/components/ProductPriceList.tsx

import React from 'react';
import {
  Grid,
  Paper,
  IconButton,
  Divider,
  Box,
  Typography,
  Button,
  MenuItem,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { ProductPrice, PriceComment } from '../../../../types/productTypes';
import ProductPriceEntry from './ProductPriceEntry';
import StyledAccordion from './StyledAccordion';
import { useTranslation } from 'react-i18next';

interface ProductPriceListProps {
  productPrices: ProductPrice[];
  handleEntryChange: (index: number, field: keyof ProductPrice, value: any) => void;
  handleRemoveEntry: (index: number) => void;
  handleAddComment: (priceIndex: number) => void;
  handleRemoveComment: (priceIndex: number, commentIndex: number) => void;
  handleCommentChange: (
    priceIndex: number,
    commentIndex: number,
    field: keyof PriceComment,
    value: string
  ) => void;
  handleOpenSelectDialog: (index: number) => void;
}

/**
 * ProductPriceList component displays the list of product price entries.
 * It handles different lineTypes and renders appropriate UI for each.
 */
const ProductPriceList: React.FC<ProductPriceListProps> = ({
  productPrices,
  handleEntryChange,
  handleRemoveEntry,
  handleAddComment,
  handleRemoveComment,
  handleCommentChange,
  handleOpenSelectDialog,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {productPrices.map((entry, index) => (
        <React.Fragment key={entry.productPriceId}>
          {entry.lineType === 1 ? (
            // For lineType 1 (Price), use ProductPriceEntry component
            <ProductPriceEntry
              entry={entry}
              index={index}
              handleEntryChange={handleEntryChange}
              handleRemoveEntry={handleRemoveEntry}
            />
          ) : (
            // For other lineTypes, use StyledAccordion
            <>
              <StyledAccordion
                title={
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="flex-end"
                    width="100%"
                  >
                    <IconButton
                      aria-label={t('buttons.delete') as string}
                      onClick={() => handleRemoveEntry(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                    <Typography variant="subtitle1" sx={{ mr: 1 }}>
                      {entry.lineType === 2
                        ? `${t('productPriceList.commentGroup')} ${index + 1}`
                        : `${t('productPriceList.groupProduct')} ${index + 1}`}
                    </Typography>
                  </Box>
                }
              >
                {/* Content based on lineType */}
                <Grid container spacing={2}>
                  {entry.lineType === 2 && (
                    <>
                      {/* Add Comment Button */}
                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddComment(index)}
                          fullWidth
                        >
                          {t('productPriceList.addComment')}
                        </Button>
                      </Grid>

                      {/* Display Comments */}
                      {entry.priceComments &&
                        entry.priceComments.map((comment, cIndex) => (
                          <Grid item xs={12} key={comment.commentId}>
                            <Paper
                              variant="outlined"
                              sx={{ padding: 2, position: 'relative' }}
                            >
                              <IconButton
                                aria-label={t('buttons.delete') as string}
                                onClick={() => handleRemoveComment(index, cIndex)}
                                color="error"
                                size="small"
                                sx={{ position: 'absolute', top: 8, right: 8 }}
                              >
                                <DeleteIcon />
                              </IconButton>
                              <Typography variant="subtitle1" color="textSecondary">
                                {`${t('productPriceList.comment')} ${cIndex + 1}`}
                              </Typography>
                              <TextField
                                label={`${t('productPriceList.commentName')} *`}
                                name={`name-${cIndex}`}
                                value={comment.name}
                                onChange={(e) =>
                                  handleCommentChange(index, cIndex, 'name', e.target.value)
                                }
                                fullWidth
                                required
                                variant="outlined"
                                size="small"
                                sx={{ mt: 1 }}
                              />
                              <TextField
                                label={`${t('fields.description')} *`} // Ensure "description" is defined under "fields"
                                name={`description-${cIndex}`}
                                value={comment.description || ''}
                                onChange={(e) =>
                                  handleCommentChange(
                                    index,
                                    cIndex,
                                    'description',
                                    e.target.value
                                  )
                                }
                                fullWidth
                                required
                                variant="outlined"
                                size="small"
                                sx={{ mt: 2 }}
                              />
                            </Paper>
                          </Grid>
                        ))}
                    </>
                  )}

                  {entry.lineType === 3 && (
                    <>
                      {/* Quantity to Select */}
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label={t('productPriceList.qtyToSelect')}
                          name="qtyToSelect"
                          type="number"
                          value={entry.qtyToSelect || ''}
                          onChange={(e) =>
                            handleEntryChange(
                              index,
                              'qtyToSelect',
                              e.target.value ? parseFloat(e.target.value) : 0
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
                          label={t('productPriceList.groupPriceType')}
                          name="groupPriceType"
                          value={entry.groupPriceType || ''}
                          onChange={(e) =>
                            handleEntryChange(
                              index,
                              'groupPriceType',
                              e.target.value ? parseInt(e.target.value as string) : 1
                            )
                          }
                          fullWidth
                          required
                        >
                          <MenuItem value={1}>{t('productPriceList.zero')}</MenuItem>
                          <MenuItem value={2}>{t('productPriceList.asProduct')}</MenuItem>
                          <MenuItem value={3}>{t('productPriceList.manual')}</MenuItem>
                        </TextField>
                      </Grid>

                      {/* Select Products Button */}
                      <Grid item xs={12} sm={4}>
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => handleOpenSelectDialog(index)}
                          fullWidth
                        >
                          {t('productPriceList.selectProducts')}
                        </Button>
                      </Grid>

                      {/* Group Price (if groupPriceType is 'manual') */}
                      {entry.groupPriceType === 3 && (
                        <Grid item xs={12} sm={4}>
                          <TextField
                            label={t('productPriceList.groupPrice')}
                            name="groupPrice"
                            type="number"
                            value={entry.groupPrice || ''}
                            onChange={(e) =>
                              handleEntryChange(
                                index,
                                'groupPrice',
                                e.target.value ? parseFloat(e.target.value) : 0
                              )
                            }
                            fullWidth
                            required
                          />
                        </Grid>
                      )}
                    </>
                  )}
                </Grid>
              </StyledAccordion>
              <Divider />
            </>
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export default ProductPriceList;
