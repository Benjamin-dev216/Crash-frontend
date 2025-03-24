import React, { useState, useEffect, useRef } from "react";
import { GameData, UserData } from "../types";
import { ToastContainer, toast } from "react-toastify";
import { useUserContext } from "../context/UserContext";

import socketInstance from "../axios/socket";

const Game: React.FC = () => {
  const { userData } = useUserContext();

  const [multiplier, setMultiplier] = useState(1);
  const [gameActive, setGameActive] = useState(false);
  const [betActive, setBetActive] = useState(true);
  const [cashoutDisabled, setCashoutDisabled] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null); // Store countdown
  const [betAmount, setBetAmount] = useState<number>(100); // User-input bet amount

  const multiplierRef = useRef(multiplier); // Track multiplier without re-rendering

  useEffect(() => {
    // Listen for multiplier updates
    socketInstance.on("multiplierUpdate", (data: GameData) => {
      if (Math.abs(data.multiplier - multiplierRef.current) > 0.01) {
        setMultiplier(data.multiplier);
        multiplierRef.current = data.multiplier;
      }
    });

    socketInstance.on("startPending", (startPendingFlag: boolean) => {
      setBetActive(startPendingFlag);
    });

    // Listen for countdown updates independently
    socketInstance.on("countdown", (data) => {
      if (data.time !== countdown) {
        setCountdown(data.time);
      }
    });

    // Listen for game start
    socketInstance.on("gameStart", () => {
      setGameActive(true);
      setMultiplier(1);
      multiplierRef.current = 1;
      setCountdown(null); // Reset countdown on game start
    });

    // Listen for game end
    socketInstance.on("gameEnd", () => {
      setGameActive(false);
    });

    socketInstance.on("cashoutDisabled", (disabled: boolean) => {
      setCashoutDisabled(disabled);
    });

    socketInstance.on("error", (data: { message: string }) => {
      toast.error(data.message, { position: "top-center" });
    });

    // Cleanup on unmount
    return () => {
      socketInstance.off("multiplierUpdate");
      socketInstance.off("gameStart");
      socketInstance.off("gameEnd");
      socketInstance.off("countdown");
      socketInstance.off("startPending");
      socketInstance.off("cashoutDisabled");
      socketInstance.off("error");
    };
  }, [countdown]); // Only update countdown state

  const placeBet = () => {
    const betData: UserData = {
      username: userData.username,
      amount: betAmount,
    };
    socketInstance.emit("placeBet", betData);
    setBetActive(false);
  };

  const cashOut = () => {
    socketInstance.emit("cashout", { username: userData.username, multiplier });
    setCashoutDisabled(true);
  };

  return (
    <div className="game flex flex-col items-center justify-center ">
      <h1>Crash Game</h1>

      {/* Multiplier above buttons without background */}
      {gameActive && (
        <div className="text-xl font-bold mt-4">
          Multiplier: {multiplier.toFixed(2)}x
        </div>
      )}

      {/* Bet Input Field */}
      <div className="mt-4">
        <label className="mr-2">Bet Amount:</label>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(Number(e.target.value))}
          className="border p-2 rounded"
          min="1"
        />
      </div>

      {/* Game Controls */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={placeBet}
          disabled={!betActive}
          className="px-4 py-2 border border-gray-500 rounded"
        >
          Place Bet
        </button>
        <button
          onClick={cashOut}
          disabled={cashoutDisabled}
          className="px-4 py-2 border border-gray-500 rounded"
        >
          Cash Out
        </button>
      </div>

      {/* Countdown below all contents */}
      {countdown !== null && (
        <div className="mt-8 text-lg font-medium">
          Game starts in: {countdown} seconds
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default Game;
