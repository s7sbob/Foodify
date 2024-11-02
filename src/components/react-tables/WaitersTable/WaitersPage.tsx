// src/pages/WaitersPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, CircularProgress, Box, Alert } from '@mui/material';
import WaitersTable from './WaitersTable'; // Adjust the import path as needed
import { Waiter, EnhancedWaiter } from 'src/types/Waiter';
import { CompanyData } from 'src/types/companyTypes';
import { useSelector } from 'react-redux';
import { AppState } from 'src/store/Store';
import { useNotification } from '../../../context/NotificationContext'; // Import the hook
import { useTranslation } from 'react-i18next'; // Import useTranslation

const WaitersPage: React.FC = () => {
  const { t } = useTranslation(); // Initialize translation hook

  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token =
    useSelector((state: AppState) => state.auth.token) ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('authToken');

  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [enhancedWaiters, setEnhancedWaiters] = useState<EnhancedWaiter[]>([]);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Use the Notification Context
  const { showNotification } = useNotification();

  const fetchWaiters = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${baseurl}/PosWaiter/GetWaiters`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('alerts.fetchWaitersFailed') || 'Failed to fetch waiters.');
      }

      const data: Waiter[] = await response.json();
      setWaiters(data);
    } catch (err: any) {
      setError(err.message || t('alerts.fetchWaitersFailed') || 'An error occurred while fetching waiters.');
      showNotification(t('alerts.fetchWaitersFailed') || 'Failed to fetch waiters.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  }, [baseurl, token, showNotification, t]);

  const fetchCompany = useCallback(async () => {
    try {
      const response = await fetch(`${baseurl}/Company/GetCompanyData`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch company data.');
      }

      const data: CompanyData = await response.json();
      setCompany(data);
    } catch (err: any) {
      console.error('Error fetching company data:', err);
      setError(err.message || 'An error occurred while fetching company data.');
      showNotification(t('alerts.fetchCompanyFailed') || 'Failed to fetch company data.', 'error', 'Error');
    }
  }, [baseurl, token, showNotification, t]);

  const combineData = useCallback(() => {
    if (!company) return;

    const enhanced: EnhancedWaiter[] = waiters.map((waiter) => {
      // Find the branch within the company
      const branch = company.branches.find((br) => br.branchId === waiter.branchId);
      const branchName = branch ? branch.branchName : t('table.unknown') || 'Unknown Branch';

      return {
        ...waiter,
        companyName: company.companyName,
        branchName,
      };
    });

    setEnhancedWaiters(enhanced);
  }, [waiters, company, t]);

  // Fetch data on component mount
  useEffect(() => {
    fetchCompany();
    fetchWaiters();
  }, [fetchCompany, fetchWaiters]);

  // Combine data when both company and waiters are fetched
  useEffect(() => {
    if (company && waiters.length > 0) {
      combineData();
    }
  }, [company, waiters, combineData]);

  // Handlers to refresh data
  const handleWaiterAdded = useCallback(() => {
    fetchWaiters();
    showNotification(t('alerts.waiterAddedSuccess') || 'Waiter added successfully!', 'success', t('notifications.success') || 'Success');
  }, [fetchWaiters, showNotification, t]);

  const handleWaiterUpdated = useCallback(() => {
    fetchWaiters();
    showNotification(t('alerts.waiterUpdatedSuccess') || 'Waiter updated successfully!', 'success', t('notifications.success') || 'Success');
  }, [fetchWaiters, showNotification, t]);

  return (
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      <Typography variant="h4" gutterBottom>
        {t('waitersPage.title') || 'Waiters Management'}
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : company ? (
        <WaitersTable
          data={enhancedWaiters}
          companies={[company]} // Pass as array
          onWaiterAdded={handleWaiterAdded}
          onWaiterUpdated={handleWaiterUpdated}
        />
      ) : (
        <Alert severity="error">{t('alerts.companyDataUnavailable') || 'Company data not available.'}</Alert>
      )}
    </Container>
  );
};

export default WaitersPage;
