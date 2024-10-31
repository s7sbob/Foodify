// src/components/Waiters/AddWaiterForm.tsx

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
} from '@mui/material';
import CustomFormLabel from '../../forms/theme-elements/CustomFormLabel';
import { IconUser } from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { AppState } from 'src/store/Store';
import { CompanyData } from 'src/types/companyTypes';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { useNotification } from '../../../context/NotificationContext'; // Import the hook

interface AddWaiterFormProps {
  open: boolean;
  handleClose: () => void;
  onWaiterAdded: () => void;
  companies: CompanyData[]; // Receive companies as prop
}

const AddWaiterForm: React.FC<AddWaiterFormProps> = ({
  open,
  handleClose,
  onWaiterAdded,
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
  const [waiterName, setWaiterName] = useState('');
  const [companyId] = useState(currentCompany.companyId);
  const [branchId, setBranchId] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Derived state for branches based on selected company
  const branches = currentCompany ? currentCompany.branches : [];

  // Auto-select the branch when form opens
  useEffect(() => {
    if (open && branches.length > 0) {
      setBranchId(branches[0].branchId);
    }
  }, [open, branches]);

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

      const url = `${baseurl}/PosWaiter/CreateWaiter`;
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const payload = {
        waiterName,
        branchId,
        companyId,
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
        onWaiterAdded(); // Refresh the table
        setSuccessMessage(t('alerts.waiterAddedSuccess') || 'Waiter added successfully.');
        setError('');

        if (closeForm) {
          resetAllFields();
          handleClose();
        } else {
          resetFieldsExceptCompany();
        }
      } catch (error: any) {
        console.error('Failed to add waiter:', error);
        setError(error.message || t('errors.submitFailed') || 'Failed to add waiter. Please try again.');
        setSuccessMessage('');
      }
    },
    [
      waiterName,
      companyId,
      branchId,
      baseurl,
      token,
      onWaiterAdded,
      resetAllFields,
      resetFieldsExceptCompany,
      handleClose,
      t,
    ]
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('buttons.addWaiter') || 'Add Waiter'}</DialogTitle>
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

        <Button onClick={() => handleSubmit(true)} color="primary">
          {t('buttons.create') || 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Wrap the component with React.memo to prevent unnecessary re-renders
export default React.memo(AddWaiterForm);
