// src/components/Company/EditCompanyForm.tsx

import React, { useState } from 'react';
import {
  Grid,
  TextField,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { CompanyData } from '../../../types/companyTypes';
import { useSelector } from 'react-redux';
import { AppState } from '../../../store/Store';
import { useNotification } from '../../../context/NotificationContext';
import { useTranslation } from 'react-i18next';

interface EditCompanyFormProps {
  companyData: CompanyData;
  onCompanyUpdated: (updatedData: CompanyData) => void;
  baseurl: string;
}

const EditCompanyForm: React.FC<EditCompanyFormProps> = ({ companyData, onCompanyUpdated, baseurl }) => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState<CompanyData>(companyData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const token = useSelector((state: AppState) => state.auth.token);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = async () => {
    // Basic Validation
    if (!formData.companyName.trim()) {
      setError(t('errors.fillAllFields') || 'Please fill in all required fields.');
      showNotification(t('errors.fillAllFields') || 'Please fill in all required fields.', 'warning', t('notifications.incompleteData') || 'Incomplete Data');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Send updated company data to the API
      const response = await axios.post<CompanyData>(
        `${baseurl}/Company/UpdateCompany`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        }
      );

      // Assuming the API returns the updated company data
      onCompanyUpdated(response.data);
      showNotification(t('notifications.companyDataUpdated') || 'Company data updated successfully!', 'success', t('notifications.success') || 'Success');
    } catch (error: any) {
      console.error('Error updating company data:', error);
      setError(t('errors.updateCompanyData') || 'Failed to update company data.');
      showNotification(t('notifications.updateCompanyDataFailed') || 'Failed to update company data.', 'error', t('notifications.error') || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form noValidate autoComplete="off">
        <Grid container spacing={2}>
          {/* Company Name */}
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('editCompanyForm.companyName') || 'Company Name'}
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          {/* Country */}
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('editCompanyForm.country') || 'Country'}
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
              label={t('editCompanyForm.governate') || 'Governate'}
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
              label={t('editCompanyForm.address') || 'Address'}
              name="address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          {/* Activity */}
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('editCompanyForm.activity') || 'Activity'}
              name="activity"
              value={formData.activity}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          {/* Phone Number 1 */}
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('editCompanyForm.phoneNo1') || 'Phone Number 1'}
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
              label={t('editCompanyForm.phoneNo2') || 'Phone Number 2'}
              name="phoneNo2"
              value={formData.phoneNo2 || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          {/* Phone Number 3 */}
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('editCompanyForm.phoneNo3') || 'Phone Number 3'}
              name="phoneNo3"
              value={formData.phoneNo3 || ''}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          {/* Currency */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="currency"
              value={formData.currency}
              label={t('editCompanyForm.currency') || 'Currency'}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12} sm={6}>
            <TextField
              label={t('editCompanyForm.email') || 'Email'}
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : (t('editCompanyForm.saveChanges') || 'Save Changes')}
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
};

export default EditCompanyForm;
