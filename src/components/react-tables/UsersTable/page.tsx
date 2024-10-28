import * as React from 'react';
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
import WindowIcon from '@mui/icons-material/Window';
import SecurityIcon from '@mui/icons-material/Security';
import AddUserForm from './AddUserForm'; // Import the AddUserForm component
import { useCallback } from 'react';




// Define the data type interface
interface UserTableData {
  userCode: string;
  userName: string;
}

// Define the props for the component
interface TableProps {
  data: UserTableData[];
  onUserAdded: () => void; // Function called when a user is added
}

// Define the columns for UserCode and Username with action buttons on the right
const columnHelper = createColumnHelper<UserTableData>();

const defaultColumns = [
  columnHelper.accessor('userCode', {
    header: 'User Code',
    cell: info => (
      <Typography variant="h6" fontWeight="400">
        {info.getValue()}
      </Typography>
    ),
    enableColumnFilter: true,
  }),
  columnHelper.accessor('userName', {
    header: 'Username',
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
    cell: () => (
      <Stack direction="row" spacing={1}>
        <Tooltip title="Edit">
          <IconButton color="primary" aria-label="edit">
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Windows">
          <IconButton color="primary" aria-label="windows">
            <WindowIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Permissions">
          <IconButton color="primary" aria-label="permissions">
            <SecurityIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    ),
  }),
];

const ReactColumnVisibilityTable: React.FC<TableProps> = ({ data, onUserAdded }) => {
  const [globalFilter, setGlobalFilter] = React.useState(''); // State for global search input
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [open, setOpen] = React.useState(false); // State for modal

  const [columns] = React.useState(() => [...defaultColumns]);

  const table = useReactTable({
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

  const handleDownload = () => {
    const headers = ['User Code', 'User Name'];
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

  // Callback functions for opening and closing the AddUserForm modal
  const handleOpen = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <>

      {/* Add User button */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Add USer
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

      {/* Table with per-column search inputs */}
      <DownloadCard title="Users Table" onDownload={handleDownload}>
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

      {/* AddUserForm Modal */}
      <AddUserForm open={open} handleClose={handleClose} onUserAdded={onUserAdded} />
    </>
  );
};

export default ReactColumnVisibilityTable;
