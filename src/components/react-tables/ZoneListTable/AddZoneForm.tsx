// src/components/Zones/AddZoneForm.tsx

import React, { useState, useEffect } from 'react';
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { AppState } from 'src/store/Store';
import { ZoneData, Branch } from './types';
import { useNotification } from '../../../context/NotificationContext';

interface AddZoneFormProps {
  open: boolean;
  handleClose: () => void;
  onZoneAdded: () => void; // Callback after adding/updating a zone
  zoneToEdit?: ZoneData | null; // Optional prop for editing a zone
  companyId: string; // Auto-assigned companyId
}

const AddZoneForm: React.FC<AddZoneFormProps> = ({
  open,
  handleClose,
  onZoneAdded,
  zoneToEdit = null,
  companyId,
}) => {
  const { t } = useTranslation(); // Initialize translation hook

  const [name, setName] = useState<string>('');
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [deliveryBonus, setDeliveryBonus] = useState<number>(0);
  const [branchId, setBranchId] = useState<string>('');

  const [branches, setBranches] = useState<Branch[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { showNotification } = useNotification();

  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token =
    useSelector((state: AppState) => state.auth.token) || localStorage.getItem('token');

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
        const selectedCompany = companyData.find((c) => c.companyId === companyId);
        setBranches(selectedCompany?.branches || []);
      } catch (err: any) {
        console.error('Error fetching branches:', err);
        setError(t('alerts.fetchBranchesFailed') || 'Failed to fetch branches.');
        showNotification(t('alerts.fetchBranchesFailed') || 'Failed to fetch branches.', 'error', 'Error');
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
        setBranchId(branches.length === 1 ? branches[0].branchId : '');
      }
    }
  }, [open, zoneToEdit, branches]);

  // Handle Form Submission
  const handleSubmit = async () => {
    // Basic Validation
    if (!name.trim() || !branchId) {
      setError(t('errors.fillAllFields') || 'Please fill in all required fields.');
      showNotification(t('errors.fillAllFields') || 'Please fill in all required fields.', 'warning', 'Incomplete Data');
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
        showNotification(t('alerts.zoneUpdatedSuccess') || 'Zone updated successfully.', 'success', 'Success');
      } else {
        // Add Zone
        await axios.post(`${baseurl}/PosZone/AddZone`, zoneData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        showNotification(t('alerts.zoneAddedSuccess') || 'Zone added successfully.', 'success', 'Success');
      }

      onZoneAdded(); // Refresh the zone list
      handleClose(); // Close the modal
    } catch (err: any) {
      console.error('Error submitting zone data:', err);
      setError(t('alerts.submitZoneFailed') || 'Failed to submit zone data.');
      showNotification(t('alerts.submitZoneFailed') || 'Failed to submit zone data.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{zoneToEdit ? t('zones.addZoneForm.titleEdit') || 'Edit Zone' : t('zones.addZoneForm.titleAdd') || 'Add Zone'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ marginTop: '0.5%' }}>
          {/* Zone Name */}
          <Grid item xs={12}>
            <TextField
              label={t('zones.addZoneForm.zoneName') || 'Zone Name'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              placeholder={t('zones.addZoneForm.zoneNamePlaceholder') || 'Enter zone name'}
            />
          </Grid>

          {/* Delivery Fee */}
          <Grid item xs={12}>
            <TextField
              label={t('zones.addZoneForm.deliveryFee') || 'Delivery Fee'}
              type="number"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(parseFloat(e.target.value))}
              fullWidth
              required
              inputProps={{ step: '0.01' }}
              placeholder={t('zones.addZoneForm.deliveryFeePlaceholder') || 'Enter delivery fee'}
            />
          </Grid>

          {/* Delivery Bonus */}
          <Grid item xs={12}>
            <TextField
              label={t('zones.addZoneForm.deliveryBonus') || 'Delivery Bonus'}
              type="number"
              value={deliveryBonus}
              onChange={(e) => setDeliveryBonus(parseFloat(e.target.value))}
              fullWidth
              required
              inputProps={{ step: '0.01' }}
              placeholder={t('zones.addZoneForm.deliveryBonusPlaceholder') || 'Enter delivery bonus'}
            />
          </Grid>

          {/* Branch Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth required disabled={!companyId || branches.length === 0 || loading}>
              <InputLabel id="branch-select-label">{t('zones.addZoneForm.branch') || 'Branch'}</InputLabel>
              <Select
                labelId="branch-select-label"
                value={branchId}
                label={t('zones.addZoneForm.branch') || 'Branch'}
                onChange={(e) => setBranchId(e.target.value)}
                placeholder={t('zones.addZoneForm.branchPlaceholder') || 'Select branch'}
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
          {t('buttons.cancel') || 'Cancel'}
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
          {zoneToEdit ? t('buttons.update') || 'Update' : t('buttons.create') || 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddZoneForm;
