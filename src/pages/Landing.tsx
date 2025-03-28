import React, { useState, useEffect } from "react";
import Game from "../components/Game";
import UserList from "../components/UserList";
import AuthModal from "../components/AutoModal";
import axiosInstance from "../axios/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUserContext } from "../context/UserContext";
import axios from "axios";
import socketInstance from "../axios/socket";

const Landing: React.FC = () => {
  const { userData, setUserData } = useUserContext();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean>(!!userData);

  const showToastMessage = (msg: string) => {
    toast.error(msg, { position: "top-center" });
  };

  const saveUserData = (data: any) => {
    localStorage.setItem("user", JSON.stringify(data));
    setUserData(data);
    setLoggedIn(true);
    setShowAuthModal(false);
  };

  const handleAuth = async (
    endpoint: string,
    username: string,
    password: string
  ) => {
    try {
      const response = await axiosInstance.post(endpoint, {
        username,
        password,
      });
      if (response.data) {
        saveUserData(response.data);
      } else {
        console.error("Authentication failed");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        showToastMessage(error.response.data.message);
      } else {
        console.error("An unknown error occurred");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUserData(null);
    setLoggedIn(false);
    setShowAuthModal(true);
  };

  useEffect(() => {
    if (!loggedIn) setShowAuthModal(true);
    if (userData) socketInstance.emit("registerUser", userData.userId);
  }, [loggedIn, userData]);

  return (
    <div className="h-screen bg-[#090e2a] w-full md:min-w-[1400px] overflow-x-hidden relative">
      {loggedIn && userData ? (
        <div className="grid grid-cols-1 md:grid-cols-7 px-0 py-0 md:p-4 text-white min-h-screen gap-0 md:gap-4">
          <button
            onClick={handleLogout}
            className="px-1 py-0.5 sm:px-4 sm:py-2 text-[10px] sm:text-sm bg-red-500 text-white rounded top-1 right-1 sm:top-4 sm:right-4 z-50 absolute"
          >
            Logout
          </button>

          {/* Sidebar - UserList */}
          <div className="hidden md:block md:col-span-2 col-span-1 p-2 md:p-4">
            <UserList />
          </div>

          {/* Main Game */}
          <div className="md:col-span-5 col-span-1 p-2 md:p-4">
            <Game />
          </div>
        </div>
      ) : (
        <AuthModal
          show={showAuthModal}
          onHide={() => setShowAuthModal(false)}
          onLogin={(username, password) =>
            handleAuth("/auth/signin", username, password)
          }
          onRegister={(username, password) =>
            handleAuth("/auth/signup", username, password)
          }
        />
      )}
      <ToastContainer />
    </div>
  );
};

export default Landing;
