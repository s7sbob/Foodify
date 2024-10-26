// src/selectors/customizerSelectors.ts
import { createSelector } from 'reselect';
import { AppState } from '../store/Store';

// Base selector
const selectCustomizer = (state: AppState) => state.customizer;

// Memoized selectors
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

// Add more selectors as needed
