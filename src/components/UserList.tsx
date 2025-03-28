import React, { useState, useEffect } from "react";
import { Bet } from "../types";
import socketInstance from "../axios/socket";
import { FaUsers, FaCoins, FaTrophy } from "react-icons/fa";

const UserList: React.FC = () => {
  const [users, setUsers] = useState<Bet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [gameEnd, setGameEnd] = useState<boolean>(false);
  const [numberOfPlayers, setNumberOfPlayers] = useState<number>(0);
  const [totalBets, setTotalBets] = useState<number>(0);
  const [totalWinnings, setTotalWinnings] = useState<number>(0);

  useEffect(() => {
    socketInstance.on(
      "userList",
      ({
        filteredBets,
        gameEndFlag,
        numberOfPlayers,
        totalBets,
        totalWinnings,
      }: {
        filteredBets: Bet[];
        gameEndFlag: boolean;
        numberOfPlayers: number;
        totalBets: number;
        totalWinnings: number;
      }) => {
        setUsers(filteredBets);
        setGameEnd(gameEndFlag);
        setNumberOfPlayers(numberOfPlayers);
        setTotalBets(totalBets);
        setTotalWinnings(totalWinnings);
      }
    );

    socketInstance.on("error", (data: { message: string }) => {
      setError(data.message);
    });

    return () => {
      socketInstance.off("userList");
      socketInstance.off("error");
    };
  }, []);

  return (
    <div className="h-full bg-[#181c3a] rounded-3xl overflow-hidden ">
      {/* Header section */}
      <div className="p-[10px] sm:p-4 sm:px-8 flex justify-between items-center bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-t-3xl text-sm">
        <div className="flex flex-col items-center">
          <div>Number of players</div>
          <span className="flex items-center">
            <FaUsers className="mr-2 text-xl" />
            {numberOfPlayers.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <div>Total bets</div>
          <span className="flex items-center">
            <FaCoins className="mr-2 text-xl" />
            {totalBets.toLocaleString()} USD
          </span>
        </div>
        <div className="flex flex-col items-center">
          <div>Total winnings</div>
          <span className="flex items-center">
            <FaTrophy className="mr-2 text-xl" />
            {totalWinnings.toLocaleString()} USD
          </span>
        </div>
      </div>

      {error && (
        <div className="text-red-500 p-2 text-center">Error: {error}</div>
      )}

      {/* Table displaying user bets */}
      <div className="overflow-x-auto">
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-left text-gray-300 border-collapse">
            <thead className=" sticky top-0 z-10">
              <tr className="text-xs text-center border-b border-gray-600 uppercase">
                <th className="p-2 text-gray-400">USERNAME</th>
                <th className="p-2 text-gray-400">ODDS</th>
                <th className="p-2 text-gray-400">BET</th>
                <th className="p-2 text-gray-400">WIN</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const hasLost = !user.cashoutAt || user.cashoutAt === 0;
                const winAmount = user.cashoutAt
                  ? user.amount * user.cashoutAt
                  : 0;
                return (
                  <tr
                    key={user.id}
                    className={`border-b text-center border-gray-700 text-sm hover:bg-gray-800 ${
                      gameEnd && hasLost
                        ? "bg-red-500 text-white"
                        : hasLost
                        ? "bg-gray-800 text-gray-200"
                        : "text-green-500"
                    }`}
                  >
                    <td className="p-2">
                      {user.username
                        ? "*******" + user.username.slice(-2)
                        : "*******"}
                    </td>
                    <td className="p-2 text-green-400">
                      {user.cashoutAt ? `x${user.cashoutAt.toFixed(2)}` : "x0"}
                    </td>
                    <td className="p-2 text-blue-300">
                      {user.amount.toLocaleString()} USD
                    </td>
                    <td
                      className={`p-2 ${
                        winAmount > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {winAmount.toLocaleString()} USD
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserList;
