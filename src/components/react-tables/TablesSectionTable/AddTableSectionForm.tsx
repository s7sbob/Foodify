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
} from '@mui/material';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { AppState } from 'src/store/Store';
import { TableSection, Company, Branch } from 'src/types/TablesTable';
import { useNotification } from '../../../context/NotificationContext';

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
        setError('Failed to fetch companies.');
        showNotification('Failed to fetch companies.', 'error', 'Error');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, baseurl, token, showNotification]);

  // Populate Form for Editing after branches are loaded
  useEffect(() => {
    if (sectionToEdit && branches.length > 0) {
      setSectionName(sectionToEdit.sectionName);
      setService(sectionToEdit.service);
      // Ensure that the branchId exists in the branches
      const branchExists = branches.some((b) => b.branchId === sectionToEdit.branchId);
      setBranchId(branchExists ? sectionToEdit.branchId : '');
      if (!branchExists) {
        showNotification('Associated branch not found.', 'warning', 'Warning');
      }
    } else if (!sectionToEdit) {
      // Reset form fields if adding a new section
      setSectionName('');
      setService(0);
      setBranchId('');
    }
  }, [sectionToEdit, branches, showNotification]);

  // Handle Form Submission
  const handleSubmit = async () => {
    if (!sectionName || !branchId) {
      showNotification('Please fill in all required fields.', 'warning', 'Incomplete Data');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Assuming only one company
      const company = companies[0];
      if (!company) {
        showNotification('Company data is missing.', 'error', 'Error');
        setLoading(false);
        return;
      }

      const sectionData: Partial<TableSection> = {
        sectionName,
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
        showNotification('Table section updated successfully.', 'success', 'Success');
      } else {
        // Create Table Section
        await axios.post(`${baseurl}/PosTableSection/CreateTableSection`, sectionData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        showNotification('Table section created successfully.', 'success', 'Success');
      }

      onSectionAdded(); // Refresh the table list
      handleClose(); // Close the modal
    } catch (err) {
      console.error('Error submitting table section data:', err);
      setError('Failed to submit table section data.');
      showNotification('Failed to submit table section data.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{sectionToEdit ? 'Edit Table Section' : 'Add Table Section'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ marginTop: '0.5%' }}>
            {/* Section Name */}
            <Grid item xs={12}>
              <TextField
                label="Section Name"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                fullWidth
                required
              />
            </Grid>

            {/* Service */}
            <Grid item xs={12}>
              <TextField
                label="Service"
                type="number"
                value={service}
                onChange={(e) => setService(parseFloat(e.target.value))}
                fullWidth
                required
                inputProps={{ step: '0.01' }}
              />
            </Grid>

            {/* Branch Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth required disabled={branches.length === 0}>
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
            {sectionToEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddTableSectionForm;
