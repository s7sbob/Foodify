// src/views/pages/Products/components/ProductPriceList.tsx

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
import { ProductPrice, PriceComment, SelectedProduct } from '../../../../types/productTypes';
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

  // الدالة الجديدة لمعالجة حذف المنتج المختار
  handleDeleteSelectedProduct: (priceIndex: number, selectedProductIndex: number) => void;

  // الخريطة التي تحتوي على معلومات المنتجات
  productPricesMap: Map<string, { productName: string; priceName: string; price: number }>;
}

const ProductPriceList: React.FC<ProductPriceListProps> = ({
  productPrices,
  handleEntryChange,
  handleRemoveEntry,
  handleAddComment,
  handleRemoveComment,
  handleCommentChange,
  handleOpenSelectDialog,
  handleDeleteSelectedProduct,
  productPricesMap,
}) => {
  const { t } = useTranslation();

  // تصفية المنتجات التي ليست محذوفة
  const visibleProductPrices = productPrices.filter((pp) => !pp.isDeleted);
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  // التعامل مع تغيير حالة الأكوردين (المفتوحة أو المغلقة)
  const handleAccordionChange = (index: number) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedIndex(isExpanded ? index : null);
  };

  return (
    <React.Fragment>
      {visibleProductPrices.map((entry, index) => (
        <React.Fragment key={`${entry.productPriceId}-${index}`}>
          {entry.lineType === 1 ? (
            // عرض إدخال سعر المنتج
            <ProductPriceEntry
              entry={entry}
              index={index}
              handleEntryChange={handleEntryChange}
              handleRemoveEntry={handleRemoveEntry}
              autoFocus={index === visibleProductPrices.length - 1}
            />
          ) : (
            // عرض مجموعة تعليقات أو مجموعة منتجات
            <React.Fragment>
              <StyledAccordion
                accordionTitle={
                  <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                    <Typography variant="subtitle1">
                      {entry.lineType === 2
                        ? `${t('productPriceList.commentGroup')} ${index + 1}`
                        : `${t('productPriceList.groupProduct')} ${index + 1}`}
                    </Typography>
                    <Box display="flex" alignItems="center">
                      {entry.lineType === 2 && (
                        <Button
                          variant="text"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddComment(index)}
                          sx={{ mr: 1 }}
                        >
                          {t('buttons.addComment')}
                        </Button>
                      )}
                      <IconButton
                        aria-label={t('buttons.delete') as string}
                        onClick={() => handleRemoveEntry(index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                }
                isExpanded={expandedIndex === index}
                onChange={handleAccordionChange(index)}
              >
                <Grid container spacing={2}>
                  {entry.lineType === 2 && (
                    // عرض تعليقات المجموعة
                    <React.Fragment>
                      {entry.priceComments &&
                        entry.priceComments
                          .filter((pc) => !pc.isDeleted)
                          .map((comment, cIndex) => (
                            <Grid item xs={12} key={comment.commentId}>
                              <Paper variant="outlined" sx={{ padding: 2 }}>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                  <TextField
                                    label={`${t('productPriceList.commentName')} ${cIndex + 1}`}
                                    name={`name-${cIndex}`}
                                    value={comment.name}
                                    onChange={(e) =>
                                      handleCommentChange(index, cIndex, 'name', e.target.value)
                                    }
                                    fullWidth
                                    required
                                    variant="outlined"
                                    size="small"
                                  />
                                  <IconButton
                                    aria-label={t('buttons.delete') as string}
                                    onClick={() => handleRemoveComment(index, cIndex)}
                                    color="error"
                                    size="small"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Box>
                              </Paper>
                            </Grid>
                          ))}
                    </React.Fragment>
                  )}

                  {entry.lineType === 3 && (
                    // عرض مجموعة المنتجات
                    <React.Fragment>
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

                      {entry.priceGroups && entry.priceGroups.length > 0 && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>
                            {t('productPriceList.selectedProducts')}
                          </Typography>
                          <Paper variant="outlined" sx={{ padding: 2 }}>
                            <Grid container spacing={2}>
                              {entry.priceGroups.map((sp: SelectedProduct, spIndex: number) => {
                                const productInfo = productPricesMap.get(sp.productPriceId);
                                return (
                                  <Grid item xs={12} sm={6} md={4} key={`${sp.productPriceId}-${spIndex}`}>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                      <Box>
                                        <Typography>
                                          <strong>{t('fields.productName')}:</strong> {productInfo?.productName || 'N/A'}
                                        </Typography>
                                        <Typography>
                                          <strong>{t('fields.priceName')}:</strong> {productInfo?.priceName || 'N/A'}
                                        </Typography>
                                        <Typography>
                                          <strong>{t('fields.price')}:</strong> {productInfo ? productInfo.price.toFixed(2) : '0.00'}
                                        </Typography>
                                      </Box>
                                      {/* زر الحذف الصغير */}
                                      <IconButton
                                        aria-label={t('buttons.delete') as string}
                                        onClick={() => handleDeleteSelectedProduct(index, spIndex)}
                                        size="small"
                                        color="error"
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </Box>
                                  </Grid>
                                );
                              })}
                            </Grid>
                          </Paper>
                        </Grid>
                      )}
                    </React.Fragment>
                  )}
                </Grid>
              </StyledAccordion>
              <Divider />
            </React.Fragment>
          )}
        </React.Fragment>
      ))}

      {visibleProductPrices.length === 0 && (
        <Typography align="center" mt={2}>
          {t('products.noProducts')}
        </Typography>
      )}
    </React.Fragment>
  );
};

export default ProductPriceList;
