// src/components/Company/BranchesTable.tsx

import React from 'react';
import {
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  TableHead,
  IconButton,
  Tooltip,
  TextField,
  Box,
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
  ColumnDef,
} from '@tanstack/react-table';
import EditIcon from '@mui/icons-material/Edit';
import { Branch } from '../../../types/companyTypes';
import { useTranslation } from 'react-i18next';

interface BranchesTableProps {
  branches: Branch[];
  onEditBranch: (branch: Branch) => void; // Function to handle editing a branch
}

const BranchesTable: React.FC<BranchesTableProps> = ({ branches, onEditBranch }) => {
  const { t } = useTranslation();

  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const columnHelper = createColumnHelper<Branch>();

  const columns: ColumnDef<Branch, any>[] = [
    columnHelper.accessor('branchCode', {
      header: t('branchesTable.branchCode') || 'Branch Code',
      cell: info => (
        <Typography variant="body1">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('branchName', {
      header: t('branchesTable.branchName') || 'Branch Name',
      cell: info => (
        <Typography variant="body1">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('country', {
      header: t('branchesTable.country') || 'Country',
      cell: info => (
        <Typography variant="body1">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('governate', {
      header: t('branchesTable.governate') || 'Governate',
      cell: info => (
        <Typography variant="body1">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('address', {
      header: t('branchesTable.address') || 'Address',
      cell: info => (
        <Typography variant="body1">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('phoneNo1', {
      header: t('branchesTable.phoneNumber1') || 'Phone Number 1',
      cell: info => (
        <Typography variant="body1">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('phoneNo2', {
      header: t('branchesTable.phoneNumber2') || 'Phone Number 2',
      cell: info => (
        <Typography variant="body1">
          {info.getValue() || '-'}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('email', {
      header: t('branchesTable.email') || 'Email',
      cell: info => (
        <Typography variant="body1">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('currency', {
      header: t('branchesTable.currency') || 'Currency',
      cell: info => (
        <Typography variant="body1">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.display({
      id: 'actions',
      header: t('branchesTable.actions') || 'Actions',
      cell: info => (
        <Tooltip title={t('actions.edit') || 'Edit'}>
          <IconButton
            color="primary"
            aria-label={t('actions.edit') || 'Edit'}
            onClick={() => onEditBranch(info.row.original)}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
      ),
    }),
  ];

  const table = useReactTable<Branch>({
    data: branches,
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

  return (
    <>
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
                label={column.columnDef.header as string}
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

      {/* Branches Table */}
      <TableContainer>
        <Table>
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
    </>
  );
};

export default BranchesTable;
