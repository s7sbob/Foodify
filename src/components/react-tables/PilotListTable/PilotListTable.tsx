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
} from '@tanstack/react-table';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DownloadCard from 'src/components/shared/DownloadCard';
import AddUserForm from './AddUserForm';
import { useSelector } from 'react-redux';
import { AppState } from 'src/store/Store';
import { PilotTableData, Company } from './types';
import { useNotification } from '../../../context/NotificationContext'; // Import the hook
import axios from 'axios';

interface TableProps {
  // Define any props if necessary
}

const PilotListTable: React.FC<TableProps> = () => {
  const [data, setData] = useState<PilotTableData[]>([]);
  const [companyData, setCompanyData] = useState<Company[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [open, setOpen] = useState(false);
  const [pilotToEdit, setPilotToEdit] = useState<PilotTableData | null>(null); // Corrected state

  // Use the Notification Context
  const { showNotification } = useNotification();

  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token =
    useSelector((state: AppState) => state.auth.token) ||
    localStorage.getItem('token');

  const fetchPilotData = useCallback(async () => {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    setLoading(true);
    setError(null);
    try {
      const [pilotResponse, companyResponse] = await Promise.all([
        axios.get(`${baseurl}/PosPilot/GetPilots`, { headers }),
        axios.get(`${baseurl}/Company/GetCompanyData`, { headers }),
      ]);

      const companies: Company[] = Array.isArray(companyResponse.data)
        ? companyResponse.data
        : [companyResponse.data];

      setCompanyData(companies);

      const company = companies.length === 1 ? companies[0] : null;

      if (!company) {
        throw new Error('Multiple companies found or no company associated with the user.');
      }

      const updatedData = pilotResponse.data.map((pilot: any) => {
        // Find the branch within the companyData
        const branch = company.branches.find((b: any) => b.branchId === pilot.branchId) || {};

        return {
          pilotId: pilot.pilotId,
          name: pilot.name,
          phone: pilot.phone,
          isActive: pilot.isActive,
          companyName: company.companyName || 'Unknown',
          companyId: company.companyId || '',
          branchName: branch.branchName || 'Unknown',
          branchId: branch.branchId || '',
        };
      });

      setData(updatedData);
    } catch (error: any) {
      console.error('Error fetching pilot data:', error);
      setError('Failed to fetch pilots. Please try again later.');
      showNotification('Failed to fetch pilots.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  }, [baseurl, token, showNotification]);

  // Fetch data on component mount
  useEffect(() => {
    fetchPilotData();
  }, [fetchPilotData]);

  // Handle Edit Action
  const handleEdit = (pilot: PilotTableData) => {
    setPilotToEdit(pilot);
    handleOpen();
  };

  // Define Columns
  const columnHelper = createColumnHelper<PilotTableData>();

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Pilot Name',
      cell: info => {
        const isActive = info.row.original.isActive;
        return (
          <Box display="flex" alignItems="center">
            <Typography variant="h6" fontWeight="400">
              {info.getValue()}
            </Typography>
            <Chip
              label={isActive ? 'Active' : 'Inactive'}
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
      header: 'Phone Number',
      cell: info => (
        <Typography variant="h6" fontWeight="400">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('companyName', {
      header: 'Company Name',
      cell: info => (
        <Typography variant="h6" fontWeight="400">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('branchName', {
      header: 'Branch Name',
      cell: info => (
        <Typography variant="h6" fontWeight="400">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: info => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit">
            <IconButton
              color="primary"
              aria-label="edit"
              onClick={() => handleEdit(info.row.original)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          {/* Add more action buttons here if needed */}
        </Stack>
      ),
    }),
  ], [columnHelper, handleEdit]);

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
    const headers = ['Pilot Name', 'Phone Number', 'Company Name', 'Branch Name', 'Status'];
    const rows = data.map((item: PilotTableData) => [
      item.name,
      item.phone,
      item.companyName,
      item.branchName,
      item.isActive ? 'Active' : 'Inactive',
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
  }, [data]);

  // Modal Control Functions
  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setPilotToEdit(null);
  }, []);

  // Loading and error states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Pilot Added or Updated
  const handlePilotAdded = useCallback(() => {
    fetchPilotData();
  }, [fetchPilotData]);

  return (
    <>
      {/* Add Pilot button */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setPilotToEdit(null); // Ensure no pilot is set for adding
            handleOpen();
          }}
          startIcon={<AddIcon />}
        >
          Add Pilot
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
                label={column.columnDef.header as string}
              />
            ))}
        </FormGroup>
      </Box>

      {/* Global Search Input */}
      <Box mb={2}>
        <TextField
          label="Global Search"
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
        <Typography color="error" align="center">
          {error}
        </Typography>
      ) : (
        <DownloadCard title="Pilot List" onDownload={handleDownload}>
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
                                  placeholder={`Search...`}
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

      {/* AddUserForm Modal */}
      {companyData.length === 1 && (
        <AddUserForm
          open={open}
          handleClose={handleClose}
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
