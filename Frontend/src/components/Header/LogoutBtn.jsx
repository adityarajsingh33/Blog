import React from 'react';
import { useDispatch } from 'react-redux';
import authService from '../../appwrite/auth';
import { logout } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';

function LogoutBtn() {
  const navigate = useNavigate(); // Corrected to use the hook
  const dispatch = useDispatch();

  const logoutHandler = async () => {
    try {
      await authService.logout(); // Wait for the logout to complete
      dispatch(logout()); // Dispatch the logout action
      navigate("/login"); // Navigate to the login page
    } catch (error) {
      console.error("Logout failed:", error); // Handle any potential errors
    }
  };

  return (
    <button
      className='font-bold text-white bg-red-600 px-5 py-2 rounded-lg shadow hover:bg-red-700 transition duration-300'
      onClick={logoutHandler}
    >
      Logout
    </button>
  );
}

export default LogoutBtn;
