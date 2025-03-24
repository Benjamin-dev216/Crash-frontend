import { useEffect, useState, FC, useCallback } from "react";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../axios/axiosInstance";
import socketInstance from "../axios/socket";

interface BetHistory {
  id: string;
  createdAt: string;
  roundId: string;
  amount: number;
  odds: number;
  winAmount: number;
  crashPoint: number;
  result: "win" | "lose";
}

interface UserHistoryProps {
  userId: string;
}

const UserHistory: FC<UserHistoryProps> = ({ userId }) => {
  const [history, setHistory] = useState<BetHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHistory = useCallback(async () => {
    if (!userId) return; // Prevent unnecessary API calls

    setLoading(true);
    try {
      const { data } = await axiosInstance.get<{ bets: BetHistory[] }>(
        `/game/history/${userId}`
      );
      setHistory(data.bets);
    } catch (error: unknown) {
      const err = error as AxiosError;
      const errorMessage =
        (err.response?.data as { error?: string })?.error ||
        "Failed to fetch history";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    socketInstance.on("userHistoryUpdate", (data) => {
      console.log("Updated Bet History:", data);
      setHistory(data.bets);
    });
    fetchHistory();
    return () => {
      socketInstance.off("userHistoryUpdate"); // Cleanup listener on unmount
    };
  }, [fetchHistory]);

  return (
    <div className="w-full p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4 border-b pb-2">Bet History</h2>

      {loading ? (
        <div className="flex justify-center items-center h-20">
          <span className="loader"></span>{" "}
          {/* Replace with a spinner if needed */}
        </div>
      ) : history.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-left">
            <thead>
              <tr className="bg-gray-100 border-b">
                {[
                  "DATE",
                  "TIME",
                  "ROUND ID",
                  "BET",
                  "ODDS",
                  "WIN",
                  "CRASH",
                ].map((head) => (
                  <th key={head} className="p-2">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map(
                ({
                  id,
                  createdAt,
                  roundId,
                  amount,
                  odds,
                  winAmount,
                  crashPoint,
                  result,
                }) => {
                  const date = new Date(createdAt);

                  return (
                    <tr key={id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{date.toLocaleDateString()}</td>
                      <td className="p-2">{date.toLocaleTimeString()}</td>
                      <td className="p-2">{roundId}</td>
                      <td className="p-2 font-medium">
                        ${Number(amount || 0).toFixed(2)}
                      </td>
                      <td className="p-2">{Number(odds || 1).toFixed(2)}x</td>
                      <td
                        className={`p-2 font-bold ${
                          result === "win" ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {winAmount ? `$${Number(winAmount).toFixed(2)}` : "-"}
                      </td>
                      <td className="p-2 text-orange-500">
                        {crashPoint ? `${Number(crashPoint).toFixed(2)}x` : "-"}
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">No bet history found.</p>
      )}
    </div>
  );
};

export default UserHistory;
