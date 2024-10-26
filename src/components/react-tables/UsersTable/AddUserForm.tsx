import React, { useState } from 'react';
import {
  Button,
  FormControl,
  InputAdornment,
  OutlinedInput,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert, // Import Alert for displaying messages
} from '@mui/material';
import CustomFormLabel from '../../forms/theme-elements/CustomFormLabel';
import { IconLock, IconUser } from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import { AppState } from 'src/store/Store';

interface AddUserFormProps {
  open: boolean;
  handleClose: () => void;
  onUserAdded: () => void;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ open, handleClose, onUserAdded }) => {
  const token =
    useSelector((state: AppState) => state.auth.token) ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('authToken');
  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);
  const [userCode, setUserCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // State for success message

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
    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setSuccessMessage('');
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setSuccessMessage('');
      return;
    }

    const url = `${baseurl}/account/Register?userName=${username}&UserCode=${userCode}&Password=${password}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      // Send request to the server to register the new user
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
      });
      if (!response.ok) {
        throw new Error('Network error');
      }
      // Handle response: show a success message, clear form
      console.log('User registered successfully');
      onUserAdded(); // To re-render after the user is added
      resetForm(); // Reset form after successful registration
      setSuccessMessage('User added successfully');
      setError(''); // Clear any previous errors

      if (!closeForm) {
        handleClose(); // Close modal on successful registration if closeForm is false
      }
    } catch (error) {
      console.error('Failed to register user:', error);
      setError('Failed to register user. Please try again.');
      setSuccessMessage('');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Adding New Users</DialogTitle>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(true);
          }}
        >
          <FormControl fullWidth>
            <CustomFormLabel htmlFor="UserCode-text">UserCode</CustomFormLabel>
            <OutlinedInput
              startAdornment={
                <InputAdornment position="start">
                  <IconUser width={20} />
                </InputAdornment>
              }
              id="UserCode-text"
              placeholder="UserCode"
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              fullWidth
            />
          </FormControl>

          <FormControl fullWidth>
            <CustomFormLabel htmlFor="username-text">Username</CustomFormLabel>
            <OutlinedInput
              startAdornment={
                <InputAdornment position="start">
                  <IconUser width={20} />
                </InputAdornment>
              }
              id="username-text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
            />
          </FormControl>

          <FormControl fullWidth>
            <CustomFormLabel htmlFor="pwd-text">Password</CustomFormLabel>
            <OutlinedInput
              type="password"
              startAdornment={
                <InputAdornment position="start">
                  <IconLock width={20} />
                </InputAdornment>
              }
              id="pwd-text"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
          </FormControl>

          <FormControl fullWidth>
            <CustomFormLabel htmlFor="cpwd-text">Confirm Password</CustomFormLabel>
            <OutlinedInput
              type="password"
              startAdornment={
                <InputAdornment position="start">
                  <IconLock width={20} />
                </InputAdornment>
              }
              id="cpwd-text"
              placeholder="Confirm Password"
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
          Cancel
        </Button>
        <Button onClick={() => handleSubmit(true)} color="primary">
          Save & Start New
        </Button>
        <Button onClick={() => handleSubmit(false)} color="info">
          Save & View All
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserForm;
