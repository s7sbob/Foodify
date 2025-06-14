// src/components/customizer/Customizer.tsx

import  { FC, useState } from 'react';
import {
  Fab,
  Drawer,
  Grid,
  Slider,
  Divider,
  styled,
  IconButton,
  Typography,
  Tooltip,
  Stack,
} from '@mui/material';
import { useSelector, useDispatch } from 'src/store/Store';
import Box, { BoxProps } from '@mui/material/Box';
import { IconX, IconSettings, IconCheck } from '@tabler/icons-react';
import {
  setTheme,
  setDarkMode,
  toggleLayout,
  toggleSidebar,
  setBorderRadius,
  setCardShadow,
} from 'src/store/customizer/CustomizerSlice';
import { AppState } from 'src/store/Store';
import Scrollbar from 'src/components/custom-scroll/Scrollbar';
import WbSunnyTwoToneIcon from '@mui/icons-material/WbSunnyTwoTone';
import DarkModeTwoToneIcon from '@mui/icons-material/DarkModeTwoTone';
import AspectRatioTwoToneIcon from '@mui/icons-material/AspectRatioTwoTone';
import CallToActionTwoToneIcon from '@mui/icons-material/CallToActionTwoTone';
import ViewSidebarTwoToneIcon from '@mui/icons-material/ViewSidebarTwoTone';
import WebAssetTwoToneIcon from '@mui/icons-material/WebAssetTwoTone';
import { ViewComfyTwoTone, PaddingTwoTone, BorderOuter } from '@mui/icons-material';

const SidebarWidth = '320px';

interface colors {
  id: number;
  bgColor: string;
  disp: string;
}

const Customizer: FC = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();

  const StyledBox = styled(Box)<BoxProps>(({ theme }) => ({
    boxShadow: theme.shadows[8],
    padding: '20px',
    cursor: 'pointer',
    justifyContent: 'center',
    display: 'flex',
    transition: 'transform 0.1s ease-in', // تحديد transition على transform
    border: '1px solid rgba(145, 158, 171, 0.12)',
    '&:hover': {
      transform: 'scale(1.05)', // استخدام transform بشكل صحيح
    },
  }));
  

  const thColors: colors[] = [
    {
      id: 1,
      bgColor: '#5D87FF',
      disp: 'BLUE_THEME',
    },
    {
      id: 2,
      bgColor: '#0074BA',
      disp: 'AQUA_THEME',
    },
    {
      id: 3,
      bgColor: '#763EBD',
      disp: 'PURPLE_THEME',
    },
    {
      id: 4,
      bgColor: '#0A7EA4',
      disp: 'GREEN_THEME',
    },
    {
      id: 5,
      bgColor: '#01C0C8',
      disp: 'CYAN_THEME',
    },
    {
      id: 6,
      bgColor: '#FA896B',
      disp: 'ORANGE_THEME',
    },
  ];

  return (
    <div>
      {/* Floating Button to open customizer */}
      <Tooltip title="Settings">
        <Fab
          color="primary"
          aria-label="settings"
          sx={{ position: 'fixed', right: '25px', bottom: '15px' }}
          onClick={() => setShowDrawer(true)}
        >
          <IconSettings stroke={1.5} />
        </Fab>
      </Tooltip>

      <Drawer
        anchor="right"
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        PaperProps={{
          sx: {
            width: SidebarWidth,
          },
        }}
      >
        {/* Customizer Sidebar */}
        <Scrollbar sx={{ height: 'calc(100vh - 5px)' }}>
          <Box p={2} display="flex" justifyContent={'space-between'} alignItems="center">
            <Typography variant="h4">Settings</Typography>
            <IconButton color="inherit" onClick={() => setShowDrawer(false)}>
              <IconX size="1rem" />
            </IconButton>
          </Box>
          <Divider />
          <Box p={3}>
            {/* Dark/Light Theme Setting */}
            <Typography variant="h6" gutterBottom>
              Theme Option
            </Typography>
            <Stack direction={'row'} gap={2} my={2}>
              <StyledBox onClick={() => dispatch(setDarkMode('light'))} display="flex" gap={1}>
                <WbSunnyTwoToneIcon
                  color={customizer.activeMode === 'light' ? 'primary' : 'inherit'}
                />
                Light
              </StyledBox>
              <StyledBox onClick={() => dispatch(setDarkMode('dark'))} display="flex" gap={1}>
                <DarkModeTwoToneIcon
                  color={customizer.activeMode === 'dark' ? 'primary' : 'inherit'}
                />
                Dark
              </StyledBox>
            </Stack>

            <Box pt={3} />

            {/* Theme Color Setting */}
            <Typography variant="h6" gutterBottom>
              Theme Colors
            </Typography>
            <Grid container spacing={2}>
              {thColors.map((thcolor) => (
                <Grid item xs={4} key={thcolor.id}>
                  <StyledBox onClick={() => dispatch(setTheme(thcolor.disp))}>
                    <Tooltip title={`${thcolor.disp}`} placement="top">
                      <Box
                        sx={{
                          backgroundColor: thcolor.bgColor,
                          width: '25px',
                          height: '25px',
                          borderRadius: '60px',
                          alignItems: 'center',
                          justifyContent: 'center',
                          display: 'flex',
                          color: 'white',
                        }}
                        aria-label={`${thcolor.bgColor}`}
                      >
                        {customizer.activeTheme === thcolor.disp ? <IconCheck width={13} /> : ''}
                      </Box>
                    </Tooltip>
                  </StyledBox>
                </Grid>
              ))}
            </Grid>
            <Box pt={4} />

            {/* Layout Type */}
            <Typography variant="h6" gutterBottom>
              Layout Type
            </Typography>

            <Box pt={4} />

            {/* Container Option */}
            <Typography variant="h6" gutterBottom>
              Container Option
            </Typography>
            <Stack direction={'row'} gap={2} my={2}>
              <StyledBox onClick={() => dispatch(toggleLayout('boxed'))} display="flex" gap={1}>
                <CallToActionTwoToneIcon
                  color={customizer.isLayout === 'boxed' ? 'primary' : 'inherit'}
                />
                Boxed
              </StyledBox>
              <StyledBox onClick={() => dispatch(toggleLayout('full'))} display="flex" gap={1}>
                <AspectRatioTwoToneIcon
                  color={customizer.isLayout === 'full' ? 'primary' : 'inherit'}
                />
                Full
              </StyledBox>
            </Stack>
            <Box pt={4} />

            {/* Sidebar Type (Conditional) */}
            {!customizer.isHorizontal && (
              <>
                <Typography variant="h6" gutterBottom>
                  Sidebar Type
                </Typography>
                <Stack direction={'row'} gap={2} my={2}>
                  <StyledBox onClick={() => dispatch(toggleSidebar())} display="flex" gap={1}>
                    <WebAssetTwoToneIcon color={!customizer.isCollapse ? 'primary' : 'inherit'} />
                    Full
                  </StyledBox>
                  <StyledBox onClick={() => dispatch(toggleSidebar())} display="flex" gap={1}>
                    <ViewSidebarTwoToneIcon color={customizer.isCollapse ? 'primary' : 'inherit'} />
                    mini
                  </StyledBox>
                </Stack>
              </>
            )}
            <Box pt={4} />

            {/* Card With */}
            <Typography variant="h6" gutterBottom>
              Card With
            </Typography>
            <Stack direction={'row'} gap={2} my={2}>
              <StyledBox onClick={() => dispatch(setCardShadow(false))} display="flex" gap={1}>
                <BorderOuter color={!customizer.isCardShadow ? 'primary' : 'inherit'} />
                Border
              </StyledBox>
              <StyledBox onClick={() => dispatch(setCardShadow(true))} display="flex" gap={1}>
                <CallToActionTwoToneIcon color={customizer.isCardShadow ? 'primary' : 'inherit'} />
                Shadow
              </StyledBox>
            </Stack>
            <Box pt={4} />

            {/* Theme Border Radius */}
            <Typography variant="h6" gutterBottom>
              Theme Border Radius
            </Typography>
            <Slider
              size="small"
              value={customizer.borderRadius}
              aria-label="Small"
              min={4}
              max={24}
              onChange={(event: any) => dispatch(setBorderRadius(event.target.value))}
              valueLabelDisplay="auto"
            />
          </Box>
        </Scrollbar>
      </Drawer>
    </div>
  );
};

export default Customizer;
