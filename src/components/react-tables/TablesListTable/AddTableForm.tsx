// src/components/Tables/AddTableForm.tsx

import React, { useState, useEffect, useMemo } from 'react';
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
import { Table as TableType, Company, Branch, TableSection } from 'src/types/TablesTable';
import { useNotification } from '../../../context/NotificationContext';
import { useTranslation } from 'react-i18next';

interface AddTableFormProps {
  open: boolean;
  handleClose: () => void;
  onTableAdded: () => void; // Callback after adding/updating a table
  tableToEdit?: TableType | null; // Optional prop for editing a table
}

const AddTableForm: React.FC<AddTableFormProps> = ({
  open,
  handleClose,
  onTableAdded,
  tableToEdit,
}) => {
  const { t } = useTranslation(); // Initialize translation hook

  const [tableName, setTableName] = useState<string>('');
  const [tableSectionId, setTableSectionId] = useState<string>('');
  const [branchId, setBranchId] = useState<string>('');

  const [companies, setCompanies] = useState<Company[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [allTableSections, setAllTableSections] = useState<TableSection[]>([]); // All sections

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { showNotification } = useNotification();

  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token =
    useSelector((state: AppState) => state.auth.token) ||
    localStorage.getItem('token');

  // Fetch Companies and TableSections Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [companiesResponse, tableSectionsResponse] = await Promise.all([
          axios.get(`${baseurl}/Company/GetCompanyData`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseurl}/PosTableSection/GetTableSections`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const companyData: Company[] = Array.isArray(companiesResponse.data)
          ? companiesResponse.data
          : [companiesResponse.data];
        const sections: TableSection[] = tableSectionsResponse.data || [];

        setCompanies(companyData);

        // Assuming only one company
        if (companyData.length > 0) {
          setBranches(companyData[0].branches);
          // Filter table sections based on companyId
          const companyTableSections = sections.filter(
            (ts) => ts.companyId === companyData[0].companyId
          );
          setAllTableSections(companyTableSections);
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(t('errors.fetchData') || 'Failed to fetch data.');
        showNotification(t('notifications.fetchDataFailed') || 'Failed to fetch data.', 'error', t('notifications.error') || 'Error');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, baseurl, token, showNotification, t]);

  // Populate Form Fields When Form Opens
  useEffect(() => {
    if (open) {
      if (tableToEdit && branches.length > 0) {
        // Editing a table
        setTableName(tableToEdit.tableName);
        setBranchId(tableToEdit.branchId);
        setTableSectionId(tableToEdit.tableSectionId);
      } else if (!tableToEdit) {
        // Adding a new table
        setTableName('');
        setBranchId('');
        setTableSectionId('');
      }
    }
  }, [open, tableToEdit, branches]);

  // Set default branchId when branches are loaded and branchId is empty
  useEffect(() => {
    if (!tableToEdit && branches.length > 0 && !branchId) {
      setBranchId(branches[0].branchId);
    }
  }, [branches, branchId, tableToEdit]);

  // Compute Filtered Table Sections based on branchId
  const filteredTableSections = useMemo(() => {
    if (branchId) {
      return allTableSections.filter((ts) => ts.branchId === branchId);
    }
    return [];
  }, [branchId, allTableSections]);

  // Set default tableSectionId when filteredTableSections are loaded and tableSectionId is empty
  useEffect(() => {
    if (!tableToEdit) {
      if (filteredTableSections.length > 0) {
        // Check if current tableSectionId is in filteredTableSections
        const currentSectionExists = filteredTableSections.some(
          (section) => section.tableSectionId === tableSectionId
        );
        if (!currentSectionExists) {
          setTableSectionId(filteredTableSections[0].tableSectionId);
        }
      } else {
        setTableSectionId('');
      }
    }
  }, [filteredTableSections, tableSectionId, tableToEdit]);

  // Handle Form Submission
  const handleSubmit = async () => {
    if (!tableName || !branchId || !tableSectionId) {
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

      const tableData: Partial<TableType> = {
        tableName: tableName.trim(),
        tableSectionId,
        branchId,
        companyId: company.companyId,
      };

      if (tableToEdit) {
        // Update Table
        await axios.post(
          `${baseurl}/PosTable/UpdateTable`,
          { ...tableData, tableId: tableToEdit.tableId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        showNotification(t('notifications.tableUpdated') || 'Table updated successfully.', 'success', t('notifications.success') || 'Success');
      } else {
        // Create Table
        await axios.post(`${baseurl}/PosTable/CreateTable`, tableData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        showNotification(t('notifications.tableCreated') || 'Table created successfully.', 'success', t('notifications.success') || 'Success');
      }

      onTableAdded(); // Refresh the table list
      handleClose(); // Close the modal
    } catch (err: any) {
      console.error('Error submitting table data:', err);
      setError(t('errors.submitTable') || 'Failed to submit table data.');
      showNotification(t('notifications.submitTableFailed') || 'Failed to submit table data.', 'error', t('notifications.error') || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{tableToEdit ? t('tables.editTable') || 'Edit Table' : t('tables.addTable') || 'Add Table'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ marginTop: '0.5%' }}>
            {/* Table Name */}
            <Grid item xs={12}>
              <TextField
                label={t('tables.tableName') || 'Table Name'}
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                fullWidth
                required
                placeholder={t('tables.tableNamePlaceholder') || 'Enter table name'}
              />
            </Grid>

            {/* Branch Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth required disabled={branches.length === 0 || loading}>
                <InputLabel id="branch-select-label">{t('tables.branch') || 'Branch'}</InputLabel>
                <Select
                  labelId="branch-select-label"
                  value={branchId}
                  label={t('tables.branch') || 'Branch'}
                  onChange={(e) => setBranchId(e.target.value)}
                  placeholder={t('tables.branchPlaceholder') || 'Select branch'}
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch.branchId} value={branch.branchId}>
                      {branch.branchName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Table Section Selection */}
            <Grid item xs={12}>
              <FormControl
                fullWidth
                required
                disabled={!branchId || filteredTableSections.length === 0 || loading}
              >
                <InputLabel id="table-section-select-label">{t('tables.tableSection') || 'Table Section'}</InputLabel>
                <Select
                  labelId="table-section-select-label"
                  value={tableSectionId}
                  label={t('tables.tableSection') || 'Table Section'}
                  onChange={(e) => setTableSectionId(e.target.value)}
                  placeholder={t('tables.tableSectionPlaceholder') || 'Select table section'}
                >
                  {filteredTableSections.map((section) => (
                    <MenuItem key={section.tableSectionId} value={section.tableSectionId}>
                      {section.sectionName}
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
            {tableToEdit ? t('buttons.update') || 'Update' : t('buttons.create') || 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddTableForm;
