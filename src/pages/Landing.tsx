import React, { useState } from "react";
import Game from "../components/Game";
import UserList from "../components/UserList";
import AuthModal from "../components/AutoModal";
import axiosInstance from "../axios/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const Landing: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  const showToastMessage = (msg: String) => {
    toast.error(msg, {
      position: "top-center",
    });
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      // Replace with actual API endpoint
      const response = await axiosInstance.post("/auth/signin", {
        username,
        password,
      });

      if (response.data) {
        setLoggedIn(true);
        setUsername(username);
        setShowAuthModal(false);
      } else {
        console.error("Invalid credentials");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        showToastMessage(error.response.data.message);
        console.log(error.response.data.message);
      } else {
        console.error("An unknown error occurred");
      }
      console.error("Login error:", error);
      // setError("An error occurred while logging in.");
    }
  };

  const handleRegister = async (username: string, password: string) => {
    try {
      // Replace with actual API endpoint
      const response = await axiosInstance.post("/auth/signup", {
        username,
        password,
      });

      if (response.data) {
        console.log("Registration successful:", response.data);
        setLoggedIn(true);
        setUsername(username);
        setShowAuthModal(false);
      } else {
        console.error("Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      // setError("An error occurred during registration.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {loggedIn ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Welcome, {username}!</h1>
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
