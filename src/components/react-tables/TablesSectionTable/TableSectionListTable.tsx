// src/components/TableSections/TableSectionListTable.tsx

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
import AddTableSectionForm from './AddTableSectionForm';
import { useSelector } from 'react-redux';
import { AppState } from 'src/store/Store';
import { TableSection, Company } from 'src/types/TablesTable';
import { useNotification } from '../../../context/NotificationContext';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const TableSectionListTable: React.FC = () => {
  const { t } = useTranslation();

  const [data, setData] = useState<TableSection[]>([]);
  const [companyData, setCompanyData] = useState<Company[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [open, setOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState<TableSection | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use the Notification Context
  const { showNotification } = useNotification();

  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token =
    useSelector((state: AppState) => state.auth.token) ||
    localStorage.getItem('token');

  const fetchTableSectionsData = useCallback(async () => {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    setLoading(true);
    setError(null);
    try {
      const [sectionsResponse, companyResponse] = await Promise.all([
        axios.get(`${baseurl}/PosTableSection/GetTableSections`, { headers }),
        axios.get(`${baseurl}/Company/GetCompanyData`, { headers }),
      ]);

      const sections: TableSection[] = sectionsResponse.data || [];
      const companies: Company[] = Array.isArray(companyResponse.data)
        ? companyResponse.data
        : [companyResponse.data];

      setData(sections);
      setCompanyData(companies);
    } catch (err: any) {
      console.error('Error fetching table sections:', err);
      setError(t('errors.fetchTableSections') || 'Failed to fetch table sections. Please try again later.');
      showNotification(t('notifications.fetchTableSectionsFailed') || 'Failed to fetch table sections.', 'error', t('notifications.error') || 'Error');
    } finally {
      setLoading(false);
    }
  }, [baseurl, token, showNotification, t]);

  // Fetch data on component mount
  useEffect(() => {
    fetchTableSectionsData();
  }, [fetchTableSectionsData]);

  // Handle Edit Action
  const handleEdit = (section: TableSection) => {
    setSectionToEdit(section);
    handleOpen();
  };

  // Define Columns
  const columnHelper = createColumnHelper<TableSection>();

  const columns = useMemo<ColumnDef<TableSection, any>[]>(() => [
    columnHelper.accessor('sectionName', {
      header: t('tableSections.sectionName') || 'Section Name',
      cell: info => (
        <Typography variant="h6" fontWeight="400">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('service', {
      header: t('tableSections.service') || 'Service',
      cell: info => (
        <Typography variant="h6" fontWeight="400">
          {info.getValue().toFixed(2)}%
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    // Company Name Column - Auto-assigned
    columnHelper.accessor('companyId', {
      header: t('tableSections.companyName') || 'Company Name',
      cell: () => {
        const company = companyData[0]; // Assuming only one company
        return (
          <Typography variant="h6" fontWeight="400">
            {company ? company.companyName : t('tableSections.unknown') || 'Unknown'}
          </Typography>
        );
      },
      enableColumnFilter: false, // No need to filter by company
    }),
    // Branch Name Column
    columnHelper.accessor('branchId', {
      header: t('tableSections.branchName') || 'Branch Name',
      cell: info => {
        const company = companyData[0]; // Assuming only one company
        const branch = company?.branches.find(b => b.branchId === info.getValue());
        return (
          <Typography variant="h6" fontWeight="400">
            {branch ? branch.branchName : t('tableSections.unknown') || 'Unknown'}
          </Typography>
        );
      },
      enableColumnFilter: true,
    }),
    // Actions Column
    columnHelper.display({
      id: 'actions',
      header: t('tableSections.actions') || 'Actions',
      cell: info => (
        <Stack direction="row" spacing={1}>
          <Tooltip title={t('tableSections.edit') || 'Edit'}>
            <IconButton
              color="primary"
              aria-label={t('tableSections.edit') || 'edit'}
              onClick={() => handleEdit(info.row.original)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          {/* Add more action buttons if needed */}
        </Stack>
      ),
    }),
  ], [columnHelper, companyData, t]);

  // Initialize the table
  const table = useReactTable<TableSection>({
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
      t('tableSections.sectionName') || 'Section Name',
      t('tableSections.service') || 'Service',
      t('tableSections.companyName') || 'Company Name',
      t('tableSections.branchName') || 'Branch Name'
    ];
    const company = companyData[0]; // Assuming only one company
    const rows = data.map((section: TableSection) => {
      const branch = company?.branches.find(b => b.branchId === section.branchId);
      return [
        section.sectionName,
        `${section.service.toFixed(2)}%`,
        company ? company.companyName : t('tableSections.unknown') || 'Unknown',
        branch ? branch.branchName : t('tableSections.unknown') || 'Unknown',
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'table-sections-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data, companyData, t]);

  // Modal Control Functions
  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setSectionToEdit(null);
  }, []);

  return (
    <>
      {/* Add Table Section Button */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          {t('buttons.addTableSection') || 'Add Table Section'}
        </Button>
      </Box>

      {/* Column Visibility Toggles */}
      <Box mb={2}>
        <FormGroup row>
          {table
            .getAllLeafColumns()
            .filter(column => column.id !== 'actions') // Exclude actions column
            .map(column => (
              <FormControlLabel
                key={column.id}
                control={
                  <Checkbox
                    checked={column.getIsVisible()}
                    onChange={e => column.toggleVisibility(e.target.checked)}
                  />
                }
                label={column.columnDef.header as string || column.id}
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
        <DownloadCard title={t('tableSections.tableSectionsList') || 'Table Sections List'} onDownload={handleDownload}>
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

      {/* AddTableSectionForm Modal */}
      <AddTableSectionForm
        open={open}
        handleClose={handleClose}
        onSectionAdded={fetchTableSectionsData} // Refresh the table after adding/editing
        sectionToEdit={sectionToEdit}
      />
    </>
  );
};

export default TableSectionListTable;
