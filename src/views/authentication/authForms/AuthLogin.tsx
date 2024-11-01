// src/views/authentication/auth1/AuthLogin.tsx

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  useTheme,
} from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

import { loginType } from 'src/types/auth/auth';
import CustomCheckbox from '../../../components/forms/theme-elements/CustomCheckbox';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setToken } from '../../../store/apps/auth/AuthSlice';
import { useNotification } from '../../../context/NotificationContext'; // Ensure correct path
import { AppState } from 'src/store/Store'; // Import AppState for type safety
import { useTranslation } from 'react-i18next'; // Import useTranslation for i18n

const baseurl = 'https://erp.ts-egy.com/api';

const AuthLogin: React.FC<loginType> = ({ title, subtitle, subtext }) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openForgotPasswordDialog, setOpenForgotPasswordDialog] = useState(false);
  const forgotPasswordRef = useRef<HTMLSpanElement>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const { showNotification } = useNotification(); // Destructure showNotification

  // Select the current language from Redux store
  const language = useSelector((state: AppState) => state.customizer.isLanguage);
  const { i18n } = useTranslation();

  // Effect to change language when the language state changes
  useEffect(() => {
    if (language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  const dialogStyles = useMemo(
    () => ({
      '& .MuiDialog-paper': {
        padding: theme.spacing(3),
        borderRadius: theme.spacing(1),
        maxWidth: '500px',
        width: '90%',
        [theme.breakpoints.down('sm')]: {
          padding: theme.spacing(2),
        },
      },
    }),
    [theme]
  );

  const handleCloseDialog = useCallback(() => {
    setOpenForgotPasswordDialog(false);
    if (forgotPasswordRef.current) {
      forgotPasswordRef.current.focus();
    }
  }, []);

  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUsername(e.target.value);
    },
    []
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      try {
        setIsLoading(true);
        setError(null);

        const res = await axios.post(
          `${baseurl}/account/loginjwt`,
          {},
          {
            params: {
              userCode: username,
              Password: password,
            },
          }
        );
        console.log('res:', res);
        if (res.status === 200) {
          console.log('User logged in successfully');
          dispatch(setToken(res.data.token));
          showNotification(t('notifications.loggedIn') || 'Logged in successfully!', 'success', t('notifications.success') || 'Success'); // Show success notification
          navigate('/');
        } else {
          const unexpectedError = 'Unexpected response from the server.';
          setError(unexpectedError);
          showNotification(t('notifications.error') || 'Unexpected error.', 'error', t('notifications.error') || 'Error'); // Show error notification
        }
      } catch (error: any) {
        const message = error.response?.data?.message || t('notifications.loginFaild') || 'Incorrect username or password.';
        setError(message);
        showNotification(message, 'error', t('notifications.error') || 'Error'); // Show error notification
      } finally {
        setIsLoading(false);
      }
    },
    [username, password, dispatch, navigate, showNotification, t]
  );

  return (
    <>
      {title && (
        <Typography fontWeight="700" variant="h3" mb={1}>
          {title}
        </Typography>
      )}

      {subtext}

      {/* Form Wrapper */}
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Box>
            <CustomFormLabel htmlFor="username">{t('addUserForm.username') || 'Username'}</CustomFormLabel>
            <CustomTextField
              id="username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={handleUsernameChange}
            />
          </Box>
          <Box>
            <CustomFormLabel htmlFor="password">{t('addUserForm.password') || 'Password'}</CustomFormLabel>
            <CustomTextField
              id="password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={handlePasswordChange}
            />
          </Box>

          {/* Display Alert Below Password Field */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
            <FormGroup>
              <FormControlLabel
                control={<CustomCheckbox defaultChecked />}
                label={t('addUserForm.rememberDevice') || 'Remember this Device'}
              />
            </FormGroup>
            <Typography
              variant="body2"
              fontWeight="500"
              sx={{
                textDecoration: 'none',
                color: 'primary.main',
                cursor: 'pointer',
              }}
              onClick={() => setOpenForgotPasswordDialog(true)}
              ref={forgotPasswordRef}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setOpenForgotPasswordDialog(true);
                }
              }}
            >
              {t('auth.forgotPassword') || 'Forgot Password?'}
            </Typography>
          </Stack>

          <Box>
            <Button
              color="primary"
              variant="contained"
              size="large"
              fullWidth
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? t('authLogin.signingIn') || 'Signing In...' : t('authLogin.signIn') || 'Sign In'}
            </Button>
          </Box>
        </Stack>
      </form>

      {subtitle}

      {/* Forgot Password Dialog */}
      <Dialog
        open={openForgotPasswordDialog}
        onClose={handleCloseDialog}
        aria-labelledby="forgot-password-dialog-title"
        aria-describedby="forgot-password-dialog-description"
        sx={dialogStyles}
      >
        <DialogTitle
          id="forgot-password-dialog-title"
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Box display="flex" alignItems="center">
            <SupportAgentIcon color="primary" sx={{ mr: 1 }} />
            {t('auth.forgotPassword') || 'Forgot Password'}
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="forgot-password-dialog-description">
            {t('auth.forgotPasswordInfo') || 'If you forgot your password, please contact our technical support team at '}
            <a href="mailto:support@yourdomain.com">support@yourdomain.com</a> {t('auth.orCall') || 'or call us at '}
            <strong>+1 (800) 123-4567</strong>.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary" autoFocus>
            {t('buttons.close') || 'Close'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AuthLogin;
