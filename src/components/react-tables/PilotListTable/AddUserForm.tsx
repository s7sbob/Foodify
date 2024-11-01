// src/components/Pilots/AddUserForm.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  Button,
  FormControl,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { AppState } from 'src/store/Store';
import { PilotTableData, Branch } from './types';
import { useNotification } from '../../../context/NotificationContext'; // Import the hook
import { useTranslation } from 'react-i18next';

interface AddUserFormProps {
  open: boolean;
  handleClose: () => void;
  onUserAdded: () => void; // Callback after adding/updating a pilot
  pilotToEdit?: PilotTableData | null; // Optional prop for editing a pilot
  companyId: string; // Added prop for auto-assigned companyId
}

const AddUserForm: React.FC<AddUserFormProps> = ({
  open,
  handleClose,
  onUserAdded,
  pilotToEdit = null,
  companyId,
}) => {
  const { t } = useTranslation(); // Initialize translation hook
  const { showNotification } = useNotification(); // Use the notification hook

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
      try {
        const response = await axios.get(`${baseurl}/Company/GetCompanyData`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const companyData = Array.isArray(response.data) ? response.data : [response.data];
        const selectedCompany = companyData.find((c) => c.companyId === companyId);
        setBranches(selectedCompany?.branches || []);
      } catch (err: any) {
        console.error('Error fetching branches:', err);
        showNotification(t('errors.fetchBranchesFailed') || 'Failed to fetch branches.', 'error', t('notifications.error') || 'Error');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchBranches();
    }
  }, [open, baseurl, companyId, token, showNotification, t]);

  // Set default branchId when branches are loaded and branchId is empty
  useEffect(() => {
    if (!pilotToEdit && branches.length > 0 && !branchId) {
      setBranchId(branches[0].branchId);
    }
  }, [branches, branchId, pilotToEdit]);

  // Populate Form for Editing
  useEffect(() => {
    if (open) {
      if (pilotToEdit) {
        setName(pilotToEdit.name);
        setPhone(pilotToEdit.phone);
        setBranchId(pilotToEdit.branchId);
        setIsActive(pilotToEdit.isActive);
      } else {
        // Reset form fields if adding a new pilot
        setName('');
        setPhone('');
        setBranchId(branches.length === 1 ? branches[0].branchId : '');
        setIsActive(true);
      }
    }
  }, [open, pilotToEdit, branches, t]);

  // Handle Form Submission
  const handleSubmit = async () => {
    // Basic Validation
    if (!name.trim() || !phone.trim() || !branchId) {
      setError(t('errors.fillAllFields') || 'Please fill in all required fields.');
      showNotification(t('errors.fillAllFields') || 'Please fill in all required fields.', 'warning', t('notifications.incompleteData') || 'Incomplete Data');
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
        await axios.post(
          `${baseurl}/PosPilot/UpdatePilot`,
          { ...pilotData, pilotId: pilotToEdit.pilotId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        showNotification(t('notifications.pilotUpdated') || 'Pilot updated successfully.', 'success', t('notifications.success') || 'Success');
      } else {
        // Create Pilot
        await axios.post(`${baseurl}/PosPilot/CreatePilot`, pilotData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        showNotification(t('notifications.pilotAdded') || 'Pilot added successfully.', 'success', t('notifications.success') || 'Success');
      }

      onUserAdded(); // Refresh the pilot list
      handleClose(); // Close the modal
    } catch (err: any) {
      console.error('Error submitting pilot data:', err);
      // Attempt to extract error message from response
      const apiError = err.response?.data?.message || t('errors.submitPilotFailed') || 'Failed to submit pilot data.';
      showNotification(apiError, 'error', t('notifications.error') || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{pilotToEdit ? (t('addUserForm.editPilot') || 'Edit Pilot') : (t('addUserForm.addPilot') || 'Add Pilot')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ marginTop: '0.5%' }}>
            {/* Name Field */}
            <Grid item xs={12}>
              <TextField
                label={t('addUserForm.name') || 'Name'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
                placeholder={t('addUserForm.namePlaceholder') || 'Enter name'}
              />
            </Grid>

            {/* Phone Field */}
            <Grid item xs={12}>
              <TextField
                label={t('addUserForm.phone') || 'Phone'}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
                required
                inputProps={{ maxLength: 15 }}
                placeholder={t('addUserForm.phonePlaceholder') || 'Enter phone number'}
              />
            </Grid>

            {/* Branch Selection */}
            <Grid item xs={12}>
              <FormControl
                fullWidth
                required
                disabled={!companyId || branches.length === 0 || loading}
              >
                <InputLabel id="branch-select-label">{t('addUserForm.branch') || 'Branch'}</InputLabel>
                <Select
                  labelId="branch-select-label"
                  value={branchId}
                  label={t('addUserForm.branch') || 'Branch'}
                  onChange={(e) => setBranchId(e.target.value)}
                  placeholder={t('addUserForm.branchPlaceholder') || 'Select branch'}
                >
                  {branches.map((branch) => (
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
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                }
                label={t('addUserForm.isActive') || 'Is Active'}
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
            {t('buttons.cancel') || 'Cancel'}
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
            {pilotToEdit ? (t('buttons.update') || 'Update') : (t('buttons.create') || 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddUserForm;
