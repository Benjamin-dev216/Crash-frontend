import React, { useState, useEffect } from "react";
import { Bet } from "../types";
import socketInstance from "../axios/socket";

const UserList: React.FC = () => {
  const [users, setUsers] = useState<Bet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [gameEnd, setGameEnd] = useState<boolean>(false);

  useEffect(() => {
    // Listen for user list updates
    socketInstance.on(
      "userList",
      ({
        filteredBets,
        gameEndFlag,
      }: {
        filteredBets: Bet[];
        gameEndFlag: boolean;
      }) => {
        setUsers(filteredBets);
        setGameEnd(gameEndFlag);
      }
    );

    // Listen for error messages
    socketInstance.on("error", (data: { message: string }) => {
      setError(data.message);
    });

    // Cleanup on unmount
    return () => {
      socketInstance.off("userList");
      socketInstance.off("error");
    };
  }, []);

  return (
    <div className="user-list">
      <h2>Betting Users (Current Round)</h2>
      {error && <div className="text-red-500 p-2">Error: {error}</div>}
      <table className="w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Username</th>
            <th className="p-2">Multiplier</th>
            <th className="p-2">Bet Amount</th>
            <th className="p-2">Win</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const hasLost = !user.cashoutAt || user.cashoutAt === 0;
            return (
              <tr
                key={user.id}
                className={`text-center ${
                  gameEnd && hasLost
                    ? "bg-red-500 text-white"
                    : !hasLost
                    ? "bg-green-200"
                    : "bg-white"
                }`}
              >
                <td className="p-2">{user.username || "Unknown"}</td>
                <td className="p-2">{user.cashoutAt ? user.cashoutAt : "0"}</td>
                <td className="p-2">${user.amount}</td>
                <td className="p-2">
                  {user.cashoutAt
                    ? `$${(user.amount * user.cashoutAt).toFixed(2)}`
                    : "$0"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
