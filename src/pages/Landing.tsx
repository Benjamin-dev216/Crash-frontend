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
    <div className="min-h-screen bg-[#090e2a] w-screen min-w-[1420px] relative">
      {loggedIn && userData ? (
        <div className="grid grid-cols-7 p-4 bg-gray-900 text-white min-h-screen">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded absolute right-0 z-20 m-4 top-0"
          >
            Logout
          </button>
          <div className="col-span-2 p-4">
            <UserList />
          </div>
          <div className="col-span-5 p-4 ">
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
