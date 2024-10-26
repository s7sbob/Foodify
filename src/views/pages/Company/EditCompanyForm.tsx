// EditCompanyForm.tsx

import React, { useState } from 'react';
import {
  Grid,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { CompanyData } from '../../../types/companyTypes';



interface EditCompanyFormProps {
  companyData: CompanyData;
  onCompanyUpdated: (updatedData: CompanyData) => void;
  baseurl: string;
}

const EditCompanyForm: React.FC<EditCompanyFormProps> = ({ companyData, onCompanyUpdated, baseurl }) => {
  const [formData, setFormData] = useState<CompanyData>(companyData);
  const [loading, setLoading] = useState<boolean>(false);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
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

    } catch (error) {
      console.error('Error updating company data:', error);

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
              label="Company Name"
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

          {/* Activity */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Activity"
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

          {/* Phone Number 3 */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Phone Number 3"
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
                label="Currency"
                onChange={handleChange}
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

          {/* Save Button */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </Grid>
        </Grid>
      </form>

    </>
  );
};

export default EditCompanyForm;
