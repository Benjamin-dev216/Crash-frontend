import React, { useState, useEffect } from "react";
import Game from "../components/Game";
import UserList from "../components/UserList";
import AuthModal from "../components/AutoModal";
import axiosInstance from "../axios/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUserContext } from "../context/UserContext"; // Import the custom hook
import axios from "axios";
import socketInstance from "../axios/socket";

const Landing: React.FC = () => {
  const { userData, setUserData } = useUserContext(); // Access the userData and setUserData from context
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean>(!!userData); // Check if userData exists

  // Show toast message function
  const showToastMessage = (msg: string) => {
    toast.error(msg, { position: "top-center" });
  };

  // Save user data to localStorage and context
  const saveUserData = (data: any) => {
    localStorage.setItem("user", JSON.stringify(data)); // Save the entire user data
    setUserData(data); // Update user data in context
    setLoggedIn(true);
    setShowAuthModal(false);
  };

  // Handle login
  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await axiosInstance.post("/auth/signin", {
        username,
        password,
      });

      if (response.data) {
        saveUserData(response.data); // Save the whole response.data as user data
      } else {
        console.error("Invalid credentials");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        showToastMessage(error.response.data.message);
        console.error(error.response.data.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  // Handle registration
  const handleRegister = async (username: string, password: string) => {
    try {
      const response = await axiosInstance.post("/auth/signup", {
        username,
        password,
      });

      if (response.data) {
        saveUserData(response.data); // Save the whole response.data as user data
      } else {
        console.error("Registration failed");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        showToastMessage(error.response.data.message);
        console.error(error.response.data.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUserData(null); // Clear context data
    setLoggedIn(false);
    setShowAuthModal(true);
  };

  useEffect(() => {
    if (!loggedIn) {
      setShowAuthModal(true);
    }
    socketInstance.emit("registerUser", userData.userId);
  }, [loggedIn]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {loggedIn && userData ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              Welcome, {userData.username}!
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-black rounded"
            >
              Logout
            </button>
          </div>
          <Game />
          <UserList />
        </>
      ) : (
        <AuthModal
          show={showAuthModal}
          onHide={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default Landing;
