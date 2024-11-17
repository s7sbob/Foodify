// src/views/pages/Products/components/ProductPriceList.tsx

import React, { useRef, useEffect, useState } from 'react';
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

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const inputRefs = useRef<{ [key: number]: React.RefObject<HTMLInputElement> }>({});

  // تتبع الطول السابق لاكتشاف إضافة إدخالات جديدة
  const prevLengthRef = useRef<number>(productPrices.length);

  useEffect(() => {
    if (productPrices.length > prevLengthRef.current) {
      const newIndex = productPrices.length - 1;
      setExpandedIndex(newIndex);
    }
    prevLengthRef.current = productPrices.length;
  }, [productPrices.length]);

  useEffect(() => {
    if (expandedIndex !== null) {
      const ref = inputRefs.current[expandedIndex];
      if (ref && ref.current) {
        ref.current.focus();
      }
    }
  }, [expandedIndex]);

  const handleAccordionChange = (index: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedIndex(isExpanded ? index : null);
  };

  return (
    <>
      {productPrices.map((entry, index) => (
        <React.Fragment key={entry.productPriceId}>
          {entry.lineType === 1 ? (
            <ProductPriceEntry
              entry={entry}
              index={index}
              handleEntryChange={handleEntryChange}
              handleRemoveEntry={handleRemoveEntry}
              autoFocus={index === productPrices.length - 1}
            />
          ) : (
            <>
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
                {/* المحتويات بناءً على lineType */}
                <Grid container spacing={2}>
                  {entry.lineType === 2 && (
                    <>
                      {/* عرض التعليقات */}
                      {entry.priceComments &&
                        entry.priceComments.map((comment, cIndex) => (
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
                                  sx={{ mr: 1 }}
                                  inputRef={
                                    cIndex === 0 && index === productPrices.length - 1
                                      ? (inputRefs.current[index] =
                                          inputRefs.current[index] || React.createRef<HTMLInputElement>())
                                      : undefined
                                  }
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
                    </>
                  )}

                  {entry.lineType === 3 && (
                    <>
                      {/* الكمية المراد تحديدها */}
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
                          inputRef={
                            index === productPrices.length - 1
                              ? (inputRefs.current[index] =
                                  inputRefs.current[index] || React.createRef<HTMLInputElement>())
                              : undefined
                          }
                        />
                      </Grid>

                      {/* نوع سعر المجموعة */}
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

                      {/* زر اختيار المنتجات */}
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

                      {/* سعر المجموعة (إذا كان نوع السعر 'يدوي') */}
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
      {/* يمكنك إضافة معالجة عندما لا تكون هناك productPrices */}
    </>
  );
};

export default ProductPriceList;
