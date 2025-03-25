import { useState, useEffect } from "react";
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
  placebet?: (amount: number, cashout: number) => void;
  setBetAmount: (amount: number) => void;
}

const Autobet: React.FC<AutobetProps> = ({
  gameActive,
  countdown,
  placebet,
  setBetAmount,
}) => {
  const [settings, setSettings] = useState<AutobetSettings>({
    baseBet: "",
    maxStake: "",
    autoCashout: "",
    winStrategy: "base",
    loseStrategy: "base",
  });

  const [currentBet, setCurrentBet] = useState(0);
  const [currentStake, setCurrentStake] = useState(0);
  const [isAutobetActive, setIsAutobetActive] = useState(false);

  // Handle numeric input
  const handleInputChange = (key: keyof AutobetSettings, value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const startAutobet = () => {
    const baseBet = Number(settings.baseBet) || 0;
    const maxStake = Number(settings.maxStake) || 0;
    const autoCashout = Number(settings.autoCashout) || 1.01;

    if (baseBet <= 0 || maxStake <= 0 || autoCashout < 1.01) {
      toast.error("Please enter valid bet settings.");
      return;
    }

    setCurrentBet(0);
    setCurrentStake(baseBet);
    setIsAutobetActive(true);
  };

  const stopAutobet = () => {
    setIsAutobetActive(false);
  };

  useEffect(() => {
    if (
      isAutobetActive &&
      gameActive &&
      countdown &&
      countdown > 1 &&
      countdown <= 8
    ) {
      if (currentBet < Number(settings.maxStake)) {
        const betAmount = currentStake;
        const cashout = Number(settings.autoCashout) || 1.01;
        setBetAmount(betAmount);
        placebet?.(betAmount, cashout);
      } else {
        stopAutobet();
      }
    }

    if (!gameActive) {
      setIsAutobetActive(false);
    }
  }, [gameActive, countdown]);

  // Listen for bet results
  useEffect(() => {
    const handleBetResult = (betResult: { win: boolean; amount: number }) => {
      if (!isAutobetActive) return;

      if (betResult.win) {
        setCurrentStake(
          settings.winStrategy === "double"
            ? betResult.amount * 2
            : Number(settings.baseBet) || 0
        );
      } else {
        setCurrentStake(
          settings.loseStrategy === "double"
            ? betResult.amount * 2
            : Number(settings.baseBet) || 0
        );
      }

      setCurrentBet((prev) => prev + 1);
    };

    socketInstance.on("betResult", handleBetResult);

    return () => {
      socketInstance.off("betResult", handleBetResult);
    };
  }, [settings, isAutobetActive]);

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
              value={settings[key]}
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
                  checked={settings[strategy] === option}
                  onChange={() =>
                    setSettings({ ...settings, [strategy]: option })
                  }
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
        {isAutobetActive ? (
          <button
            onClick={stopAutobet}
            className="w-full bg-red-600 hover:bg-red-700 py-1 text-xs rounded font-semibold h-8"
          >
            Stop Autobet
          </button>
        ) : (
          <button
            onClick={startAutobet}
            className="w-full bg-orange-500 hover:bg-orange-600 py-1 text-xs rounded font-semibold h-8"
          >
            PLACE AUTOBET
          </button>
        )}
      </div>

      {/* Betting Status */}
      <div className="mt-2 text-center text-sm">
        <p>
          Bet Count: {currentBet} / {settings.maxStake || 0}
        </p>
        <p>Current Stake: ${currentStake}</p>
      </div>
    </div>
  );
};

export default Autobet;
