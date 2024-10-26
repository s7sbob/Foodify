// src/components/Waiters/WaitersTable.tsx

import React, { useState, useCallback, useMemo } from 'react';
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
import AddWaiterForm from './AddWaiterForm';
import EditWaiterForm from './EditWaiterForm';
import { EnhancedWaiter } from 'src/types/Waiter';
import { CompanyData } from 'src/types/companyTypes';
import { useSelector } from 'react-redux';
import { AppState } from 'src/store/Store';
import { useNotification } from '../../../context/NotificationContext'; // Import the hook

interface TableProps {
  data: EnhancedWaiter[];
  companies: CompanyData[];
  onWaiterAdded: () => void;
  onWaiterUpdated: () => void;
}

const columnHelper = createColumnHelper<EnhancedWaiter>();

const WaitersTable: React.FC<TableProps> = ({ data, companies, onWaiterAdded, onWaiterUpdated }) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedWaiter, setSelectedWaiter] = useState<EnhancedWaiter | null>(null);

  // Use the Notification Context
  const { showNotification } = useNotification();

  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const token =
    useSelector((state: AppState) => state.auth.token) ||
    localStorage.getItem('authToken');

  // Define columns
  const columns = useMemo(() => [
    columnHelper.accessor('waiterName', {
      header: 'Waiter Name',
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
    columnHelper.accessor('companyName', {
      header: 'Company Name',
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
          {/* Add more action buttons if needed */}
        </Stack>
      ),
    }),
  ], []);

  // Initialize the table
  const table = useReactTable<EnhancedWaiter>({
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

  // Handle Edit
  const handleEdit = useCallback((waiter: EnhancedWaiter) => {
    setSelectedWaiter(waiter);
    setOpenEdit(true);
  }, []);

  // Handle Download CSV
  const handleDownload = useCallback(() => {
    const headers = ['Waiter Name', 'Branch Name', 'Company Name'];
    const rows = data.map((item: EnhancedWaiter) => [
      item.waiterName,
      item.branchName,
      item.companyName,
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'waiters-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data]);

  // Modal Control Functions
  const handleOpenAdd = useCallback(() => {
    setOpenAdd(true);
  }, []);

  const handleCloseAdd = useCallback(() => {
    setOpenAdd(false);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setOpenEdit(false);
    setSelectedWaiter(null);
  }, []);

  return (
    <>
      {/* Add Waiter button */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" color="primary" onClick={handleOpenAdd}>
          Add Waiter
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

      {/* Display Table */}
      <DownloadCard title="Waiters Table" onDownload={handleDownload}>
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

      {/* AddWaiterForm Modal */}
      <AddWaiterForm
        open={openAdd}
        handleClose={handleCloseAdd}
        onWaiterAdded={onWaiterAdded}
        companies={companies} // Pass companies as prop
      />

      {/* EditWaiterForm Modal */}
      {selectedWaiter && (
        <EditWaiterForm
          open={openEdit}
          handleClose={handleCloseEdit}
          waiter={selectedWaiter}
          onWaiterUpdated={onWaiterUpdated}
          companies={companies} // Pass companies as prop
        />
      )}
    </>
  );
};

// Wrap the component with React.memo to prevent unnecessary re-renders
export default React.memo(WaitersTable);
