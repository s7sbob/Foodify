// src/pages/WaitersPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, CircularProgress, Box, Alert } from '@mui/material';
import WaitersTable from './WaitersTable';
import { Waiter, EnhancedWaiter } from 'src/types/Waiter';
import { CompanyData } from 'src/types/companyTypes';
import { useSelector } from 'react-redux';
import { AppState } from 'src/store/Store';
import { useNotification } from '../../../context/NotificationContext'; // Import the hook

const WaitersPage: React.FC = () => {
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
        throw new Error(errorData.message || 'Failed to fetch waiters.');
      }

      const data: Waiter[] = await response.json();
      setWaiters(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching waiters.');
      showNotification('Failed to fetch waiters.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  }, [baseurl, token, showNotification]);

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
      showNotification('Failed to fetch company data.', 'error', 'Error');
    }
  }, [baseurl, token, showNotification]);

  const combineData = useCallback(() => {
    if (!company) return;

    const enhanced: EnhancedWaiter[] = waiters.map((waiter) => {
      // Find the branch within the company
      const branch = company.branches.find((br) => br.branchId === waiter.branchId);
      const branchName = branch ? branch.branchName : 'Unknown Branch';

      return {
        ...waiter,
        companyName: company.companyName,
        branchName,
      };
    });

    setEnhancedWaiters(enhanced);
  }, [waiters, company]);

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
    showNotification('Waiter added successfully!', 'success', 'Success');
  }, [fetchWaiters, showNotification]);

  const handleWaiterUpdated = useCallback(() => {
    fetchWaiters();
    showNotification('Waiter updated successfully!', 'success', 'Success');
  }, [fetchWaiters, showNotification]);

  return (
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Waiters Management
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
        <Alert severity="error">Company data not available.</Alert>
      )}
    </Container>
  );
};

export default WaitersPage;
