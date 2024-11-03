// src/selectors/authSelectors.ts

import { createSelector } from 'reselect';
import { AppState } from '../store/Store';

// Base selector
const selectAuth = (state: AppState) => state.auth;

// Memoized selectors
export const selectAuthToken = createSelector(
  [selectAuth],
  (auth) => auth.token
);

export const selectAuthTokenExpiration = createSelector(
  [selectAuth],
  (auth) => auth.tokenExpiration
);

// Add more selectors as needed
