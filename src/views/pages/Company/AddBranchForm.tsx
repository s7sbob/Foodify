// src/components/Company/AddBranchForm.tsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
} from '@mui/material';
import { Branch } from '../../../types/companyTypes';
import { useNotification } from '../../../context/NotificationContext';
import { useSelector } from 'react-redux';
import { AppState } from '../../../store/Store';
import { useTranslation } from 'react-i18next';

// 1. Define a new interface for the form data
interface AddBranchFormData {
  branchCode: number;
  branchName: string;
  country: string;
  governate: string;
  address: string;
  phoneNo1: string;
  phoneNo2?: string;
  email: string;
  currency: string;
}

interface AddBranchFormProps {
  open: boolean;
  handleClose: () => void;
  onAddBranch: (branch: AddBranchFormData) => Promise<void>; // Update the type accordingly
  companyName: string;
  companyId: string;
}

const AddBranchForm: React.FC<AddBranchFormProps> = ({
  open,
  handleClose,
  companyName,
  companyId,
  onAddBranch,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<AddBranchFormData>({
    branchCode: 0,
    branchName: '',
    country: '',
    governate: '',
    address: '',
    phoneNo1: '',
    phoneNo2: '',
    email: '',
    currency: 'LE',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const { showNotification } = useNotification();
  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token = useSelector((state: AppState) => state.auth.token);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = async () => {
    // Basic Validation
    if (!formData.branchName.trim() || !formData.branchCode) {
      showNotification(
        t('errors.fillAllFields') || 'Please fill in all required fields.',
        'warning',
        t('notifications.incompleteData') || 'Incomplete Data'
      );
      return;
    }

    setLoading(true);
    try {
      await onAddBranch(formData);
      showNotification(
        t('notifications.branchAdded') || 'Branch added successfully!',
        'success',
        t('notifications.success') || 'Success'
      );

      // Reset form
      setFormData({
        branchCode: 0,
        branchName: '',
        country: '',
        governate: '',
        address: '',
        phoneNo1: '',
        phoneNo2: '',
        email: '',
        currency: 'LE',
      });

      // Close the form
      handleClose();
    } catch (error: any) {
      console.error('Error adding branch:', error);
      showNotification(
        error.message || (t('errors.addBranchFailed') || 'Failed to add branch.'),
        'error',
        t('notifications.error') || 'Error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('addBranchForm.addNewBranch') || 'Add New Branch'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ marginTop: '0.5%' }}>
          {/* Company Name - Read-only */}
          <Grid item xs={12}>
            <TextField
              label={t('addBranchForm.companyName') || 'Company Name'}
              value={companyName}
              fullWidth
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
          </Grid>

          {/* Branch Code */}
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('addBranchForm.branchCode') || 'Branch Code'}
              name="branchCode"
              type="number"
              value={formData.branchCode}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          {/* Branch Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('addBranchForm.branchName') || 'Branch Name'}
              name="branchName"
              value={formData.branchName}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          {/* Country */}
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('addBranchForm.country') || 'Country'}
              name="country"
              value={formData.country}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          {/* Governate */}
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('addBranchForm.governate') || 'Governate'}
              name="governate"
              value={formData.governate}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          {/* Address */}
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('addBranchForm.address') || 'Address'}
              name="address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          {/* Phone Number 1 */}
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('addBranchForm.phoneNo1') || 'Phone Number 1'}
              name="phoneNo1"
              value={formData.phoneNo1}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          {/* Phone Number 2 */}
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('addBranchForm.phoneNo2') || 'Phone Number 2'}
              name="phoneNo2"
              value={formData.phoneNo2 || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('addBranchForm.email') || 'Email'}
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          {/* Currency */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="currency"
              value={formData.currency}
              label={t('addBranchForm.currency') || 'Currency'}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" disabled={loading}>
          {t('buttons.cancel') || 'Cancel'}
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : (t('buttons.addBranch') || 'Add Branch')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBranchForm;
