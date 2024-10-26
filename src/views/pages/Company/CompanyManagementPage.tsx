// src/pages/CompanyManagementPage.tsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  CircularProgress,
  Button,
} from '@mui/material';
import EditCompanyForm from './EditCompanyForm';
import BranchesTable from './BranchesTable';
import axios from 'axios';
import { CompanyData, Branch } from '../../../types/companyTypes';
import { useSelector } from 'react-redux';
import { AppState } from '../../../store/Store';
import EditBranchForm from './EditBranchForm';
import AddBranchForm from './AddBranchForm';
import AddIcon from '@mui/icons-material/Add';
import { useNotification } from '../../../context/NotificationContext'; // Import the hook

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`company-tabpanel-${index}`}
      aria-labelledby={`company-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const CompanyManagementPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use the Notification Context
  const { showNotification } = useNotification();

  // Modal states for editing and adding branches
  const [openEditBranchModal, setOpenEditBranchModal] = useState<boolean>(false);
  const [branchToEdit, setBranchToEdit] = useState<Branch | null>(null);

  const [openAddBranchModal, setOpenAddBranchModal] = useState<boolean>(false);

  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);

  const fetchCompanyData = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<CompanyData>(`${baseurl}/Company/GetCompanyData`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanyData(response.data);
    } catch (err: any) {
      console.error('Error fetching company data:', err);
      setError('Failed to fetch company data.');
      showNotification('Failed to fetch company data.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [baseurl]); // Only re-run if baseurl changes

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCompanyUpdate = (updatedData: CompanyData) => {
    setCompanyData(updatedData);
    showNotification('Company data updated successfully!', 'success', 'Success');
  };

  const handleBranchUpdate = (updatedBranch: Branch) => {
    if (!companyData) return;

    // Update the specific branch in companyData
    const updatedBranches = companyData.branches.map(branch =>
      branch.branchId === updatedBranch.branchId ? updatedBranch : branch
    );

    const updatedCompanyData: CompanyData = {
      ...companyData,
      branches: updatedBranches,
    };

    // Send the updated company data to the server
    updateCompanyData(updatedCompanyData);
  };

  // Function to update company data via API
  const updateCompanyData = async (updatedData: CompanyData) => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const response = await axios.post<CompanyData>(
        `${baseurl}/Company/UpdateCompany`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        }
      );

      setCompanyData(response.data);
      showNotification('Company data updated successfully!', 'success', 'Success');
    } catch (err: any) {
      console.error('Error updating company data:', err);
      setError('Failed to update company data.');
      showNotification('Failed to update company data.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Branch - open the modal
  const handleEditBranch = (branch: Branch) => {
    setBranchToEdit(branch);
    setOpenEditBranchModal(true);
  };

  // Handle Add Branch Modal Open
  const handleAddBranchModalOpen = () => {
    setOpenAddBranchModal(true);
  };

  // Handle Add Branch Modal Close
  const handleAddBranchModalClose = () => {
    setOpenAddBranchModal(false);
  };

  // Handle Add Branch
  const handleAddBranch = async (newBranch: Partial<Branch>) => {
    if (!companyData) return;

    // Create a new branch with an empty branchId (server should assign one)
    const branchToAdd: Branch = {
      branchId: '', // Empty as per server requirement
      branchCode: newBranch.branchCode || 0,
      branchName: newBranch.branchName || '',
      country: newBranch.country || '',
      governate: newBranch.governate || '',
      address: newBranch.address || '',
      phoneNo1: newBranch.phoneNo1 || '',
      phoneNo2: newBranch.phoneNo2 || null,
      email: newBranch.email || '',
      currency: newBranch.currency || 'LE',
    };

    // Append the new branch to the existing branches
    const updatedBranches = [...companyData.branches, branchToAdd];

    const updatedCompanyData: CompanyData = {
      ...companyData,
      branches: updatedBranches,
    };

    // Send the updated company data to the server
    await updateCompanyData(updatedCompanyData);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Company Management
      </Typography>
      <Tabs value={tabValue} onChange={handleTabChange} aria-label="company management tabs">
        <Tab label="Edit Company Data" id="company-tab-0" aria-controls="company-tabpanel-0" />
        <Tab label="Branches" id="company-tab-1" aria-controls="company-tabpanel-1" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : companyData ? (
          <EditCompanyForm
            companyData={companyData}
            onCompanyUpdated={handleCompanyUpdate}
            baseurl={baseurl}
          />
        ) : null}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : companyData ? (
          <>
            {/* Add Branch Button */}
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddBranchModalOpen}
                startIcon={<AddIcon />}
              >
                Add Branch
              </Button>
            </Box>

            <BranchesTable
              branches={companyData.branches}
              onEditBranch={handleEditBranch}
            />
          </>
        ) : null}
      </TabPanel>

      {/* Edit Branch Modal */}
      {branchToEdit && (
        <EditBranchForm
          open={openEditBranchModal}
          handleClose={() => setOpenEditBranchModal(false)}
          branchData={branchToEdit}
          onBranchUpdated={handleBranchUpdate} // Pass the callback with updated branch
        />
      )}

      {/* Add Branch Modal */}
      {companyData && (
        <AddBranchForm
          open={openAddBranchModal}
          handleClose={handleAddBranchModalClose}
          onAddBranch={handleAddBranch}
          companyName={companyData.companyName}
          companyId={companyData.companyId}
        />
      )}
    </Box>
  );
};

export default CompanyManagementPage;
