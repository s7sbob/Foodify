// src/components/Pilots/PilotListTable.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  TableHead,
  Grid,
  IconButton,
  Tooltip,
  TextField,
  Box,
  Stack,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  ColumnFiltersState,
  VisibilityState,
  ColumnDef,
} from '@tanstack/react-table';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DownloadCard from 'src/components/shared/DownloadCard';
import AddUserForm from './AddUserForm'; // Import the AddUserForm component
import { useSelector } from 'react-redux';
import { AppState } from 'src/store/Store';
import { PilotTableData, Company } from './types';
import { useNotification } from '../../../context/NotificationContext'; // Import the hook
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface TableProps {
  // Define any props if necessary
}

const PilotListTable: React.FC<TableProps> = () => {
  const { t } = useTranslation();
  
  const [data, setData] = useState<PilotTableData[]>([]);
  const [companyData, setCompanyData] = useState<Company[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  
  // States for Add/Edit User Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pilotToEdit, setPilotToEdit] = useState<PilotTableData | null>(null);
  
  // Use the Notification Context
  const { showNotification } = useNotification();
  
  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token =
    useSelector((state: AppState) => state.auth.token) ||
    localStorage.getItem('token');
  
  // Loading and error states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch Pilot and Company Data
  const fetchPilotData = useCallback(async () => {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    setLoading(true);
    setError(null);
    try {
      const [pilotResponse, companyResponse] = await Promise.all([
        axios.get<PilotTableData[]>(`${baseurl}/PosPilot/GetPilots`, { headers }),
        axios.get<Company[]>(`${baseurl}/Company/GetCompanyData`, { headers }),
      ]);
  
      const companies: Company[] = Array.isArray(companyResponse.data)
        ? companyResponse.data
        : [companyResponse.data];
  
      setCompanyData(companies);
  
      if (companies.length !== 1) {
        throw new Error('Multiple companies found or no company associated with the user.');
      }
  
      const company = companies[0];
  
      const updatedData: PilotTableData[] = pilotResponse.data.map((pilot: PilotTableData) => {
        // Find the branch within the companyData
        const branch = company.branches.find(b => b.branchId === pilot.branchId);
  
        return {
          pilotId: pilot.pilotId,
          name: pilot.name,
          phone: pilot.phone,
          isActive: pilot.isActive,
          companyName: company.companyName || 'Unknown',
          companyId: company.companyId || '',
          branchName: branch?.branchName || 'Unknown',
          branchId: branch?.branchId || '',
        };
      });
  
      setData(updatedData);
    } catch (error: any) {
      console.error('Error fetching pilot data:', error);
      setError('Failed to fetch pilots. Please try again later.');
      showNotification(t('alerts.fetchPilotsFailed') || 'Failed to fetch pilots.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  }, [baseurl, token, showNotification, t]);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchPilotData();
  }, [fetchPilotData]);
  
  // Handle Edit Action
  const handleEdit = (pilot: PilotTableData) => {
    setPilotToEdit(pilot);
    setIsModalOpen(true);
  };
  
  // Handle Add Pilot Action
  const handleAddPilot = () => {
    setPilotToEdit(null); // Ensure no pilot is set for adding
    setIsModalOpen(true);
  };
  
  // Define Columns
  const columnHelper = createColumnHelper<PilotTableData>();
  
  const columns = useMemo<ColumnDef<PilotTableData, any>[]>(() => [
    columnHelper.accessor('name', {
      header: t('table.pilotName') || 'Pilot Name',
      cell: info => {
        const isActive = info.row.original.isActive;
        return (
          <Box display="flex" alignItems="center">
            <Typography variant="h6" fontWeight="400">
              {info.getValue()}
            </Typography>
            <Chip
              label={isActive ? (t('status.active') || 'Active') : (t('status.inactive') || 'Inactive')}
              color={isActive ? 'success' : 'error'}
              size="small"
              sx={{ ml: 1 }}
            />
          </Box>
        );
      },
      enableColumnFilter: true,
    }),
    columnHelper.accessor('phone', {
      header: t('table.phoneNumber') || 'Phone Number',
      cell: info => (
        <Typography variant="h6" fontWeight="400">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('companyName', {
      header: t('table.companyName') || 'Company Name',
      cell: info => (
        <Typography variant="h6" fontWeight="400">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('branchName', {
      header: t('table.branchName') || 'Branch Name',
      cell: info => (
        <Typography variant="h6" fontWeight="400">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.display({
      id: 'actions',
      header: t('table.actions') || 'Actions',
      cell: info => (
        <Stack direction="row" spacing={1}>
          <Tooltip title={t('actions.edit') || 'Edit'}>
            <IconButton
              color="primary"
              aria-label={t('actions.edit') || 'Edit'}
              onClick={() => handleEdit(info.row.original)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          {/* Add more action buttons here if needed */}
        </Stack>
      ),
    }),
  ], [columnHelper, handleEdit, t]);
  
  // Initialize the table
  const table = useReactTable<PilotTableData>({
    data,
    columns,
    state: {
      globalFilter,
      columnFilters,
      columnVisibility,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  
  // Handle Download CSV
  const handleDownload = useCallback(() => {
    const headers = [
      t('table.pilotName') || 'Pilot Name',
      t('table.phoneNumber') || 'Phone Number',
      t('table.companyName') || 'Company Name',
      t('table.branchName') || 'Branch Name',
      t('status.status') || 'Status',
    ];
    const rows = data.map((item: PilotTableData) => [
      item.name,
      item.phone,
      item.companyName,
      item.branchName,
      item.isActive ? (t('status.active') || 'Active') : (t('status.inactive') || 'Inactive'),
    ]);
  
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'pilot-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data, t]);
  
  // Handle Modal Close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setPilotToEdit(null);
  }, []);
  
  // Handle Pilot Added or Updated
  const handlePilotAdded = useCallback(() => {
    fetchPilotData();
    showNotification(
      pilotToEdit ? 'Pilot updated successfully.' : 'Pilot added successfully.',
      'success',
      'Success'
    );
  }, [fetchPilotData, pilotToEdit, showNotification]);
  
  return (
    <>
      {/* Add Pilot button */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddPilot}
          startIcon={<AddIcon />}
        >
          {t('buttons.addPilot') || 'Add Pilot'}
        </Button>
      </Box>
  
      {/* Column Visibility Toggles */}
      <Box mb={2}>
        <FormGroup row>
          {table
            .getAllLeafColumns()
            .filter(column => column.id !== 'actions') // Exclude actions column if desired
            .map(column => (
              <FormControlLabel
                key={column.id}
                control={
                  <Checkbox
                    checked={column.getIsVisible()}
                    onChange={e => column.toggleVisibility(e.target.checked)}
                  />
                }
                label={column.columnDef.header as string || column.id} // Provide fallback
              />
            ))}
        </FormGroup>
      </Box>
  
      {/* Global Search Input */}
      <Box mb={2}>
        <TextField
          label={t('search.global') || 'Global Search'}
          variant="outlined"
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          sx={{ width: '300px' }}
        />
      </Box>
  
      {/* Display Loading, Error, or Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        // Optionally, you can still show a fallback UI if needed
        <Typography color="error" align="center">
          {error}
        </Typography>
      ) : (
        <DownloadCard title={t('table.pilotList') || 'Pilot List'} onDownload={handleDownload}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TableContainer>
                <Table sx={{ whiteSpace: 'nowrap' }}>
                  <TableHead>
                    {table.getHeaderGroups().map(headerGroup => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <TableCell key={header.id}>
                            <Box display="flex" alignItems="center">
                              <Typography variant="h6">
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(header.column.columnDef.header, header.getContext())}
                              </Typography>
                              {/* Per-Column Search Input */}
                              {header.column.getCanFilter() ? (
                                <TextField
                                  variant="outlined"
                                  size="small"
                                  value={(header.column.getFilterValue() ?? '') as string}
                                  onChange={e => header.column.setFilterValue(e.target.value)}
                                  placeholder={t('search.column') || 'Search...'}
                                  style={{ marginLeft: '8px' }}
                                />
                              ) : null}
                            </Box>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableHead>
                  <TableBody>
                    {table.getRowModel().rows.map(row => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map(cell => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DownloadCard>
      )}
  
      {/* AddUserForm Modal for Adding/Editing Pilots */}
      {companyData.length === 1 && (
        <AddUserForm
          open={isModalOpen}
          handleClose={handleModalClose}
          onUserAdded={handlePilotAdded}
          pilotToEdit={pilotToEdit}
          companyId={companyData[0].companyId} // Pass the single companyId
        />
      )}
    </>
  );
};

// Wrap the component with React.memo to prevent unnecessary re-renders
export default PilotListTable;
