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
import { AppState, useSelector } from 'src/store/Store';

interface AddBranchFormProps {
  open: boolean;
  handleClose: () => void;
  onAddBranch: (branch: Partial<Branch>) => Promise<void>; // Updated to return Promise
  companyName: string;
  companyId: string;
}

const AddBranchForm: React.FC<AddBranchFormProps> = ({
  open,
  handleClose,
  companyName,
  companyId,
}) => {
  const [formData, setFormData] = useState<Partial<Branch>>({
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
    // Optional: Add form validation here

    setLoading(true);
    try {
      // Make API call using the centralized Axios instance
      const response = await fetch(`${baseurl}/Branches/AddBranch`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json', // Set content type since sending JSON
        },
        body: JSON.stringify({
          ...formData,
          companyId, // Include companyId in the payload
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add branch.');
      }

      // Optionally, handle response data
      showNotification('Branch added successfully!', 'success', 'Success');

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
      showNotification(error.message || 'Failed to add branch.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Branch</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {/* Company Name - Read-only */}
          <Grid item xs={12}>
            <TextField
              label="Company Name"
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
              label="Branch Code"
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
              label="Branch Name"
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
              label="Country"
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
              label="Governate"
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
              label="Address"
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
              label="Phone Number 1"
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
              label="Phone Number 2"
              name="phoneNo2"
              value={formData.phoneNo2 || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Email"
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
              label="Currency"
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Add Branch'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddBranchForm;
