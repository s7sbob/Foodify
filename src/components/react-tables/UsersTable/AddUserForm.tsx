// src/components/AddUserForm.tsx

import React, { useState, useEffect } from 'react';
import {
  Button,
  FormControl,
  InputAdornment,
  OutlinedInput,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
} from '@mui/material';
import CustomFormLabel from '../../forms/theme-elements/CustomFormLabel';
import { IconLock, IconUser } from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { AppState } from 'src/store/Store';
import { useTranslation } from 'react-i18next';

interface AddUserFormProps {
  open: boolean;
  handleClose: () => void;
  onUserAdded: () => void;
  userToEdit?: UserTableData | null; // Optional prop for editing
}

interface UserTableData {
  userCode: string;
  userName: string;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ open, handleClose, onUserAdded, userToEdit = null }) => {
  const { t } = useTranslation();

  const token =
    useSelector((state: AppState) => state.auth.token) ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('authToken');

  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);

  // Initialize form fields based on whether it's an edit or add operation
  const [userCode, setUserCode] = useState(userToEdit ? userToEdit.userCode : '');
  const [username, setUsername] = useState(userToEdit ? userToEdit.userName : '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset form when modal opens/closes or userToEdit changes
  useEffect(() => {
    if (userToEdit) {
      setUserCode(userToEdit.userCode);
      setUsername(userToEdit.userName);
      setPassword('');
      setConfirmPassword('');
      setError('');
      setSuccessMessage('');
    } else {
      resetForm();
    }
  }, [userToEdit, open]);

  // Clear all form data
  const resetForm = () => {
    setUserCode('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (closeForm: boolean) => {
    // Determine if the operation is edit or add
    const isEditMode = !!userToEdit;

    // If adding a new user, password is required
    // If editing, password fields are optional
    if (!isEditMode || (isEditMode && (password || confirmPassword))) {
      // Validate password length only if password is provided
      if (password && password.length < 8) {
        setError(t('errors.passwordLength') || 'Password must be at least 8 characters long.');
        setSuccessMessage('');
        return;
      }

      // Check if passwords match only if password is provided
      if (password !== confirmPassword) {
        setError(t('errors.passwordMismatch') || 'Passwords do not match.');
        setSuccessMessage('');
        return;
      }
    }

    // Prepare the payload
    const payload: any = {
      userName: username,
      UserCode: userCode,
    };

    // Include password if it's being set or changed
    if (password) {
      payload.Password = password;
    }

    // Determine API endpoint and method based on operation
    const url = isEditMode
      ? `${baseurl}/account/Update`
      : `${baseurl}/account/Register`;
    const method = isEditMode ? 'PUT' : 'POST';

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network error');
      }

      if (isEditMode) {
        console.log('User edited successfully');
        setSuccessMessage(t('alerts.userEdited') || 'User edited successfully.');
      } else {
        console.log('User registered successfully');
        setSuccessMessage(t('alerts.userAdded') || 'User added successfully.');
      }

      onUserAdded(); // Refresh the user list
      resetForm(); // Reset form fields
      setError('');

      if (!closeForm) {
        handleClose(); // Close modal if not starting a new entry
      }
    } catch (error: any) {
      console.error('Failed to submit user:', error);
      setError(
        isEditMode
          ? t('alerts.userEditFailed') || 'Failed to edit user. Please try again.'
          : t('alerts.userRegistrationFailed') || 'Failed to register user. Please try again.'
      );
      setSuccessMessage('');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {userToEdit ? (t('editUserForm.title') || 'Edit User') : (t('addUserForm.title') || 'Add New User')}
      </DialogTitle>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(true);
          }}
        >
          <FormControl fullWidth margin="normal">
            <CustomFormLabel htmlFor="UserCode-text">
              {t('addUserForm.userCode') || 'User Code'}
            </CustomFormLabel>
            <OutlinedInput
              startAdornment={
                <InputAdornment position="start">
                  <IconUser width={20} />
                </InputAdornment>
              }
              id="UserCode-text"
              placeholder={t('addUserForm.userCodePlaceholder') || 'Enter User Code'}
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              fullWidth
              readOnly={!!userToEdit} // Make read-only if editing
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <CustomFormLabel htmlFor="username-text">
              {t('addUserForm.username') || 'Username'}
            </CustomFormLabel>
            <OutlinedInput
              startAdornment={
                <InputAdornment position="start">
                  <IconUser width={20} />
                </InputAdornment>
              }
              id="username-text"
              placeholder={t('addUserForm.usernamePlaceholder') || 'Enter Username'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <CustomFormLabel htmlFor="pwd-text">
              {t('addUserForm.password') || 'Password'}
              {userToEdit && (
                <span style={{ color: 'gray', fontSize: '0.8em', marginLeft: '5px' }}>
                  ({t('addUserForm.Leave.blank.to.keep.unchanged')})
                </span>
              )}
            </CustomFormLabel>
            <OutlinedInput
              type="password"
              startAdornment={
                <InputAdornment position="start">
                  <IconLock width={20} />
                </InputAdornment>
              }
              id="pwd-text"
              placeholder={
                userToEdit
                  ? t('addUserForm.passwordPlaceholderEdit') || 'Enter new Password'
                  : t('addUserForm.passwordPlaceholder') || 'Enter Password'
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <CustomFormLabel htmlFor="cpwd-text">
              {t('addUserForm.confirmPassword') || 'Confirm Password'}
              {userToEdit && (
                <span style={{ color: 'gray', fontSize: '0.8em', marginLeft: '5px' }}>
                 ( {t('addUserForm.Leave.blank.to.keep.unchanged')})
                </span>
              )}
            </CustomFormLabel>
            <OutlinedInput
              type="password"
              startAdornment={
                <InputAdornment position="start">
                  <IconLock width={20} />
                </InputAdornment>
              }
              id="cpwd-text"
              placeholder={
                userToEdit
                  ? t('addUserForm.confirmPasswordPlaceholderEdit') || 'Re-enter new Password'
                  : t('addUserForm.confirmPasswordPlaceholder') || 'Re-enter Password'
              }
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
            />
          </FormControl>
        </form>

        {/* Display error message */}
        {error && (
          <Alert severity="error" style={{ marginTop: '10px' }}>
            {error}
          </Alert>
        )}
        {/* Display success message */}
        {successMessage && (
          <Alert severity="success" style={{ marginTop: '10px' }}>
            {successMessage}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="error">
          {t('buttons.cancel') || 'Cancel'}
        </Button>
        {userToEdit ? (
          // Single button for editing
          <Button onClick={() => handleSubmit(false)} color="primary">
            {t('buttons.saveChanges') || 'Save Changes'}
          </Button>
        ) : (
          // Multiple buttons for adding
          <>
            <Button onClick={() => handleSubmit(true)} color="primary">
              {t('buttons.saveAndStartNew') || 'Save & Start New'}
            </Button>
            <Button onClick={() => handleSubmit(false)} color="info">
              {t('buttons.saveAndViewAll') || 'Save & View All'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddUserForm;
