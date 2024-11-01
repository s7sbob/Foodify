// src/components/TableSections/AddTableSectionForm.tsx

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
import { TableSection, Company, Branch } from 'src/types/TablesTable';
import { useNotification } from '../../../context/NotificationContext';
import { useTranslation } from 'react-i18next';

interface AddTableSectionFormProps {
  open: boolean;
  handleClose: () => void;
  onSectionAdded: () => void; // Callback after adding/updating a table section
  sectionToEdit?: TableSection | null; // Optional prop for editing a table section
}

const AddTableSectionForm: React.FC<AddTableSectionFormProps> = ({
  open,
  handleClose,
  onSectionAdded,
  sectionToEdit,
}) => {
  const { t } = useTranslation(); // Initialize translation hook

  const [sectionName, setSectionName] = useState<string>('');
  const [service, setService] = useState<number>(0);
  const [branchId, setBranchId] = useState<string>('');

  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { showNotification } = useNotification();

  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token =
    useSelector((state: AppState) => state.auth.token) ||
    localStorage.getItem('token');

  // Fetch Companies and Branches Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const companiesResponse = await axios.get(`${baseurl}/Company/GetCompanyData`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const companyData: Company[] = Array.isArray(companiesResponse.data)
          ? companiesResponse.data
          : [companiesResponse.data];

        setCompanies(companyData);

        // Assuming only one company
        if (companyData.length > 0) {
          setBranches(companyData[0].branches);
        }
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError(t('errors.fetchCompanies') || 'Failed to fetch companies.');
        showNotification(t('notifications.fetchCompaniesFailed') || 'Failed to fetch companies.', 'error', t('notifications.error') || 'Error');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, baseurl, token, showNotification, t]);

  // Populate Form for Editing after branches are loaded
  useEffect(() => {
    if (sectionToEdit && branches.length > 0) {
      // Editing a section
      setSectionName(sectionToEdit.sectionName);
      setService(sectionToEdit.service);
      // Ensure that the branchId exists in the branches
      const branchExists = branches.some((b) => b.branchId === sectionToEdit.branchId);
      setBranchId(branchExists ? sectionToEdit.branchId : '');
      if (!branchExists) {
        showNotification(t('notifications.branchNotFound') || 'Associated branch not found.', 'warning', t('notifications.warning') || 'Warning');
      }
    } else if (!sectionToEdit) {
      // Adding a new section
      setSectionName('');
      setService(0);
      // Do not reset branchId here
    }
  }, [sectionToEdit, branches, showNotification, t]);

  // Set default branchId when branches are loaded and branchId is empty
  useEffect(() => {
    if (!sectionToEdit && branches.length > 0 && !branchId) {
      setBranchId(branches[0].branchId);
    }
  }, [branches, branchId, sectionToEdit]);

  // Handle Form Submission
  const handleSubmit = async () => {
    if (!sectionName || !branchId) {
      setError(t('errors.fillAllFields') || 'Please fill in all required fields.');
      showNotification(t('notifications.fillAllFields') || 'Please fill in all required fields.', 'warning', t('notifications.incompleteData') || 'Incomplete Data');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Assuming only one company
      const company = companies[0];
      if (!company) {
        showNotification(t('notifications.missingCompanyData') || 'Company data is missing.', 'error', t('notifications.error') || 'Error');
        setLoading(false);
        return;
      }

      const sectionData: Partial<TableSection> = {
        sectionName: sectionName.trim(),
        service,
        branchId,
        companyId: company.companyId,
      };

      if (sectionToEdit) {
        // Update Table Section
        await axios.post(
          `${baseurl}/PosTableSection/UpdateTableSection`,
          { ...sectionData, tableSectionId: sectionToEdit.tableSectionId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        showNotification(t('notifications.tableSectionUpdated') || 'Table section updated successfully.', 'success', t('notifications.success') || 'Success');
      } else {
        // Create Table Section
        await axios.post(`${baseurl}/PosTableSection/CreateTableSection`, sectionData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        showNotification(t('notifications.tableSectionCreated') || 'Table section created successfully.', 'success', t('notifications.success') || 'Success');
      }

      onSectionAdded(); // Refresh the table list
      handleClose(); // Close the modal
    } catch (err: any) {
      console.error('Error submitting table section data:', err);
      setError(t('errors.submitTableSection') || 'Failed to submit table section data.');
      showNotification(t('notifications.submitTableSectionFailed') || 'Failed to submit table section data.', 'error', t('notifications.error') || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{sectionToEdit ? t('tableSections.editTableSection') || 'Edit Table Section' : t('tableSections.addTableSection') || 'Add Table Section'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ marginTop: '0.5%' }}>
            {/* Section Name */}
            <Grid item xs={12}>
              <TextField
                label={t('tableSections.sectionName') || 'Section Name'}
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                fullWidth
                required
                placeholder={t('tableSections.sectionNamePlaceholder') || 'Enter section name'}
              />
            </Grid>

            {/* Service */}
            <Grid item xs={12}>
              <TextField
                label={t('tableSections.servicePercentage') || 'Service (%)'}
                type="number"
                value={service}
                onChange={(e) => setService(parseFloat(e.target.value))}
                fullWidth
                required
                inputProps={{ step: '0.1' }}
                placeholder={t('tableSections.servicePlaceholder') || 'Enter service percentage'}
              />
            </Grid>

            {/* Branch Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth required disabled={branches.length === 0 || loading}>
                <InputLabel id="branch-select-label">{t('tableSections.branch') || 'Branch'}</InputLabel>
                <Select
                  labelId="branch-select-label"
                  value={branchId}
                  label={t('tableSections.branch') || 'Branch'}
                  onChange={(e) => setBranchId(e.target.value)}
                  placeholder={t('tableSections.branchPlaceholder') || 'Select branch'}
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
            {sectionToEdit ? t('buttons.update') || 'Update' : t('buttons.create') || 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddTableSectionForm;
