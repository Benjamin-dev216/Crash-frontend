import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { Bet } from "../types";

const socket = io("http://localhost:4000"); // Connect to the backend

const UserList: React.FC = () => {
  const [users, setUsers] = useState<Bet[]>([]);

  useEffect(() => {
    // Listen for user list updates
    socket.on("userList", (data: Bet[]) => {
      setUsers(data);
    });

    // Cleanup on unmount
    return () => {
      socket.off("userList");
    };
  }, []);

  return (
    <div className="user-list">
      <h2>Betting Users (Current Round)</h2>
      {users.map((user) => (
        <div key={user.id} className="user-item">
          <span>{user.username}</span>
          <span>Bet: {user.amount}</span>
          <span>Multiplier: {user.cashoutAt || "Pending"}</span>
        </div>
      ))}
    </div>
  );
};

export default UserList;
