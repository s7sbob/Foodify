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
  ColumnDef,
} from '@tanstack/react-table';
import DownloadCard from 'src/components/shared/DownloadCard';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import AddZoneForm from './AddZoneForm'; // Import the AddZoneForm component
import { useSelector } from 'react-redux';
import { AppState } from 'src/store/Store';
import { ZoneData, Company } from './types';
import { useNotification } from '../../../context/NotificationContext'; // Import the hook
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const ZoneListTable: React.FC = () => {
  const { t } = useTranslation();

  const [data, setData] = useState<ZoneData[]>([]);
  const [companyData, setCompanyData] = useState<Company[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoneToEdit, setZoneToEdit] = useState<ZoneData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use the Notification Context
  const { showNotification } = useNotification();

  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token =
    useSelector((state: AppState) => state.auth.token) ||
    localStorage.getItem('token');

  // Fetch Zones and Company Data
  const fetchZonesData = useCallback(async () => {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    setLoading(true);
    setError(null);
    try {
      const [zonesResponse, companyResponse] = await Promise.all([
        axios.get<ZoneData[]>(`${baseurl}/PosZone/GetZones`, { headers }),
        axios.get<Company[]>(`${baseurl}/Company/GetCompanyData`, { headers }),
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
    setIsModalOpen(true);
  };

  // Handle Add Zone Action
  const handleAddZone = () => {
    setZoneToEdit(null); // Ensure no zone is set for adding
    setIsModalOpen(true);
  };

  // Define Columns
  const columnHelper = createColumnHelper<ZoneData>();

  // Create a mapping from branchId to currency
  const branchCurrencyMap = useMemo(() => {
    const map: Record<string, string> = {};
    companyData.forEach(company => {
      company.branches.forEach(branch => {
        map[branch.branchId] = branch.currency;
      });
    });
    return map;
  }, [companyData]);

  const columns = useMemo<ColumnDef<ZoneData, any>[]>(() => [
    columnHelper.accessor('name', {
      header: t('table.zoneName') || 'Zone Name',
      cell: info => (
        <Typography variant="h6" fontWeight="400">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('deliveryFee', {
      header: t('table.deliveryFee') || 'Delivery Fee',
      cell: info => {
        const currency = branchCurrencyMap[info.row.original.branchId] || 'LE';
        return (
          <Typography variant="h6" fontWeight="400">
            {info.getValue().toFixed(2)} {currency}
          </Typography>
        );
      },
      enableColumnFilter: true,
    }),
    columnHelper.accessor('deliveryBonus', {
      header: t('table.deliveryBonus') || 'Delivery Bonus',
      cell: info => {
        const currency = branchCurrencyMap[info.row.original.branchId] || 'LE';
        return (
          <Typography variant="h6" fontWeight="400">
            {info.getValue().toFixed(2)} {currency}
          </Typography>
        );
      },
      enableColumnFilter: true,
    }),
    // Company Name Column
    columnHelper.accessor('companyId', {
      header: t('table.companyName') || 'Company Name',
      cell: info => {
        const company = companyData.find(c => c.companyId === info.getValue());
        return (
          <Typography variant="h6" fontWeight="400">
            {company ? company.companyName : t('table.unknown') || 'Unknown'}
          </Typography>
        );
      },
      enableColumnFilter: true,
    }),
    // Branch Name Column
    columnHelper.accessor('branchId', {
      header: t('table.branchName') || 'Branch Name',
      cell: info => {
        // Find the company first
        const company = companyData.find(c => c.companyId === (info.row.original as ZoneData).companyId);
        const branch = company?.branches.find(b => b.branchId === info.getValue());
        return (
          <Typography variant="h6" fontWeight="400">
            {branch ? branch.branchName : t('table.unknown') || 'Unknown'}
          </Typography>
        );
      },
      enableColumnFilter: true,
    }),
    // Actions Column
    columnHelper.display({
      id: 'actions',
      header: t('table.actions') || 'Actions',
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
  ], [columnHelper, companyData, branchCurrencyMap, handleEdit, t]);

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
    const headers = [
      t('table.zoneName') || 'Zone Name',
      t('table.deliveryFee') || 'Delivery Fee',
      t('table.deliveryBonus') || 'Delivery Bonus',
      t('table.companyName') || 'Company Name',
      t('table.branchName') || 'Branch Name'
    ];
    const rows = data.map((zone: ZoneData) => {
      const company = companyData.find(c => c.companyId === zone.companyId);
      const branch = company?.branches.find(b => b.branchId === zone.branchId);
      const currency = branchCurrencyMap[zone.branchId] || 'LE';
      return [
        zone.name,
        `${zone.deliveryFee.toFixed(2)} ${currency}`,
        `${zone.deliveryBonus.toFixed(2)} ${currency}`,
        company ? company.companyName : t('table.unknown') || 'Unknown',
        branch ? branch.branchName : t('table.unknown') || 'Unknown',
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
  }, [data, companyData, branchCurrencyMap, t]);

  // Handle Modal Close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setZoneToEdit(null);
  }, []);

  // Handle Zone Added or Updated
  const handleZoneAdded = useCallback(() => {
    fetchZonesData();
  }, [fetchZonesData]);

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
          onClick={handleAddZone}
          disabled={companyData.length !== 1} // Disable if not exactly one company
        >
          {t('buttons.addZone') || 'Add Zone'}
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
        <Typography color="error" align="center">
          {error}
        </Typography>
      ) : (
        <DownloadCard title={t('table.zoneList') || 'Zone List'} onDownload={handleDownload}>
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

      {/* AddZoneForm Modal */}
      {singleCompanyId && (
        <AddZoneForm
          open={isModalOpen}
          handleClose={handleModalClose}
          onZoneAdded={handleZoneAdded} // Refresh the table after adding/editing
          zoneToEdit={zoneToEdit}
          companyId={singleCompanyId} // Pass the single companyId
        />
      )}
    </>
  );
};

export default ZoneListTable;
