// src/views/pages/Products/ProductsPage.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Collapse,
  Divider,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AddProductForm, { AddProductFormRef } from './AddProductForm';
import EditProductForm, { EditProductFormRef } from './EditProductForm';
import { useNotification } from '../../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppState } from '../../../store/Store';
import { PriceComment, Product, ProductPrice } from '../../../types/productTypes';
import axios from 'axios';
import { getProductGroups, getPosScreens, deleteProduct } from '../../../services/apiService';
import SelectProductPriceDialog from './SelectProductPriceDialog';
import StyledAccordion from './StyledAccordion';
import { v4 as uuidv4 } from 'uuid';


const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productPrices, setProductPrices] = useState<ProductPrice[]>([]); // حالة الأسطر الناتجة
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token = useSelector((state: AppState) => state.auth.token);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const navigate = useNavigate();

  // Additional Data
  const [allProductGroups, setAllProductGroups] = useState<any[]>([]);
  const [allPosScreens, setAllPosScreens] = useState<any[]>([]);

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Toggle Products Table
  const [showProductsTable, setShowProductsTable] = useState<boolean>(false);

  const fetchAdditionalData = async () => {
    if (!token) return;
    try {
      const groups = await getProductGroups(baseurl, token);
      setAllProductGroups(groups);

      const screens = await getPosScreens(baseurl, token);
      setAllPosScreens(screens);
    } catch (error) {
      console.error('Error fetching additional data:', error);
      showNotification('فشل في جلب البيانات الإضافية.', 'error', 'خطأ');
    }
  };

  const fetchProducts = async () => {
    if (!token) {
      showNotification('يجب تسجيل الدخول لعرض المنتجات.', 'error', 'غير مصرح');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get<Product[]>(`${baseurl}/Product/GetProducts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('فشل في جلب المنتجات.');
      showNotification('فشل في جلب المنتجات.', 'error', 'خطأ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchAdditionalData();
  }, [token]);

  // Handle Edit Product
  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setProductPrices(product.productPrices || []); // تحميل الأسطر الموجودة في المنتج إلى الحالة
  };

  // Handle Delete Product
  const handleDeleteProduct = async (productId?: string) => {
    if (!token) {
      showNotification('يجب تسجيل الدخول لإجراء هذه العملية.', 'error', 'غير مصرح');
      navigate('/login');
      return;
    }

    if (!productId) {
      showNotification('معرف المنتج غير موجود.', 'error', 'خطأ');
      return;
    }

    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا المنتج؟')) {
      return;
    }

    setLoading(true);
    try {
      await deleteProduct(baseurl, token, productId);
      showNotification('تم حذف المنتج بنجاح!', 'success', 'نجاح');
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      showNotification('فشل في حذف المنتج.', 'error', 'خطأ');
    } finally {
      setLoading(false);
    }
  };

  // Filtered Products based on Search Query
  const filteredProducts = products.filter((product) =>
    product.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    allProductGroups
      .find((group) => group.groupId === product.productGroupId)
      ?.groupName.toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    (product.posScreenId
      ? allPosScreens
          .find((screen) => screen.screenId === product.posScreenId)
          ?.screenName.toLowerCase()
          .includes(searchQuery.toLowerCase())
      : 'لا يوجد'.includes(searchQuery.toLowerCase()))
  );

  // Reset Forms
  const addProductFormRef = useRef<AddProductFormRef>(null);
  const editProductFormRef = useRef<EditProductFormRef>(null);

  const handleResetForm = () => {
    if (addProductFormRef.current) {
      addProductFormRef.current.resetForm();
    }
    if (editProductFormRef.current) {
      editProductFormRef.current.resetForm();
    }
    setProductToEdit(null);
    setProductPrices([]);
  };

  // Handlers for productPrices
  const handleAddEntry = (lineType: number) => {
    let newEntry: ProductPrice = {
      productPriceId: uuidv4(),
      lineType,
      branchId: '', // سيتم تعيينها من النموذج
      companyId: '', // سيتم تعيينها من النموذج
      status: true,
    };

    switch (lineType) {
      case 1: // price
        newEntry.productPriceName = '';
        newEntry.price = 0.0;
        break;
      case 2: // commentGroup
        newEntry.priceComments = [];
        break;
      case 3: // groupProduct
        newEntry.qtyToSelect = 1.0;
        newEntry.groupPriceType = 1;
        newEntry.groupPrice = 0.0;
        newEntry.priceGroups = [];
        break;
      default:
        break;
    }

    setProductPrices((prev) => [...prev, newEntry]);
  };

  const handleRemoveEntry = (index: number) => {
    setProductPrices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEntryChange = (index: number, field: keyof ProductPrice, value: any) => {
    const updatedPrices = [...productPrices];
    updatedPrices[index] = {
      ...updatedPrices[index],
      [field]: value,
    };
    setProductPrices(updatedPrices);
  };

  const handleAddComment = (priceIndex: number) => {
    const newComment: PriceComment = {
      commentId: uuidv4(),
      name: '',
      description: '',
      productPriceId: productPrices[priceIndex].productPriceId,
      branchId: '', // سيتم تعيينها من النموذج
      companyId: '', // سيتم تعيينها من النموذج
      status: true,
      errors: [],
    };
    const updatedPrices = [...productPrices];
    updatedPrices[priceIndex].priceComments = [
      ...(updatedPrices[priceIndex].priceComments || []),
      newComment,
    ];
    setProductPrices(updatedPrices);
  };

  const handleRemoveComment = (priceIndex: number, commentIndex: number) => {
    const updatedPrices = [...productPrices];
    updatedPrices[priceIndex].priceComments = updatedPrices[priceIndex].priceComments?.filter(
      (_, i) => i !== commentIndex
    );
    setProductPrices(updatedPrices);
  };

  const handleCommentChange = (
    priceIndex: number,
    commentIndex: number,
    field: keyof PriceComment,
    value: string
  ) => {
    const updatedPrices = [...productPrices];
    const updatedComments = updatedPrices[priceIndex].priceComments?.map((comment, i) =>
      i === commentIndex ? { ...comment, [field]: value } : comment
    );
    updatedPrices[priceIndex].priceComments = updatedComments;
    setProductPrices(updatedPrices);
  };

  // Handle SelectProductPriceDialog (if applicable)
  const [openSelectDialog, setOpenSelectDialog] = useState<boolean>(false);
  const [currentGroupPriceIndex, setCurrentGroupPriceIndex] = useState<number | null>(null);

  const handleOpenSelectDialog = (index: number) => {
    setCurrentGroupPriceIndex(index);
    setOpenSelectDialog(true);
  };

  const handleCloseSelectDialog = () => {
    setOpenSelectDialog(false);
    setCurrentGroupPriceIndex(null);
  };

  const handleSelectProductPrices = (selectedProducts: any[]) => {
    if (currentGroupPriceIndex === null) return;

    const updatedPrices = [...productPrices];
    updatedPrices[currentGroupPriceIndex].priceGroups = selectedProducts.map((product: any) => ({
      productId: product.productId,
      productPriceId: product.productPriceId,
      quantity: product.quantity,
    }));

    setProductPrices(updatedPrices);
    handleCloseSelectDialog();
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header with Title and Buttons */}
      <Grid container alignItems="center" justifyContent="space-between" spacing={2} mb={2}>
        <Grid item>
          <Typography variant="h4" gutterBottom>
            المنتجات
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              if (productToEdit) {
                editProductFormRef.current?.submitForm();
              } else {
                addProductFormRef.current?.submitForm();
              }
            }}
            sx={{ mr: 2 }}
          >
            {productToEdit ? 'حفظ التغييرات' : 'حفظ المنتج'}
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleResetForm}
            startIcon={<DeleteIcon />}
          >
            البدء من جديد
          </Button>
        </Grid>
      </Grid>

      {/* Products Button to toggle table */}
      <Box mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowProductsTable(!showProductsTable)}
        >
          المنتجات
        </Button>
        <Collapse in={showProductsTable}>
          {/* Products Table */}
          <Box mt={2}>
            {loading ? (
              <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>اسم المنتج</TableCell>
                      <TableCell>اسم المجموعة</TableCell>
                      <TableCell>الشاشة</TableCell>
                      <TableCell>الإجراءات</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProducts.map((product) =>
                      product.productId ? (
                        <TableRow key={product.productId}>
                          <TableCell>{product.productName}</TableCell>
                          <TableCell>
                            {allProductGroups.find(
                              (group) => group.groupId === product.productGroupId
                            )?.groupName || 'غير معروف'}
                          </TableCell>
                          <TableCell>
                            {product.posScreenId
                              ? allPosScreens.find(
                                  (screen) => screen.screenId === product.posScreenId
                                )?.screenName || 'غير معروف'
                              : 'لا يوجد'}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color="primary"
                              aria-label="Edit"
                              onClick={() => handleEditProduct(product)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="secondary"
                              aria-label="Delete"
                              onClick={() => handleDeleteProduct(product.productId)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ) : (
                        // Handle case where productId is undefined
                        <TableRow key={`undefined-${Math.random()}`}>
                          <TableCell colSpan={4} align="center">
                            بيانات منتج غير صحيحة (معرف المنتج مفقود).
                          </TableCell>
                        </TableRow>
                      )
                    )}

                    {filteredProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          لا توجد منتجات لعرضها.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Collapse>
      </Box>

 {/* Main Content */}
 <Grid container spacing={2}>
        {/* Left Side: Add/Edit Form */}
        <Grid item xs={12} md={6}>
          {productToEdit ? (
            <EditProductForm
              productData={productToEdit}
              onProductUpdated={() => {
                fetchProducts();
                setProductToEdit(null);
                setProductPrices([]);
              }}
              onCancel={() => {
                setProductToEdit(null);
                setProductPrices([]);
              }}
              ref={editProductFormRef}
              productPrices={productPrices}
              setProductPrices={setProductPrices}
              handleAddEntry={handleAddEntry}
            />
          ) : (
            <AddProductForm
              onProductAdded={() => {
                fetchProducts();
                setProductPrices([]);
              }}
              ref={addProductFormRef}
              productPrices={productPrices}
              setProductPrices={setProductPrices}
              handleAddEntry={handleAddEntry}
            />
          )}
        </Grid>

        {/* Right Side: Display Entries */}
        <Grid item xs={12} md={6}>
          {/* عرض الأسطر الناتجة */}
          {productPrices.map((entry, index) => (
            <React.Fragment key={entry.productPriceId}>
              {entry.lineType === 1 ? (
                // Fixed form for lineType 1 (Price)
                <Paper variant="outlined" sx={{ padding: 2, marginTop: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    {/* اسم السعر */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label={`اسم السعر ${index + 1}`}
                        name="productPriceName"
                        value={entry.productPriceName || ''}
                        onChange={(e) => handleEntryChange(index, 'productPriceName', e.target.value)}
                        fullWidth
                        required
                      />
                    </Grid>
                    {/* السعر */}
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label={`السعر ${index + 1}`}
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
                    {/* زر حذف الإدخال */}
                    <Grid item xs={12} sm={2}>
                      <IconButton
                        aria-label="delete-entry"
                        onClick={() => handleRemoveEntry(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ) : (
                // StyledAccordion for other lineTypes
                <>
                  <StyledAccordion
                    title={
<Box
  display="flex"
  alignItems="center"
  justifyContent="space-between"
  width="100%"
>

                        {/* النص */}
                        <Typography variant="subtitle1" sx={{ mr: 1 }}>
                          {entry.lineType === 2
                            ? `مجموعة تعليقات ${index + 1}`
                            : `منتجات المجموعة ${index + 1}`}
                        </Typography>

                         {/* زر الحذف على اليسار */}
                          <IconButton 
                          aria-label="delete-entry"
                          onClick={() => handleRemoveEntry(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
                    {/* المحتوى يبقى كما هو */}
                    <Grid container spacing={2}>
                      {/* حقل بناءً على lineType */}
                      {entry.lineType === 2 && (
                        <>
                          {/* زر إضافة تعليق */}
                          <Grid item xs={12}>
                            <Button
                              variant="outlined"
                              startIcon={<AddIcon />}
                              onClick={() => handleAddComment(index)}
                              fullWidth
                            >
                              إضافة تعليق
                            </Button>
                          </Grid>
                          {/* عرض التعليقات */}
                          {entry.priceComments &&
                            entry.priceComments.map((comment, cIndex) => (
                              <Grid item xs={12} key={comment.commentId}>
                                <Paper
                                  variant="outlined"
                                  sx={{ padding: 2, position: 'relative' }}
                                >
                                  <IconButton
                                    aria-label="delete-comment"
                                    onClick={() => handleRemoveComment(index, cIndex)}
                                    color="error"
                                    size="small"
                                    sx={{ position: 'absolute', top: 8, right: 8 }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                  <Typography variant="subtitle1" color="textSecondary">
                                    تعليق {cIndex + 1}
                                  </Typography>
                                  <TextField
                                    label="اسم التعليق *"
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
                                    label="الوصف *"
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
                          {/* كمية الاختيار */}
                          <Grid item xs={12} sm={4}>
                            <TextField
                              label="كمية الاختيار"
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
                          {/* نوع سعر المجموعة */}
                          <Grid item xs={12} sm={4}>
                            <TextField
                              select
                              label="نوع سعر المجموعة"
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
                              <MenuItem value={1}>zero</MenuItem>
                              <MenuItem value={2}>asproduct</MenuItem>
                              <MenuItem value={3}>manual</MenuItem>
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
                              اختيار المنتجات
                            </Button>
                          </Grid>
                          {/* سعر المجموعة فقط إذا كان النوع 'manual' */}
                          {entry.groupPriceType === 3 && (
                            <Grid item xs={12} sm={4}>
                              <TextField
                                label="سعر المجموعة"
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

          {/* SelectProductPriceDialog */}
          {currentGroupPriceIndex !== null && (
            <SelectProductPriceDialog
              open={openSelectDialog}
              onClose={handleCloseSelectDialog}
              onSelect={handleSelectProductPrices}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductsPage;
