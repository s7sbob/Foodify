// src/store/customizer/CustomizerSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import { AppState } from 'src/store/Store';


interface StateType {
  activeDir: 'ltr' | 'rtl'; // Restrict to valid directions
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
  currentPage: string; // New state property
}




const selectCustomizer = (state: AppState) => state.customizer;


export const selectLanguage = (state: AppState) => state.customizer.isLanguage;

export const selectActiveDir = createSelector(
  [selectCustomizer],
  (customizer) => customizer.activeDir
);

export const selectIsCollapse = createSelector(
  [selectCustomizer],
  (customizer) => customizer.isCollapse
);

export const selectSidebarWidth = createSelector(
  [selectCustomizer],
  (customizer) => customizer.SidebarWidth
);




const initialState: StateType = {
  activeDir: 'ltr',
  activeMode: 'light',
  activeTheme: 'BLUE_THEME',
  SidebarWidth: 270,
  MiniSidebarWidth: 87,
  TopbarHeight: 70,
  isLayout: 'boxed',
  isCollapse: false,
  isSidebarHover: false,
  isMobileSidebar: false,
  isHorizontal: false,
  isLanguage: 'en',
  isCardShadow: true,
  borderRadius: 7,
  baseurl: 'https://erp.ts-egy.com/api',
  currentPage: 'HomePage', // Initialize currentPage
};



// Selector for active mode (light/dark)
export const selectActiveMode = createSelector(
  [selectCustomizer],
  (customizer) => customizer.activeMode
);

// Selector for active theme
export const selectActiveTheme = createSelector(
  [selectCustomizer],
  (customizer) => customizer.activeTheme
);

// Selector for border radius
export const selectBorderRadius = createSelector(
  [selectCustomizer],
  (customizer) => customizer.borderRadius
);

export const CustomizerSlice = createSlice({
  name: 'customizer',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<string>) => {
      state.activeTheme = action.payload;
    },
    setDarkMode: (state, action: PayloadAction<string>) => {
      state.activeMode = action.payload;
    },
    setDir: (state, action: PayloadAction<'rtl' | 'ltr'>) => {
      state.activeDir = action.payload;
    },
    setLanguage: (state: StateType, action: PayloadAction<string>) => {
      state.isLanguage = action.payload;
      // Update direction based on language
      state.activeDir = action.payload === 'ar' ? 'rtl' : 'ltr';
    },
    setCardShadow: (state, action: PayloadAction<boolean>) => {
      state.isCardShadow = action.payload;
    },
    toggleSidebar: (state) => {
      state.isCollapse = !state.isCollapse;
    },
    hoverSidebar: (state, action: PayloadAction<boolean>) => {
      state.isSidebarHover = action.payload;
    },
    toggleMobileSidebar: (state) => {
      state.isMobileSidebar = !state.isMobileSidebar;
    },
    toggleLayout: (state, action: PayloadAction<string>) => {
      state.isLayout = action.payload;
    },
    toggleHorizontal: (state, action: PayloadAction<boolean>) => {
      state.isHorizontal = action.payload;
    },
    setBorderRadius: (state, action: PayloadAction<number>) => {
      state.borderRadius = action.payload;
    },
    setbaseurl: (state, action: PayloadAction<string>) => {
      state.baseurl = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<string>) => { // New action
      state.currentPage = action.payload;
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
  setCurrentPage, // Export new action
} = CustomizerSlice.actions;

export default CustomizerSlice.reducer;
