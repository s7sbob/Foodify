// src/components/Waiters/EditWaiterForm.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  FormControl,
  InputAdornment,
  OutlinedInput,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  Typography,
} from '@mui/material';
import CustomFormLabel from '../../forms/theme-elements/CustomFormLabel';
import { IconUser } from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { AppState } from 'src/store/Store';
import { EnhancedWaiter } from 'src/types/Waiter';
import { CompanyData } from 'src/types/companyTypes';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { useNotification } from '../../../context/NotificationContext'; // Import the hook

interface EditWaiterFormProps {
  open: boolean;
  handleClose: () => void;
  waiter: EnhancedWaiter;
  onWaiterUpdated: () => void;
  companies: CompanyData[]; // Receive companies as prop
}

const EditWaiterForm: React.FC<EditWaiterFormProps> = ({
  open,
  handleClose,
  waiter,
  onWaiterUpdated,
  companies,
}) => {
  const { t } = useTranslation(); // Initialize translation hook
  const { showNotification } = useNotification(); // Use the notification hook

  const token =
    useSelector((state: AppState) => state.auth.token) ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('authToken');
  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);

  // Assuming there's only one company
  const currentCompany = companies[0];

  // State for form fields
  const [waiterName, setWaiterName] = useState<string>(waiter.waiterName);
  const [companyId, setCompanyId] = useState<string | number>(currentCompany.companyId);
  const [branchId, setBranchId] = useState<string | number>(waiter.branchId);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Derived state for branches based on selected company
  const branches = currentCompany ? currentCompany.branches : [];

  // Update form fields when waiter changes
  useEffect(() => {
    if (open) {
      setWaiterName(waiter.waiterName);
      setCompanyId(currentCompany.companyId);
      setBranchId(waiter.branchId);
      setError('');
      setSuccessMessage('');
    }
  }, [open, waiter, currentCompany]);

  // Reset branch selection when company changes (not necessary here since company is fixed)
  useEffect(() => {
    if (!currentCompany.branches.some(branch => branch.branchId === branchId)) {
      setBranchId('');
    }
  }, [companyId, currentCompany.branches, branchId]);

  // Reset functions
  const resetFieldsExceptCompany = useCallback(() => {
    setWaiterName('');
    setBranchId('');
    setError('');
    setSuccessMessage('');
  }, []);

  const resetAllFields = useCallback(() => {
    setWaiterName('');
    setBranchId('');
    setError('');
    setSuccessMessage('');
  }, []);

  const handleSubmit = useCallback(
    async (closeForm: boolean) => {
      // Validate input
      if (!waiterName || !branchId) {
        setError(t('errors.waiterNameRequired') || 'Waiter Name and Branch are required.');
        setSuccessMessage('');
        return;
      }

      const url = `${baseurl}/PosWaiter/UpdateWaiter`;
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const payload = {
        waiterId: waiter.waiterId,
        waiterName,
        branchId,
        companyId,
        // status: waiter.status, // Removed status
      };

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Network error');
        }

        // Handle success
        onWaiterUpdated(); // Refresh the table
        setSuccessMessage(t('alerts.waiterUpdatedSuccess') || 'Waiter updated successfully.');
        setError('');

        if (closeForm) {
          resetAllFields();
          handleClose();
        } else {
          resetFieldsExceptCompany();
        }
      } catch (error: any) {
        console.error('Failed to update waiter:', error);
        setError(error.message || t('errors.submitFailed') || 'Failed to update waiter. Please try again.');
        setSuccessMessage('');
      }
    },
    [
      waiterName,
      companyId,
      branchId,
      baseurl,
      token,
      waiter.waiterId,
      onWaiterUpdated,
      resetAllFields,
      resetFieldsExceptCompany,
      handleClose,
      t,
    ]
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('buttons.update') || 'Edit Waiter'}</DialogTitle>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(true); // Default to closing the form
          }}
        >
          <FormControl fullWidth margin="normal">
            <CustomFormLabel htmlFor="waiterName">{t('addWaiterForm.waiterName') || 'Waiter Name'}</CustomFormLabel>
            <OutlinedInput
              startAdornment={
                <InputAdornment position="start">
                  <IconUser width={20} />
                </InputAdornment>
              }
              id="waiterName"
              placeholder={t('addWaiterForm.waiterNamePlaceholder') || 'Waiter Name'}
              value={waiterName}
              onChange={(e) => setWaiterName(e.target.value)}
              required
            />
          </FormControl>

          {/* Company is auto-assigned, display it as read-only */}
          <FormControl fullWidth margin="normal">
            <CustomFormLabel>{t('addWaiterForm.company') || 'Company'}</CustomFormLabel>
            <Typography variant="body1">{currentCompany.companyName}</Typography>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="branch-label">{t('addWaiterForm.branch') || 'Branch'}</InputLabel>
            <Select
              labelId="branch-label"
              id="branchId"
              value={branchId}
              label={t('addWaiterForm.branch') || 'Branch'}
              onChange={(e) => setBranchId(e.target.value)}
              required
            >
              <MenuItem value="">
                <em>{t('waitersTable.selectBranch') || 'Select a branch'}</em>
              </MenuItem>
              {branches.map((branch) => (
                <MenuItem key={branch.branchId} value={branch.branchId}>
                  {branch.branchName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </form>

        {/* Display error message */}
        {error && (
          <Alert severity="error" style={{ marginTop: '10px' }}>
            {error}
          </Alert>
        )}
        {/* Display success message */}
        {successMessage && (
          <Alert severity="success" style={{ marginTop: '10px' }}>
            {successMessage}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="error">
          {t('buttons.cancel') || 'Cancel'}
        </Button>
        <Button onClick={() => handleSubmit(false)} color="primary">
          {t('buttons.update') || 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Wrap the component with React.memo to prevent unnecessary re-renders
export default React.memo(EditWaiterForm);
