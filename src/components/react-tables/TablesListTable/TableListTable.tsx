// src/components/Tables/TableListTable.tsx

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
import AddTableForm from './AddTableForm';
import { useSelector } from 'react-redux';
import { AppState } from 'src/store/Store';
import { Table as TableType, Company, TableSection } from 'src/types/TablesTable';
import { useNotification } from '../../../context/NotificationContext';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const TableListTable: React.FC = () => {
  const { t } = useTranslation();

  const [data, setData] = useState<TableType[]>([]);
  const [companyData, setCompanyData] = useState<Company[]>([]);
  const [tableSections, setTableSections] = useState<TableSection[]>([]); // Manage TableSections separately
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [open, setOpen] = useState(false);
  const [tableToEdit, setTableToEdit] = useState<TableType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use the Notification Context
  const { showNotification } = useNotification();

  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token =
    useSelector((state: AppState) => state.auth.token) ||
    localStorage.getItem('token');

  const fetchTablesData = useCallback(async () => {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    setLoading(true);
    setError(null);
    try {
      const [tablesResponse, tableSectionsResponse, companyResponse] = await Promise.all([
        axios.get(`${baseurl}/PosTable/GetTables`, { headers }),
        axios.get(`${baseurl}/PosTableSection/GetTableSections`, { headers }), // Fetch TableSections
        axios.get(`${baseurl}/Company/GetCompanyData`, { headers }),
      ]);

      const tables: TableType[] = tablesResponse.data || [];
      const sections: TableSection[] = tableSectionsResponse.data || [];
      const companies: Company[] = Array.isArray(companyResponse.data)
        ? companyResponse.data
        : [companyResponse.data];

      setData(tables);
      setTableSections(sections);
      setCompanyData(companies);

    } catch (err: any) {
      console.error('Error fetching tables:', err);
      setError(t('errors.fetchTables') || 'Failed to fetch tables. Please try again later.');
      showNotification(t('notifications.fetchTablesFailed') || 'Failed to fetch tables.', 'error', t('notifications.error') || 'Error');
    } finally {
      setLoading(false);
    }
  }, [baseurl, token, showNotification, t]);

  // Fetch data on component mount
  useEffect(() => {
    fetchTablesData();
  }, [fetchTablesData]);

  // Handle Edit Action
  const handleEdit = (table: TableType) => {
    setTableToEdit(table);
    handleOpen();
  };

  // Define Columns
  const columnHelper = createColumnHelper<TableType>();

  const columns = useMemo<ColumnDef<TableType, any>[]>(() => [
    columnHelper.accessor('tableName', {
      header: t('tables.tableName') || 'Table Name',
      cell: info => (
        <Typography variant="h6" fontWeight="400">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    // Table Section Name Column
    columnHelper.accessor('tableSectionId', {
      header: t('tables.tableSection') || 'Table Section',
      cell: info => {
        const section = tableSections.find(ts => ts.tableSectionId === info.getValue());
        return (
          <Typography variant="h6" fontWeight="400">
            {section ? section.sectionName : t('tables.unknown') || 'Unknown'}
          </Typography>
        );
      },
      enableColumnFilter: true,
    }),
    // Company Name Column - Auto-assigned
    columnHelper.accessor('companyId', {
      header: t('tables.companyName') || 'Company Name',
      cell: info => {
        const company = companyData[0]; // Assuming only one company
        return (
          <Typography variant="h6" fontWeight="400">
            {company ? company.companyName : t('tables.unknown') || 'Unknown'}
          </Typography>
        );
      },
      enableColumnFilter: false, // No need to filter by company
    }),
    // Branch Name Column
    columnHelper.accessor('branchId', {
      header: t('tables.branchName') || 'Branch Name',
      cell: info => {
        const company = companyData[0]; // Assuming only one company
        const branch = company?.branches.find(b => b.branchId === info.getValue());
        return (
          <Typography variant="h6" fontWeight="400">
            {branch ? branch.branchName : t('tables.unknown') || 'Unknown'}
          </Typography>
        );
      },
      enableColumnFilter: true,
    }),
    // Actions Column
    columnHelper.display({
      id: 'actions',
      header: t('tables.actions') || 'Actions',
      cell: info => (
        <Stack direction="row" spacing={1}>
          <Tooltip title={t('tables.edit') || 'Edit'}>
            <IconButton
              color="primary"
              aria-label={t('tables.edit') || 'edit'}
              onClick={() => handleEdit(info.row.original)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          {/* Add more action buttons if needed */}
        </Stack>
      ),
    }),
  ], [columnHelper, companyData, tableSections, t]);

  // Initialize the table
  const table = useReactTable<TableType>({
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
      t('tables.tableName') || 'Table Name',
      t('tables.tableSection') || 'Table Section',
      t('tables.companyName') || 'Company Name',
      t('tables.branchName') || 'Branch Name'
    ];
    const company = companyData[0]; // Assuming only one company
    const rows = data.map((table: TableType) => {
      const branch = company?.branches.find(b => b.branchId === table.branchId);
      const tableSection = tableSections.find(ts => ts.tableSectionId === table.tableSectionId);
      return [
        table.tableName,
        tableSection ? tableSection.sectionName : t('tables.unknown') || 'Unknown',
        company ? company.companyName : t('tables.unknown') || 'Unknown',
        branch ? branch.branchName : t('tables.unknown') || 'Unknown',
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tables-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data, companyData, tableSections, t]);

  // Modal Control Functions
  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setTableToEdit(null);
  }, []);

  return (
    <>
      {/* Add Table Button */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          {t('tables.addTable') || 'Add Table'}
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
        <DownloadCard title={t('tables.tablesList') || 'Tables List'} onDownload={handleDownload}>
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

      {/* AddTableForm Modal */}
      <AddTableForm
        open={open}
        handleClose={handleClose}
        onTableAdded={fetchTablesData} // Refresh the table after adding/editing
        tableToEdit={tableToEdit}
      />
    </>
  );
};

export default TableListTable;
