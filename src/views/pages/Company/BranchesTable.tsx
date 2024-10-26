// BranchesTable.tsx

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
} from '@tanstack/react-table';
import EditIcon from '@mui/icons-material/Edit';
import { Branch } from '../../../types/companyTypes';

interface BranchesTableProps {
  branches: Branch[];
  onEditBranch: (branch: Branch) => void; // Function to handle editing a branch
}

const BranchesTable: React.FC<BranchesTableProps> = ({ branches, onEditBranch }) => {
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const columnHelper = createColumnHelper<Branch>();

  const columns = [
    columnHelper.accessor('branchCode', {
      header: 'Branch Code',
      cell: info => (
        <Typography variant="body1">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('branchName', {
      header: 'Branch Name',
      cell: info => (
        <Typography variant="body1">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('country', {
      header: 'Country',
      cell: info => (
        <Typography variant="body1">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('governate', {
      header: 'Governate',
      cell: info => (
        <Typography variant="body1">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('address', {
      header: 'Address',
      cell: info => (
        <Typography variant="body1">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: info => (
        <Tooltip title="Edit">
          <IconButton
            color="primary"
            aria-label="edit-branch"
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
          label="Global Search"
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
    </>
  );
};

export default BranchesTable;
