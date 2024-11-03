// src/components/ReactColumnVisibilityTable.tsx

import React from 'react';
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
  ColumnDef,
} from '@tanstack/react-table';
import DownloadCard from 'src/components/shared/DownloadCard';
import EditIcon from '@mui/icons-material/Edit';
import WindowIcon from '@mui/icons-material/Window';
import SecurityIcon from '@mui/icons-material/Security';
import AddUserForm from './AddUserForm'; // Import the AddUserForm component
import { useTranslation } from 'react-i18next';

// Define the data type interface
interface UserTableData {
  userCode: string;
  userName: string;
}

// Define the props for the component
interface TableProps {
  data: UserTableData[];
  onUserAdded: () => void; // Function called when a user is added or edited
}

// Initialize column helper
const columnHelper = createColumnHelper<UserTableData>();

const ReactColumnVisibilityTable: React.FC<TableProps> = ({ data, onUserAdded }) => {
  const { t } = useTranslation();

  // State for table filtering and visibility
  const [globalFilter, setGlobalFilter] = React.useState(''); // State for global search input
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  // States for Add User Modal
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  // States for Edit User Modal
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editUser, setEditUser] = React.useState<UserTableData | null>(null);

  // Handlers for Add User Modal
  const handleAddOpen = () => {
    setIsAddModalOpen(true);
  };

  const handleAddClose = () => {
    setIsAddModalOpen(false);
  };

  // Handlers for Edit User Modal
  const handleEditOpen = (user: UserTableData) => {
    setEditUser(user);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditUser(null);
    setIsEditModalOpen(false);
  };

  // Define the columns with translated headers
  const defaultColumns: ColumnDef<UserTableData, any>[] = [
    columnHelper.accessor('userCode', {
      header: () => t('table.userCode') || 'User Code', // Provide fallback
      cell: info => (
        <Typography variant="h6" fontWeight="400">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('userName', {
      header: () => t('table.userName') || 'Username', // Provide fallback
      cell: info => (
        <Typography variant="h6" fontWeight="400">
          {info.getValue()}
        </Typography>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.display({
      id: 'actions',
      header: () => t('table.actions') || 'Actions', // Provide fallback
      cell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title={t('actions.edit') || 'Edit'}>
            <IconButton
              color="primary"
              aria-label={t('actions.edit') || 'Edit'}
              onClick={() => handleEditOpen(row.original)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('actions.windows') || 'Windows'}>
            <IconButton
              color="primary"
              aria-label={t('actions.windows') || 'Windows'}
              // Add onClick handler if needed
            >
              <WindowIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('actions.permissions') || 'Permissions'}>
            <IconButton
              color="primary"
              aria-label={t('actions.permissions') || 'Permissions'}
              // Add onClick handler if needed
            >
              <SecurityIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns: defaultColumns,
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

  const handleDownload = () => {
    const headers = [t('table.userCode') || 'User Code', t('table.userName') || 'Username'];
    const rows = data.map((item: UserTableData) => [item.userCode, item.userName]);

    const csvContent = [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'user-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Add User button */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" color="primary" onClick={handleAddOpen}>
          {t('buttons.addUser') || 'Add User'}
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
                label={t(`table.${column.id}`) || column.id} // Provide fallback
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

      {/* Table with per-column search inputs */}
      <DownloadCard title={t('table.usersTable')} onDownload={handleDownload}>
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

      {/* AddUserForm Modal for Adding Users */}
      <AddUserForm
        open={isAddModalOpen}
        handleClose={handleAddClose}
        onUserAdded={onUserAdded}
      />

      {/* AddUserForm Modal for Editing Users */}
      {editUser && (
        <AddUserForm
          open={isEditModalOpen}
          handleClose={handleEditClose}
          onUserAdded={onUserAdded}
          userToEdit={editUser}
        />
      )}
    </>
  );
};

export default ReactColumnVisibilityTable;
