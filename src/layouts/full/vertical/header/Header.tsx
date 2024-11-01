// src/layouts/full/vertical/header/Header.tsx

import React from 'react';
import {
  IconButton,
  Box,
  AppBar,
  useMediaQuery,
  Toolbar,
  styled,
  Stack,
  Theme,
} from '@mui/material';

import { useSelector, useDispatch } from 'src/store/Store';
import {
  toggleSidebar,
  toggleMobileSidebar,
  setDarkMode,
} from 'src/store/customizer/CustomizerSlice';
import { IconMenu2, IconMoon, IconSun } from '@tabler/icons-react';
import Notifications from './Notification';
import Profile from './Profile';
import Search from './Search';
import Language from './Language'; // Renamed for consistency
import { AppState } from 'src/store/Store';
import Navigation from './Navigation';
import MobileRightSidebar from './MobileRightSidebar';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const AppBarStyled = styled(AppBar)<{ customizer: AppState['customizer'] }>(({ theme, customizer }) => ({
  boxShadow: 'none',
  background: theme.palette.background.paper,
  justifyContent: 'center',
  backdropFilter: 'blur(4px)',
  [theme.breakpoints.up('lg')]: {
    minHeight: customizer.TopbarHeight,
  },
}));

const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
  width: '100%',
  color: theme.palette.text.secondary,
}));

const Header: React.FC = () => {
  const { t } = useTranslation(); // Initialize useTranslation
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  const lgDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  // Access customizer state
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();

  // Handler to toggle sidebar
  const handleSidebarToggle = React.useCallback(() => {
    if (lgUp) {
      dispatch(toggleSidebar());
    } else {
      dispatch(toggleMobileSidebar());
    }
  }, [dispatch, lgUp]);

  // Handler to toggle theme mode
  const handleThemeToggle = React.useCallback(() => {
    const newMode: 'light' | 'dark' = customizer.activeMode === 'light' ? 'dark' : 'light';
    dispatch(setDarkMode(newMode));
    localStorage.setItem('themeMode', newMode); // Persist theme mode
  }, [dispatch, customizer.activeMode]);

  return (
    <AppBarStyled position="sticky" color="default" customizer={customizer}>
      <ToolbarStyled>
        {/* Toggle Button Sidebar */}
        <IconButton
          color="inherit"
          aria-label={t('header.toggleSidebar') || 'Toggle Sidebar'} // Use translation
          onClick={handleSidebarToggle}
        >
          <IconMenu2 size="20" />
        </IconButton>

        {/* Search Dropdown */}
        <Search />

        {/* Navigation visible on large screens */}
        {lgUp && <Navigation />}

        <Box flexGrow={1} />

        <Stack spacing={1} direction="row" alignItems="center">
          <Language />

          {/* Theme Toggle Button */}
          <IconButton
            size="large"
            color="inherit"
            aria-label={t('header.toggleTheme') || 'Toggle Theme'} // Use translation
            onClick={handleThemeToggle}
          >
            {customizer.activeMode === 'light' ? (
              <IconMoon size="21" stroke="1.5" />
            ) : (
              <IconSun size="21" stroke="1.5" />
            )}
          </IconButton>

          <Notifications />

          {/* Toggle Right Sidebar for mobile */}
          {lgDown && <MobileRightSidebar />}

          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

export default Header;
