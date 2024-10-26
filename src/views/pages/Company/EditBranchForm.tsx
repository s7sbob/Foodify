// EditBranchForm.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from '@mui/material';
import { Branch } from '../../../types/companyTypes';



interface EditBranchFormProps {
  open: boolean;
  handleClose: () => void;
  branchData: Branch;
  onBranchUpdated: (updatedBranch: Branch) => void; // Callback with updated branch
}

const EditBranchForm: React.FC<EditBranchFormProps> = ({
  open,
  handleClose,
  branchData,
  onBranchUpdated,
}) => {
  const [formData, setFormData] = useState<Branch>(branchData);
  const [loading] = useState<boolean>(false);

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

  const handleSubmit = () => {
    // Optional: Add form validation here

    // Pass the updated branch data to the parent
    onBranchUpdated(formData);



    // Close the form
    handleClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Branch</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ marginTop: '0.5%' }}>
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
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

    </>
  );
};

export default EditBranchForm;
