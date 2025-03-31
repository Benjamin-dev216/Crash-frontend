import { useEffect, useState, FC, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../axios/axiosInstance";
import socketInstance from "../axios/socket";
import { GiAlarmClock } from "react-icons/gi";

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
  const hasFetched = useRef(false); // Prevent double fetch

  const fetchHistory = useCallback(async () => {
    if (!userId || hasFetched.current) return; // Prevent unnecessary API calls
    hasFetched.current = true; // Mark as fetched

    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/game/history/${userId}`);
      const historyItems = Array.isArray(data?.bets) ? data.bets : [];

      if (historyItems.length > 0) {
        setHistory(historyItems);
      }
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
      setHistory(data.bets);
    });

    fetchHistory(); // Fetch history once

    return () => {
      socketInstance.off("userHistoryUpdate"); // Cleanup listener on unmount
    };
  }, [fetchHistory]);

  return (
    <div className="w-full bg-[#181c3a] rounded-3xl overflow-hidden relative flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-3 text-white font-semibold text-sm flex items-center gap-2 rounded-t-md pl-8">
        <GiAlarmClock />
        <span>HISTORY</span>
      </div>

      {/* Scrollable Table Wrapper (Fixing overflow issue) */}
      <div className="flex-1 min-h-0">
        <div className="overflow-y-auto h-full">
          <table className="w-full text-left text-gray-300 border-collapse">
            {/* Sticky Header */}
            <thead className="sticky top-0 bg-[#181c3a] z-10">
              <tr className="text-xs text-center border-b border-gray-600 uppercase">
                {[
                  "Date",
                  "Time",
                  "Round ID",
                  "Bet",
                  "Odds",
                  "Win",
                  "Crash",
                ].map((head) => (
                  <th key={head} className="p-2 text-gray-400 bg-[#181c3a]">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center">
                    <span className="loader"></span>
                  </td>
                </tr>
              ) : history?.length > 0 ? (
                history.map(
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
                      <tr
                        key={id}
                        className="border-b text-center border-gray-700 text-sm hover:bg-gray-800"
                      >
                        <td className="p-2">{date.toLocaleDateString()}</td>
                        <td className="p-2">{date.toLocaleTimeString()}</td>
                        <td className="p-2">{roundId}</td>
                        <td className="p-2 text-white">
                          ${Number(amount || 0).toFixed(2)}
                        </td>
                        <td className="p-2">{Number(odds || 1).toFixed(2)}x</td>
                        <td
                          className={`p-2 font-bold ${
                            result === "win" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {winAmount ? `$${Number(winAmount).toFixed(2)}` : "-"}
                        </td>
                        <td className="p-2 text-orange-400">
                          {crashPoint
                            ? `${Number(crashPoint).toFixed(2)}x`
                            : "-"}
                        </td>
                      </tr>
                    );
                  }
                )
              ) : (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-400">
                    You haven't placed any bets yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserHistory;
