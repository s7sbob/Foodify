// src/components/Zones/AddZoneForm.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { AppState } from 'src/store/Store';
import { ZoneData, Branch } from './types';

interface AddZoneFormProps {
  open: boolean;
  handleClose: () => void;
  onZoneAdded: () => void; // Callback after adding/updating a zone
  zoneToEdit?: ZoneData | null; // Optional prop for editing a zone
  companyId: string; // Added prop for auto-assigned companyId
}

const AddZoneForm: React.FC<AddZoneFormProps> = ({
  open,
  handleClose,
  onZoneAdded,
  zoneToEdit,
  companyId,
}) => {
  const [name, setName] = useState<string>('');
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [deliveryBonus, setDeliveryBonus] = useState<number>(0);
  const [branchId, setBranchId] = useState<string>('');

  const [branches, setBranches] = useState<Branch[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);

  // Fetch Branches Based on companyId
  useEffect(() => {
    const fetchBranches = async () => {
      if (!companyId) return;

      const token = localStorage.getItem('token');
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${baseurl}/Company/GetCompanyData`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const companyData = Array.isArray(response.data) ? response.data : [response.data];
        const selectedCompany = companyData.find((c) => c.companyId === companyId);
        setBranches(selectedCompany?.branches || []);
      } catch (err) {
        console.error('Error fetching branches:', err);
        setError('Failed to fetch branches.');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchBranches();
    }
  }, [open, baseurl, companyId]);

  // Set default branchId when branches are loaded and branchId is empty
  useEffect(() => {
    if (!zoneToEdit && branches.length > 0 && !branchId) {
      setBranchId(branches[0].branchId);
    }
  }, [branches, branchId, zoneToEdit]);

  // Populate Form for Editing
  useEffect(() => {
    if (open) {
      if (zoneToEdit) {
        setName(zoneToEdit.name);
        setDeliveryFee(zoneToEdit.deliveryFee);
        setDeliveryBonus(zoneToEdit.deliveryBonus);
        setBranchId(zoneToEdit.branchId);
      } else {
        // Reset form fields if adding a new zone
        setName('');
        setDeliveryFee(0);
        setDeliveryBonus(0);
        setBranchId('');
      }
    }
  }, [open, zoneToEdit]);

  // Handle Form Submission
  const handleSubmit = async () => {
    const token = localStorage.getItem('token');

    // Basic Validation
    if (!name.trim() || !branchId) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const zoneData: Partial<ZoneData> = {
        name: name.trim(),
        deliveryFee,
        deliveryBonus,
        branchId,
        companyId, // Auto-assign companyId
      };

      if (zoneToEdit) {
        // Update Zone
        await axios.post(
          `${baseurl}/PosZone/UpdateZone`,
          { ...zoneData, zoneId: zoneToEdit.zoneId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      } else {
        // Add Zone
        await axios.post(`${baseurl}/PosZone/AddZone`, zoneData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      onZoneAdded(); // Refresh the zone list
      handleClose(); // Close the modal
    } catch (err) {
      console.error('Error submitting zone data:', err);
      setError('Failed to submit zone data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{zoneToEdit ? 'Edit Zone' : 'Add Zone'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ marginTop: '0.5%' }}>
            {/* Zone Name */}
            <Grid item xs={12}>
              <TextField
                label="Zone Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
              />
            </Grid>

            {/* Delivery Fee */}
            <Grid item xs={12}>
              <TextField
                label="Delivery Fee"
                type="number"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(parseFloat(e.target.value))}
                fullWidth
                required
                inputProps={{ step: '0.01' }}
              />
            </Grid>

            {/* Delivery Bonus */}
            <Grid item xs={12}>
              <TextField
                label="Delivery Bonus"
                type="number"
                value={deliveryBonus}
                onChange={(e) => setDeliveryBonus(parseFloat(e.target.value))}
                fullWidth
                required
                inputProps={{ step: '0.01' }}
              />
            </Grid>

            {/* Branch Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth required disabled={!companyId || branches.length === 0}>
                <InputLabel id="branch-select-label">Branch</InputLabel>
                <Select
                  labelId="branch-select-label"
                  value={branchId}
                  label="Branch"
                  onChange={(e) => setBranchId(e.target.value)}
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch.branchId} value={branch.branchId}>
                      {branch.branchName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
            {zoneToEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddZoneForm;
