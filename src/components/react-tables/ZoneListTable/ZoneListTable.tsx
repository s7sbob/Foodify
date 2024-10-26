// src/components/Zones/ZoneListTable.tsx

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
import DownloadCard from 'src/components/shared/DownloadCard';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import AddZoneForm from './AddZoneForm';
import { useSelector } from 'react-redux';
import { AppState } from 'src/store/Store';
import { ZoneData, Company } from './types';
import { useNotification } from '../../../context/NotificationContext'; // Import the hook
import axios from 'axios';

const ZoneListTable: React.FC = () => {
  const [data, setData] = useState<ZoneData[]>([]);
  const [companyData, setCompanyData] = useState<Company[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [open, setOpen] = useState(false);
  const [zoneToEdit, setZoneToEdit] = useState<ZoneData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use the Notification Context
  const { showNotification } = useNotification();

  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token =
    useSelector((state: AppState) => state.auth.token) ||
    localStorage.getItem('token');

  const fetchZonesData = useCallback(async () => {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    setLoading(true);
    setError(null);
    try {
      const [zonesResponse, companyResponse] = await Promise.all([
        axios.get(`${baseurl}/PosZone/GetZones`, { headers }),
        axios.get(`${baseurl}/Company/GetCompanyData`, { headers }),
      ]);

      const zones: ZoneData[] = zonesResponse.data || [];
      const companies: Company[] = Array.isArray(companyResponse.data)
        ? companyResponse.data
        : [companyResponse.data];

      setData(zones);
      setCompanyData(companies);

    } catch (err: any) {
      console.error('Error fetching zones:', err);
      setError('Failed to fetch zones. Please try again later.');
      showNotification('Failed to fetch zones.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  }, [baseurl, token, showNotification]);

  // Fetch data on component mount
  useEffect(() => {
    fetchZonesData();
  }, [fetchZonesData]);

  // Handle Edit Action
  const handleEdit = (zone: ZoneData) => {
    setZoneToEdit(zone);
    handleOpen();
  };

  // Define Columns
  const columnHelper = createColumnHelper<ZoneData>();

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Zone Name',
      cell: info => (
        <Typography variant="h6" fontWeight="400">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('deliveryFee', {
      header: 'Delivery Fee',
      cell: info => (
        <Typography variant="h6" fontWeight="400">
          ${info.getValue().toFixed(2)}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('deliveryBonus', {
      header: 'Delivery Bonus',
      cell: info => (
        <Typography variant="h6" fontWeight="400">
          ${info.getValue().toFixed(2)}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    // Company Name Column
    columnHelper.accessor('companyId', {
      header: 'Company Name',
      cell: info => {
        const company = companyData.find(c => c.companyId === info.getValue());
        return (
          <Typography variant="h6" fontWeight="400">
            {company ? company.companyName : 'Unknown'}
          </Typography>
        );
      },
      enableColumnFilter: true,
    }),
    // Branch Name Column
    columnHelper.accessor('branchId', {
      header: 'Branch Name',
      cell: info => {
        // Find the company first
        const company = companyData.find(c => c.companyId === (info.row.original as ZoneData).companyId);
        const branch = company?.branches.find(b => b.branchId === info.getValue());
        return (
          <Typography variant="h6" fontWeight="400">
            {branch ? branch.branchName : 'Unknown'}
          </Typography>
        );
      },
      enableColumnFilter: true,
    }),
    // Actions Column
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
          {/* Add more action buttons if needed */}
        </Stack>
      ),
    }),
  ], [columnHelper, companyData, handleEdit]);

  // Initialize the table
  const table = useReactTable<ZoneData>({
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
    const headers = ['Zone Name', 'Delivery Fee', 'Delivery Bonus', 'Company Name', 'Branch Name'];
    const rows = data.map((zone: ZoneData) => {
      const company = companyData.find(c => c.companyId === zone.companyId);
      const branch = company?.branches.find(b => b.branchId === zone.branchId);
      return [
        zone.name,
        zone.deliveryFee.toFixed(2),
        zone.deliveryBonus.toFixed(2),
        company ? company.companyName : 'Unknown',
        branch ? branch.branchName : 'Unknown',
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'zones-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data, companyData]);

  // Modal Control Functions
  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setZoneToEdit(null);
  }, []);

  // Extract the single companyId (assuming only one company)
  const singleCompanyId = companyData.length === 1 ? companyData[0].companyId : '';

  return (
    <>
      {/* Add Zone Button */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          disabled={companyData.length !== 1} // Disable if not exactly one company
        >
          Add Zone
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
        <DownloadCard title="Zone List" onDownload={handleDownload}>
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

      {/* AddZoneForm Modal */}
      {singleCompanyId && (
        <AddZoneForm
          open={open}
          handleClose={handleClose}
          onZoneAdded={fetchZonesData} // Refresh the table after adding/editing
          zoneToEdit={zoneToEdit}
          companyId={singleCompanyId} // Pass the single companyId
        />
      )}
    </>
  );
};

export default ZoneListTable;
