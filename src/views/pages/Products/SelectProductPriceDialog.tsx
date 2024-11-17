// src/views/pages/Products/SelectProductPriceDialog.tsx

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  TextField,
  InputAdornment,
  CircularProgress,
  Typography,
  Paper,
  Box,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useSelector } from 'react-redux';
import { AppState } from '../../../store/Store';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';
import { useTranslation } from 'react-i18next';
import { SelectedProduct, ProductPrice } from '../../../types/productTypes';

interface ProductPriceData {
  productId: string;
  productPriceId: string;
  productName: string;
  priceName: string;
  price: number;
  status: boolean;
  errors: any[];
}

interface ProductPriceDataWithKey extends ProductPriceData {
  uniqueKey: string;
}

interface SelectProductPriceDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (selectedProducts: SelectedProduct[]) => void;
}

const SelectProductPriceDialog: React.FC<SelectProductPriceDialogProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const { t } = useTranslation();
  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token = useSelector((state: AppState) => state.auth.token);
  const { showNotification } = useNotification();

  const [productPrices, setProductPrices] = useState<ProductPriceDataWithKey[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (open) {
      fetchProductPrices();
      setSelectedIds(new Set());
      setSearchQuery('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fetchProductPrices = async () => {
    if (!token) {
      showNotification(t('notifications.tokenMissing'), 'error');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<ProductPriceData[]>(`${baseurl}/Product/GetAllProductPrices`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assign a uniqueKey to each product price entry
      const dataWithUniqueKey: ProductPriceDataWithKey[] = response.data.map((pp, index) => ({
        ...pp,
        uniqueKey: `${pp.productPriceId}-${index}`,
      }));

      setProductPrices(dataWithUniqueKey);
    } catch (err) {
      console.error('Error fetching product prices:', err);
      setError(t('notifications.fetchProductPricesFailed'));
      showNotification(t('notifications.fetchProductPricesFailed'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allKeys = filteredProductPrices.map((pp) => pp.uniqueKey);
      setSelectedIds(new Set(allKeys));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (uniqueKey: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(uniqueKey)) {
      newSelected.delete(uniqueKey);
    } else {
      newSelected.add(uniqueKey);
    }
    setSelectedIds(newSelected);
  };

  const handleRowClick = (uniqueKey: string) => {
    handleSelectOne(uniqueKey);
  };

  const handleCancelSelection = () => {
    setSelectedIds(new Set());
    setSearchQuery('');
    onClose(); // Close the dialog
  };

  const handleConfirmSelection = () => {
    const selectedProducts: SelectedProduct[] = Array.from(selectedIds).map((key) => {
      const pp = productPrices.find((pp) => pp.uniqueKey === key);
      return {
        productId: pp?.productId || '',
        productPriceId: pp?.productPriceId || '',
        productName: pp?.productName || '',
        priceName: pp?.priceName || '',
        price: pp?.price || 0,
      };
    });
    onSelect(selectedProducts);
    onClose();
  };

  // Filtered Product Prices based on search query
  const filteredProductPrices = productPrices.filter(
    (pp) =>
      pp.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pp.priceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pp.price.toString().includes(searchQuery)
  );

  const isAllSelected =
    filteredProductPrices.length > 0 &&
    filteredProductPrices.every((pp) => selectedIds.has(pp.uniqueKey));

  const isIndeterminate =
    selectedIds.size > 0 && selectedIds.size < filteredProductPrices.length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('selectProductPriceDialog.title')}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            {/* Search Bar */}
            <TextField
              fullWidth
              variant="outlined"
              placeholder={t('fields.searchPlaceholder') as string} // e.g., "Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {/* Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={isIndeterminate}
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        inputProps={{ 'aria-label': t('selectProductPriceDialog.selectAll') as string }} // "Select All"
                      />
                    </TableCell>
                    <TableCell>{t('fields.productName')}</TableCell>
                    <TableCell>{t('fields.priceName')}</TableCell>
                    <TableCell>{t('fields.price')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProductPrices.map((pp) => {
                    const isItemSelected = selectedIds.has(pp.uniqueKey);
                    return (
                      <TableRow
                        key={pp.uniqueKey}
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        selected={isItemSelected}
                        onClick={(event) => {
                          // Prevent triggering row click when clicking on the checkbox
                          if ((event.target as HTMLElement).nodeName !== 'INPUT') {
                            handleRowClick(pp.uniqueKey);
                          }
                        }}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            onChange={() => handleSelectOne(pp.uniqueKey)}
                            onClick={(e) => e.stopPropagation()} // Prevent row click when clicking checkbox
                            inputProps={{ 'aria-labelledby': `checkbox-${pp.uniqueKey}` }}
                          />
                        </TableCell>
                        <TableCell>{pp.productName}</TableCell>
                        <TableCell>{pp.priceName}</TableCell>
                        <TableCell>{pp.price.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}

                  {filteredProductPrices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        {t('selectProductPriceDialog.noData')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelSelection} color="secondary">
          {t('buttons.cancelSelection')} {/* "Cancel Selection" */}
        </Button>
        <Button
          onClick={handleConfirmSelection}
          color="primary"
          variant="contained"
          disabled={selectedIds.size === 0}
        >
          {t('buttons.confirmSelection')} {/* "Confirm Selection" */}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
  export default SelectProductPriceDialog;

