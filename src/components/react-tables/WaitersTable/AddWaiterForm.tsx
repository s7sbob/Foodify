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
  Typography,
} from '@mui/material';
import CustomFormLabel from '../../forms/theme-elements/CustomFormLabel';
import { IconUser } from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { AppState } from 'src/store/Store';
import { CompanyData } from 'src/types/companyTypes';

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
  const token =
    useSelector((state: AppState) => state.auth.token) ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('authToken');
  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);

  // Assuming there's only one company
  const currentCompany = companies[0];

  // State for form fields
  const [waiterName, setWaiterName] = useState('');
  const [companyId, setCompanyId] = useState(currentCompany.companyId);
  const [branchId, setBranchId] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Derived state for branches based on selected company
  const branches = currentCompany ? currentCompany.branches : [];

  // Auto-select the company when form opens
  useEffect(() => {
    if (open && companies.length > 0) {
      setCompanyId(currentCompany.companyId);
    }
  }, [open, companies, currentCompany]);

  // Reset branch selection when company changes (not necessary here since company is fixed)
  // But keeping it in case of future scalability
  useEffect(() => {
    setBranchId(''); // Set branchId to empty when company changes
  }, [companyId]);

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
      if (!waiterName || !companyId || !branchId) {
        setError('Waiter Name and Branch are required.');
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
        // status: true, // Removed status
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
        setSuccessMessage('Waiter added successfully.');
        setError('');

        if (closeForm) {
          resetAllFields();
          handleClose();
        } else {
          resetFieldsExceptCompany();
        }
      } catch (error: any) {
        console.error('Failed to add waiter:', error);
        setError(error.message || 'Failed to add waiter. Please try again.');
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
    ]
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Waiter</DialogTitle>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(true); // Default to closing the form
          }}
        >
          <FormControl fullWidth margin="normal">
            <CustomFormLabel htmlFor="waiterName">Waiter Name</CustomFormLabel>
            <OutlinedInput
              startAdornment={
                <InputAdornment position="start">
                  <IconUser width={20} />
                </InputAdornment>
              }
              id="waiterName"
              placeholder="Waiter Name"
              value={waiterName}
              onChange={(e) => setWaiterName(e.target.value)}
              required
            />
          </FormControl>

          {/* Company is auto-assigned, display it as read-only */}
          <FormControl fullWidth margin="normal">
            <CustomFormLabel>Company</CustomFormLabel>
            <Typography variant="body1">{currentCompany.companyName}</Typography>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="branch-label">Branch</InputLabel>
            <Select
              labelId="branch-label"
              id="branchId"
              value={branchId}
              label="Branch"
              onChange={(e) => setBranchId(e.target.value)}
              required
            >
              <MenuItem value="">
                <em>Select a branch</em>
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
          Cancel
        </Button>

        <Button onClick={() => handleSubmit(true)} color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Wrap the component with React.memo to prevent unnecessary re-renders
export default React.memo(AddWaiterForm);
