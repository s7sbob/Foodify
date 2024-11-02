// src/components/Company/EditBranchForm.tsx

import React, { useState, useEffect } from 'react';
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
import { useTranslation } from 'react-i18next';
import { margin } from '@mui/system';
import top100Films from 'src/components/forms/form-elements/autoComplete/data';

interface EditBranchFormProps {
  open: boolean;
  handleClose: () => void;
  branchData: Branch;
  onBranchUpdated: (updatedBranch: Branch) => void;
}

const EditBranchForm: React.FC<EditBranchFormProps> = ({
  open,
  handleClose,
  branchData,
  onBranchUpdated,
}) => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState<Branch>(branchData);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setFormData(branchData);
  }, [branchData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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
      await onBranchUpdated(formData);
      showNotification(
        t('notifications.branchUpdated'),
        'success',
        t('notifications.success') || 'Success'
      );

      // Close the form
      handleClose();
    } catch (error: any) {
      console.error('Error updating branch:', error);
      showNotification(
        error.message || (t('errors.editBranchFailed') || 'Failed to edit branch.'),
        'error',
        t('notifications.error') || 'Error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" >
      <DialogTitle>{t('editBranchForm.editBranch') || 'Edit Branch'}</DialogTitle>
      <DialogContent >
        <Grid container spacing={2} sx={{ marginTop: '0.5%' }}>
          {/* Branch Code */}
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('editBranchForm.branchCode') || 'Branch Code'}
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
              label={t('editBranchForm.branchName') || 'Branch Name'}
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
              label={t('editBranchForm.country') || 'Country'}
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
              label={t('editBranchForm.governate') || 'Governate'}
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
              label={t('editBranchForm.address') || 'Address'}
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
              label={t('editBranchForm.phoneNo1') || 'Phone Number 1'}
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
              label={t('editBranchForm.phoneNo2') || 'Phone Number 2'}
              name="phoneNo2"
              value={formData.phoneNo2 || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('editBranchForm.email') || 'Email'}
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
              label={t('editBranchForm.currency') || 'Currency'}
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
          {loading ? <CircularProgress size={24} /> : (t('editBranchForm.saveChanges') || 'Save Changes')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditBranchForm;
