import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import socketInstance from "../axios/socket";

interface AutobetSettings {
  baseBet: string;
  maxStake: string;
  autoCashout: string;
  winStrategy: "base" | "double";
  loseStrategy: "base" | "double";
}

interface AutobetProps {
  gameActive?: boolean;
  countdown?: number | null;
  cashOutDisabled: boolean;
  placebet: (amount: number) => void;
  cashOut: (cashout: number) => void;
}

const Autobet: React.FC<AutobetProps> = ({
  gameActive,
  countdown,
  placebet,
  cashOut,
}) => {
  // Using useRef to persist state across renders without triggering re-renders
  const settingsRef = useRef<AutobetSettings>({
    baseBet: "",
    maxStake: "",
    autoCashout: "",
    winStrategy: "base",
    loseStrategy: "base",
  });

  const isAutobetActiveRef = useRef(false);
  const currentBetRef = useRef(0);
  const currentStakeRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Store timeout reference

  const [, forceUpdate] = useState(0); // Force re-render when needed

  // Handle numeric input changes
  const handleInputChange = (key: keyof AutobetSettings, value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      settingsRef.current = { ...settingsRef.current, [key]: value };
      forceUpdate((prev) => prev + 1); // Trigger re-render
    }
  };

  const startAutobet = () => {
    const baseBet = Number(settingsRef.current.baseBet) || 0;
    const maxStake = Number(settingsRef.current.maxStake) || 0;
    const autoCashout = Number(settingsRef.current.autoCashout) || 1.01;

    if (baseBet <= 0 || maxStake <= 0 || autoCashout < 1.01) {
      toast.error("Please enter valid bet settings.");
      return;
    }

    currentBetRef.current = 0;
    currentStakeRef.current = baseBet;
    isAutobetActiveRef.current = true;
    forceUpdate((prev) => prev + 1); // Trigger UI update
  };

  const stopAutobet = () => {
    isAutobetActiveRef.current = false;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    forceUpdate((prev) => prev + 1); // Trigger UI update
  };

  const placeBetWithTimeout = (betAmount: number, cashout: number) => {
    placebet(betAmount);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      cashOut(cashout);
    }, 2000);
  };

  useEffect(() => {
    if (
      isAutobetActiveRef.current &&
      !gameActive &&
      countdown &&
      countdown >= 1 &&
      countdown <= 7
    ) {
      if (currentBetRef.current < Number(settingsRef.current.maxStake)) {
        const betAmount = currentStakeRef.current;
        const cashout = Number(settingsRef.current.autoCashout) || 1.01;
        if (countdown === 1) {
          placeBetWithTimeout(betAmount, cashout);
        }
      } else {
        stopAutobet();
      }
    }

    return () => {
      if (countdown !== 1 && timeoutRef.current)
        clearTimeout(timeoutRef.current);
    };
  }, [gameActive, countdown]);

  // Listen for bet results
  useEffect(() => {
    const handleBetResult = (betResult: { win: boolean; amount: number }) => {
      if (!isAutobetActiveRef.current) return;

      if (betResult.win) {
        currentStakeRef.current =
          settingsRef.current.winStrategy === "double"
            ? betResult.amount * 2
            : Number(settingsRef.current.baseBet) || 0;
      } else {
        currentStakeRef.current =
          settingsRef.current.loseStrategy === "double"
            ? betResult.amount * 2
            : Number(settingsRef.current.baseBet) || 0;
      }

      currentBetRef.current++;
      forceUpdate((prev) => prev + 1); // Trigger UI update
    };

    socketInstance.on("betResult", handleBetResult);

    return () => {
      socketInstance.off("betResult", handleBetResult);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto bg-transparent text-white rounded-lg">
      {/* Input Fields */}
      <div className="flex space-x-3 items-end">
        {(["baseBet", "maxStake", "autoCashout"] as const).map((key) => (
          <div key={key} className="flex-1 flex flex-col text-gray-400">
            <label className="text-sm font-medium">
              {key === "baseBet"
                ? "Base Bet"
                : key === "maxStake"
                ? "Max Stake"
                : "Auto Cashout (≥ 1.01)"}
            </label>
            <input
              type="text"
              className="w-full p-1.5 text-sm bg-white text-black border border-gray-500 rounded-md focus:outline-none"
              placeholder="Enter amount"
              value={settingsRef.current[key]}
              onChange={(e) => handleInputChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Win/Lose Strategy */}
      {(["winStrategy", "loseStrategy"] as const).map((strategy) => (
        <div key={strategy} className="mt-2">
          <p
            className={`text-sm font-semibold ${
              strategy === "winStrategy" ? "text-green-400" : "text-red-400"
            }`}
          >
            {strategy === "winStrategy" ? "IF YOU WIN" : "IF YOU LOSE"}
          </p>
          <div className="flex space-x-3">
            {(["base", "double"] as const).map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  className={`form-radio ${
                    strategy === "winStrategy"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                  name={strategy}
                  value={option}
                  checked={settingsRef.current[strategy] === option}
                  onChange={() => {
                    settingsRef.current = {
                      ...settingsRef.current,
                      [strategy]: option,
                    };
                    forceUpdate((prev) => prev + 1);
                  }}
                />
                <span className="ml-2 text-sm">
                  {option === "base"
                    ? "Back to base stake"
                    : "Double your stake"}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Start/Stop Autobet Button */}
      <div className="mt-2">
        {isAutobetActiveRef.current ? (
          <button
            onClick={stopAutobet}
            disabled={gameActive}
            className="w-full bg-red-600 hover:bg-red-700 py-1 text-xs rounded font-semibold h-8"
          >
            Stop Autobet
          </button>
        ) : (
          <button
            onClick={startAutobet}
            disabled={gameActive}
            className="w-full bg-orange-500 hover:bg-orange-600 py-1 text-xs rounded font-semibold h-8"
          >
            PLACE AUTOBET
          </button>
        )}
      </div>

      {/* Betting Status */}
      <div className="mt-2 text-center text-sm">
        <p>Current Stake: ${currentStakeRef.current}</p>
      </div>
    </div>
  );
};

export default Autobet;
