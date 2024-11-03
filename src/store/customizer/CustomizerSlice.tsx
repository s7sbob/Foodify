// src/store/customizer/CustomizerSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StateType {
  activeDir: 'ltr' | 'rtl';
  activeMode: string;
  activeTheme: string;
  SidebarWidth: number;
  MiniSidebarWidth: number;
  TopbarHeight: number;
  isCollapse: boolean;
  isLayout: string;
  isSidebarHover: boolean;
  isMobileSidebar: boolean;
  isHorizontal: boolean;
  isLanguage: string;
  isCardShadow: boolean;
  borderRadius: number;
  baseurl: string;
  currentPage: string;
}

const getInitialState = (): StateType => ({
  activeDir: (localStorage.getItem('language') === 'ar') ? 'rtl' : 'ltr',
  activeMode: localStorage.getItem('themeMode') || 'light',
  activeTheme: localStorage.getItem('activeTheme') || 'BLUE_THEME',
  SidebarWidth: 270,
  MiniSidebarWidth: 87,
  TopbarHeight: 70,
  isLayout: localStorage.getItem('isLayout') || 'boxed',
  isCollapse: localStorage.getItem('isCollapse') === 'true',
  isSidebarHover: localStorage.getItem('isSidebarHover') === 'true',
  isMobileSidebar: localStorage.getItem('isMobileSidebar') === 'true',
  isHorizontal: localStorage.getItem('isHorizontal') === 'true',
  isLanguage: localStorage.getItem('language') || 'en',
  isCardShadow: localStorage.getItem('isCardShadow') === 'true',
  borderRadius: Number(localStorage.getItem('borderRadius')) || 7,
  baseurl: 'https://erp.ts-egy.com/api',
  currentPage: localStorage.getItem('currentPage') || 'HomePage',
});

const initialState: StateType = getInitialState();

export const CustomizerSlice = createSlice({
  name: 'customizer',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<string>) => {
      state.activeTheme = action.payload;
      localStorage.setItem('activeTheme', action.payload);
    },
    setDarkMode: (state, action: PayloadAction<string>) => {
      state.activeMode = action.payload;
      localStorage.setItem('themeMode', action.payload);
    },
    setDir: (state, action: PayloadAction<'ltr' | 'rtl'>) => {
      state.activeDir = action.payload;
      localStorage.setItem('activeDir', action.payload);
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.isLanguage = action.payload;
      state.activeDir = action.payload === 'ar' ? 'rtl' : 'ltr';
      localStorage.setItem('language', action.payload);
      localStorage.setItem('activeDir', state.activeDir);
    },
    setCardShadow: (state, action: PayloadAction<boolean>) => {
      state.isCardShadow = action.payload;
      localStorage.setItem('isCardShadow', String(action.payload));
    },
    toggleSidebar: (state) => {
      state.isCollapse = !state.isCollapse;
      localStorage.setItem('isCollapse', String(state.isCollapse));
    },
    hoverSidebar: (state, action: PayloadAction<boolean>) => {
      state.isSidebarHover = action.payload;
      localStorage.setItem('isSidebarHover', String(action.payload));
    },
    toggleMobileSidebar: (state) => {
      state.isMobileSidebar = !state.isMobileSidebar;
      localStorage.setItem('isMobileSidebar', String(state.isMobileSidebar));
    },
    toggleLayout: (state, action: PayloadAction<string>) => {
      state.isLayout = action.payload;
      localStorage.setItem('isLayout', action.payload);
    },
    toggleHorizontal: (state, action: PayloadAction<boolean>) => {
      state.isHorizontal = action.payload;
      localStorage.setItem('isHorizontal', String(action.payload));
    },
    setBorderRadius: (state, action: PayloadAction<number>) => {
      state.borderRadius = action.payload;
      localStorage.setItem('borderRadius', String(action.payload));
    },
    setbaseurl: (state, action: PayloadAction<string>) => {
      state.baseurl = action.payload;
      localStorage.setItem('baseurl', action.payload);
    },
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
      localStorage.setItem('currentPage', action.payload);
    },
  },
});

export const {
  setTheme,
  setDarkMode,
  setDir,
  toggleSidebar,
  hoverSidebar,
  toggleMobileSidebar,
  toggleLayout,
  setBorderRadius,
  toggleHorizontal,
  setLanguage,
  setCardShadow,
  setbaseurl,
  setCurrentPage,
} = CustomizerSlice.actions;

export default CustomizerSlice.reducer;
