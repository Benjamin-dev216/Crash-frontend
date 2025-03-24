import { useEffect, useState, FC } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

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

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get<{ bets: BetHistory[] }>(
          "/api/user/history",
          {
            params: { userId },
          }
        );
        setHistory(data.bets);
      } catch (error: any) {
        toast.error(error.response?.data?.error || "Failed to fetch history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  return (
    <div className="w-full p-4 bg-white shadow-lg rounded-lg">
      <ToastContainer />
      <h2 className="text-xl font-semibold mb-4 border-b pb-2">Bet History</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : history.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-100 border-b">
                {[
                  "Date",
                  "Time",
                  "Round ID",
                  "Bet",
                  "Odds",
                  "Win",
                  "Crash",
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
                      <td className="p-2 font-medium">${amount.toFixed(2)}</td>
                      <td className="p-2">{odds}x</td>
                      <td
                        className={`p-2 font-bold ${
                          result === "win" ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {winAmount > 0 ? `$${winAmount.toFixed(2)}` : "-"}
                      </td>
                      <td className="p-2 text-orange-500">{crashPoint}x</td>
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
