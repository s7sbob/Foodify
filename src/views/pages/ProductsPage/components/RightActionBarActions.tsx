import React from 'react';
import { Button, Box, Typography, useTheme } from '@mui/material';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import PaymentIcon from '@mui/icons-material/Payment';
import MenuIcon from '@mui/icons-material/Menu';

const actions = [
  { label: 'Change Table', icon: <TableRestaurantIcon /> },
  { label: 'Change Waiter', icon: <PersonIcon /> },
  { label: 'Change Pilot', icon: <LocalShippingIcon /> },
  { label: 'Transfer Item', icon: <CompareArrowsIcon /> },
  { label: 'Transfer Table', icon: <MergeTypeIcon /> },
  { label: 'Split Table', icon: <MergeTypeIcon /> },
  { label: 'Change Payment', icon: <PaymentIcon /> },
  { label: 'Open Drawer', icon: <MenuIcon /> },
];

const RightActionBarActions: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 0.5,
        gap: '4px',
        fontFamily: 'Poppins',
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: '1.25rem',
        textAlign: 'center',
        overflowY: 'auto',
      }}
    >
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="contained"
          sx={{
            color: '#FFF',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            flexDirection: 'column',
            borderRadius: '8px',
            bgcolor: '#1E88E5', // Background color
            padding: '4px',
            minWidth: '100%', // Full width for buttons
            '&:hover': {
              bgcolor: '#1565C0',
            },
          }}
        >
          {React.cloneElement(action.icon, { fontSize: 'small' })}
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              lineHeight: '0.75rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {action.label}
          </Typography>
        </Button>
      ))}
    </Box>
  );
};

export default RightActionBarActions;
