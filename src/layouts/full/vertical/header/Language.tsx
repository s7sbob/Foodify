// src/components/LanguageSwitcher.tsx

import React, { useEffect } from 'react';
import {
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Stack,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { setLanguage } from 'src/store/customizer/CustomizerSlice';
import FlagEn from 'src/assets/images/flag/icon-flag-en.svg';
import FlagEg from 'src/assets/images/flag/icon-flag-eg.svg'; // Updated import
import { useTranslation } from 'react-i18next';
import { AppState } from 'src/store/Store';

interface LanguageOption {
  flagname: string;
  icon: string;
  value: string;
}

const Languages: LanguageOption[] = [
  {
    flagname: 'English (UK)',
    icon: FlagEn,
    value: 'en',
  },
  {
    flagname: 'مصر (Egypt)', // Updated flagname
    icon: FlagEg,           // Updated icon
    value: 'ar',
  },
];

const Language: React.FC = () => { // Renamed component for clarity
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const dispatch = useDispatch();
  const open = Boolean(anchorEl);
  const customizer = useSelector((state: AppState) => state.customizer);
  const currentLang =
    Languages.find((_lang) => _lang.value === customizer.isLanguage) || Languages[0];
  const { i18n } = useTranslation();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng: string) => {
    dispatch(setLanguage(lng));
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng); // Persist language preference
    // Direction is handled within the slice's setLanguage reducer if needed
  };

  useEffect(() => {
    // Initialize language on mount based on Redux state
    if (customizer.isLanguage) {
      i18n.changeLanguage(customizer.isLanguage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <IconButton
        aria-label="language switcher"
        id="language-button"
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <Avatar src={currentLang.icon} alt={currentLang.value} sx={{ width: 20, height: 20 }} />
      </IconButton>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{
          '& .MuiMenu-paper': {
            width: '200px',
          },
        }}
      >
        {Languages.map((option, index) => (
          <MenuItem
            key={index}
            sx={{ py: 2, px: 3 }}
            onClick={() => {
              changeLanguage(option.value);
              handleClose();
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar src={option.icon} alt={option.value} sx={{ width: 20, height: 20 }} />
              <Typography>{option.flagname}</Typography>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default Language;
