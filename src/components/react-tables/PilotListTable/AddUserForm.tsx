// src/components/Pilots/AddUserForm.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { AppState } from 'src/store/Store';
import { PilotTableData, Branch } from './types';

interface AddUserFormProps {
  open: boolean;
  handleClose: () => void;
  onUserAdded: () => void; // Callback after adding/updating a user
  pilotToEdit?: PilotTableData | null; // Optional prop for editing a pilot
  companyId: string; // Added prop for auto-assigned companyId
}

const AddUserForm: React.FC<AddUserFormProps> = ({ open, handleClose, onUserAdded, pilotToEdit, companyId }) => {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [branchId, setBranchId] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);

  const [branches, setBranches] = useState<Branch[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token =
    useSelector((state: AppState) => state.auth.token) ||
    localStorage.getItem('token');

  // Fetch Branches Based on companyId
  useEffect(() => {
    const fetchBranches = async () => {
      if (!companyId) return;

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${baseurl}/Company/GetCompanyData`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const companyData = Array.isArray(response.data) ? response.data : [response.data];
        const selectedCompany = companyData.find(c => c.companyId === companyId);
        setBranches(selectedCompany?.branches || []);
      } catch (err: any) {
        console.error('Error fetching branches:', err);
        setError('Failed to fetch branches.');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchBranches();
    }
  }, [open, baseurl, companyId, token]);

  // Populate Form for Editing
  useEffect(() => {
    if (pilotToEdit) {
      setName(pilotToEdit.name);
      setPhone(pilotToEdit.phone);
      setBranchId(pilotToEdit.branchId);
      setIsActive(pilotToEdit.isActive);
    } else {
      // Reset form fields if adding a new pilot
      setName('');
      setPhone('');
      setBranchId('');
      setIsActive(true);
    }
  }, [pilotToEdit]);

  // Handle Form Submission
  const handleSubmit = async () => {
    // Basic Validation
    if (!name.trim() || !phone.trim() || !branchId) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const pilotData: Partial<PilotTableData> = {
        name: name.trim(),
        phone: phone.trim(),
        branchId,
        isActive,
        companyId, // Auto-assign companyId
      };

      if (pilotToEdit) {
        // Update Pilot
        await axios.post(`${baseurl}/PosPilot/UpdatePilot`, { ...pilotData, pilotId: pilotToEdit.pilotId }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } else {
        // Create Pilot
        await axios.post(`${baseurl}/PosPilot/CreatePilot`, pilotData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      onUserAdded(); // Refresh the pilot list
      handleClose(); // Close the modal
    } catch (err: any) {
      console.error('Error submitting pilot data:', err);
      // Attempt to extract error message from response
      const apiError = err.response?.data?.message || 'Failed to submit pilot data.';
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{pilotToEdit ? 'Edit Pilot' : 'Add Pilot'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ marginTop: '0.5%' }}>
            {/* Name Field */}
            <Grid item xs={12}>
              <TextField
                label="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                fullWidth
                required
              />
            </Grid>

            {/* Phone Field */}
            <Grid item xs={12}>
              <TextField
                label="Phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                fullWidth
                required
                inputProps={{ maxLength: 15 }}
              />
            </Grid>

            {/* Branch Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth required disabled={!companyId || branches.length === 0 || loading}>
                <InputLabel id="branch-select-label">Branch</InputLabel>
                <Select
                  labelId="branch-select-label"
                  value={branchId}
                  label="Branch"
                  onChange={e => setBranchId(e.target.value)}
                >
                  {branches.map(branch => (
                    <MenuItem key={branch.branchId} value={branch.branchId}>
                      {branch.branchName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Is Active Checkbox */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                  />
                }
                label="Is Active"
              />
            </Grid>

            {/* Display Error if Any */}
            {error && (
              <Grid item xs={12}>
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
            {pilotToEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddUserForm;
