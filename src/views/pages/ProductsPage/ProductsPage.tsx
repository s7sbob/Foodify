// src\views\pages\ProductsPage\ProductsPage.tsx

import React from 'react';
import TopBar from './components/TopBar';
import CategoryTabs from './components/CategoryTabs';
import ProductGrid from './components/ProductGrid';
import ResponsiveSidebar from './components/ResponsiveSidebar';
import RightActionBarOptions from './components/RightActionBarOptions';
import RightActionBarActions from './components/RightActionBarActions';
import {
  Box,
  IconButton,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';

const drawerWidth = 278; // Width of the left sidebar

const ProductsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Left Sidebar */}
      <ResponsiveSidebar />

      {/* Middle Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2 },
          bgcolor: '#f5f5f5',
          marginLeft: isMobile ? 0 : `${drawerWidth}px`, // Adjust margin based on sidebar visibility
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* TopBar */}
        <TopBar />

        {/* CategoryTabs and Back Button */}
        <Box
          display="flex"
          alignItems="center"
          mt={{ xs: 1, sm: 2 }}
          mb={{ xs: 1, sm: 2 }}
          gap={{ xs: 1, sm: 2 }}
          flexDirection={isMobile ? 'column' : 'row'}
        >
          <CategoryTabs />
          <IconButton
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              borderRadius: '50%',
              padding: '10px',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
            onClick={() => window.history.back()}
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>

        {/* Split Search Bar and Filter Button */}
        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
          {/* Search Bar */}
          <TextField
            variant="outlined"
            placeholder="Search here..."
            fullWidth
            sx={{
              bgcolor: 'white',
              borderRadius: '10px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                paddingRight: '8px',
                borderColor: 'rgba(0, 0, 0, 0.12)', // Adjust border color to match the image
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // Optional subtle shadow
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Filter Button */}
          <IconButton
            sx={{
              bgcolor: 'white',
              borderRadius: '10px', // Rounded corners for the button
              padding: '12px',
              border: '1px solid rgba(0, 0, 0, 0.12)', // Border for the button
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // Optional shadow for matching style
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <TuneIcon />
          </IconButton>
        </Box>

        {/* ProductGrid */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', padding: 0 }}>
          <ProductGrid />
        </Box>
      </Box>

      {/* Right Action Bar */}
      {!isMobile && (
        <Box
          sx={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Poppins',
            fontSize: '16px',
            fontWeight: 400,
            lineHeight: '24px',
            textAlign: 'center',
            bgcolor: theme.palette.background.paper,
            boxShadow: 3,
            padding: 1,
          }}
        >
          <RightActionBarOptions />
          <RightActionBarActions />
        </Box>
      )}
    </Box>
  );
};

export default ProductsPage;
