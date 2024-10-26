// src/pages/UsersPage.tsx

import  { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ReactColumnVisibilityTable from 'src/components/react-tables/UsersTable/page';
import { AppState } from 'src/store/Store';
import { useNotification } from '../../../context/NotificationContext'; // Import the hook

function UsersPage() {
  const token =
    useSelector((state: AppState) => state.auth.token) ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('authToken');
  const [usersData, setUsersData] = useState([]);
  const baseurl = useSelector((state: AppState) => state.customizer.baseurl);

  // Use the Notification Context
  const { showNotification } = useNotification();

  const fetchUsers = async () => {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    try {
      const response = await fetch(`${baseurl}/account/GetCompanyUsers`, { headers }); //this requested api handles the token 
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setUsersData(data);
    } catch (error: any) {
      showNotification('Failed to fetch users.', 'error', 'Error');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token, baseurl]); // Added baseurl as dependency

  const handleUserAdded = () => {
    fetchUsers(); // Re-fetch users to update the table
    showNotification('User added successfully!', 'success', 'Success');
  };

  return (
    <div>
      <ReactColumnVisibilityTable data={usersData} onUserAdded={handleUserAdded} />
    </div>
  );
}

export default UsersPage;
