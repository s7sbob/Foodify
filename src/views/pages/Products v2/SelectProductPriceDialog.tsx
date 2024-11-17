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

interface ProductPriceData {
  productId: string;
  productPriceId: string;
  productName: string;
  priceName: string;
  price: number;
  status: boolean;
  errors: any[];
}

interface SelectProductPriceDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (selectedProducts: SelectedProduct[]) => void;
}

interface SelectedProduct {
  productId: string;
  productPriceId: string;
  quantity: number;
}

const SelectProductPriceDialog: React.FC<SelectProductPriceDialogProps> = ({ open, onClose, onSelect }) => {
  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token = useSelector((state: AppState) => state.auth.token);
  const { showNotification } = useNotification();

  const [productPrices, setProductPrices] = useState<ProductPriceData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (open) {
      fetchProductPrices();
    }
  }, [open]);

  const fetchProductPrices = async () => {
    if (!token) {
      showNotification('يجب تسجيل الدخول لجلب بيانات أسعار المنتجات.', 'error', 'غير مصرح');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<ProductPriceData[]>(`${baseurl}/Product/GetAllProductPrices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductPrices(response.data);
    } catch (err) {
      console.error('Error fetching product prices:', err);
      setError('فشل في جلب أسعار المنتجات.');
      showNotification('فشل في جلب أسعار المنتجات.', 'error', 'خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allIds = productPrices.map((pp) => pp.productPriceId);
      setSelectedIds(new Set(allIds));
      const quantities: Record<string, number> = {};
      allIds.forEach(id => { quantities[id] = 1; });
      setSelectedQuantities(quantities);
    } else {
      setSelectedIds(new Set());
      setSelectedQuantities({});
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
      const newQuantities = { ...selectedQuantities };
      delete newQuantities[id];
      setSelectedQuantities(newQuantities);
    } else {
      newSelected.add(id);
      setSelectedQuantities({
        ...selectedQuantities,
        [id]: 1,
      });
    }
    setSelectedIds(newSelected);
  };

  const handleCancelSelection = () => {
    setSelectedIds(new Set());
    setSelectedQuantities({});
  };

  const handleConfirmSelection = () => {
    const selectedProducts = Array.from(selectedIds).map((id) => {
      const pp = productPrices.find((pp) => pp.productPriceId === id);
      return {
        productId: pp?.productId || '',
        productPriceId: pp?.productPriceId || '',
        quantity: selectedQuantities[id] || 1,
      };
    });
    onSelect(selectedProducts);
    onClose();
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    setSelectedQuantities({
      ...selectedQuantities,
      [id]: quantity >= 1 ? quantity : 1,
    });
  };

  // Filtered Product Prices based on search query
  const filteredProductPrices = productPrices.filter(
    (pp) =>
      pp.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pp.priceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pp.price.toString().includes(searchQuery)
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>اختيار أسعار المنتجات</DialogTitle>
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
              placeholder="بحث..."
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
                        indeterminate={selectedIds.size > 0 && selectedIds.size < productPrices.length}
                        checked={productPrices.length > 0 && selectedIds.size === productPrices.length}
                        onChange={handleSelectAll}
                        inputProps={{ 'aria-label': 'select all product prices' }}
                      />
                    </TableCell>
                    <TableCell>اسم المنتج</TableCell>
                    <TableCell>اسم السعر</TableCell>
                    <TableCell>السعر</TableCell>
                    <TableCell>الكمية</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProductPrices.map((pp) => (
                    <TableRow key={pp.productPriceId} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedIds.has(pp.productPriceId)}
                          onChange={() => handleSelectOne(pp.productPriceId)}
                          inputProps={{ 'aria-labelledby': `checkbox-${pp.productPriceId}` }}
                        />
                      </TableCell>
                      <TableCell>{pp.productName}</TableCell>
                      <TableCell>{pp.priceName}</TableCell>
                      <TableCell>{pp.price.toFixed(2)}</TableCell>
                      <TableCell>
                        {selectedIds.has(pp.productPriceId) && (
                          <TextField
                            type="number"
                            variant="outlined"
                            size="small"
                            value={selectedQuantities[pp.productPriceId] || 1}
                            onChange={(e) => handleQuantityChange(pp.productPriceId, parseInt(e.target.value))}
                            inputProps={{ min: 1 }}
                            sx={{ width: '80px' }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredProductPrices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        لا توجد بيانات لعرضها.
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
          إلغاء التحديد
        </Button>
        <Button
          onClick={handleConfirmSelection}
          color="primary"
          variant="contained"
          disabled={selectedIds.size === 0}
        >
          تأكيد
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectProductPriceDialog;
