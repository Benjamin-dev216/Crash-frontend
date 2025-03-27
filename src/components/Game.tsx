import React, { useState, useEffect, useRef } from "react";
import { GameData, UserData } from "../types";
import { ToastContainer, toast } from "react-toastify";
import { useUserContext } from "../context/UserContext";

import socketInstance from "../axios/socket";
import { FaTimes } from "react-icons/fa";
import UserHistory from "./UserHistory";
import Autobet from "./Autobet";
import AirplaneAnimation from "./Airplain";
import ParallaxMountains from "./MovingBackground";
const betValues = [50, 200, 600, 1000, 6000, 20000];

const Game: React.FC = () => {
  const { userData } = useUserContext();

  const [multiplier, setMultiplier] = useState(1);
  const [gameActive, setGameActive] = useState(false);
  const [betActive, setBetActive] = useState(true);
  const [cashoutDisabled, setCashoutDisabled] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null); // Store countdown
  const [betAmount, setBetAmount] = useState<string>("50"); // User-input bet amount
  const [activeTab, setActiveTab] = useState("stake");
  const [crashPoint, setCrashPoint] = useState<number>(1);

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
    socketInstance.on("gameStart", (data) => {
      setCrashPoint(data.crashPoint);
      setGameActive(true);
      setMultiplier(1);
      multiplierRef.current = 1;
      setCountdown(null); // Reset countdown on game start
    });

    // Listen for game end
    socketInstance.on("gameEnd", () => {
      setGameActive(false);
      setMultiplier(1);
      multiplierRef.current = 1;
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

  const placeBet = (amount: number) => {
    const betData: UserData = {
      username: userData.username,
      amount: Number(amount),
    };
    socketInstance.emit("placeBet", betData);
    setBetActive(false);
  };

  const cashOut = (cashout: number) => {
    socketInstance.emit("cashout", {
      username: userData.username,
      multiplier: cashout,
    });

    setCashoutDisabled(true);
  };

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Prevents non-numeric inputs and ensures empty string is allowed
    if (/^\d*$/.test(value)) {
      setBetAmount(value);
    }
  };

  return (
    <div className=" flex flex-col h-full">
      <div className="h-3/5 bg-[#151937] rounded-3xl flex items-center justify-center mb-8 text-7xl overflow-hidden font-extrabold px-12 relative">
        {/* Countdown below all contents */}
        <ParallaxMountains isMoving={gameActive} />
        <AirplaneAnimation
          multiplier={multiplier}
          threshold={crashPoint}
          countdown={countdown}
          gameActive={gameActive}
        />
      </div>
      <div className="flex gap-4 h-2/5">
        <div className="w-2/3 h-full">
          <UserHistory userId={userData.userId} />
        </div>
        <div className="bg-[#151937] rounded-lg text-white w-1/3 h-full p-3 text-left">
          <div className="flex">
            <button
              className={`flex-1 py-2 text-xs font-semibold  ${
                activeTab === "stake"
                  ? "bg-[#2A2D40] text-white"
                  : "bg-[#151937] text-gray-400"
              }`}
              onClick={() => setActiveTab("stake")}
            >
              STAKE SELECTOR
            </button>
            <button
              className={`flex-1 py-2 text-xs font-semibold  ${
                activeTab === "autobet"
                  ? "bg-[#2A2D40] text-white"
                  : "bg-[#151937] text-gray-400"
              }`}
              onClick={() => setActiveTab("autobet")}
            >
              AUTOBET
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            {activeTab === "stake" ? (
              <div>
                <label className="block text-gray-400 text-xs mb-1">Bet</label>
                <input
                  type="number"
                  value={betAmount}
                  placeholder="0"
                  onChange={handleBetChange}
                  className="w-full bg-white text-black p-1 text-xs rounded mb-2 focus:outline-none "
                  min="1"
                />
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {betValues.map((value) => (
                    <button
                      key={value}
                      onClick={() =>
                        setBetAmount(String(Number(betAmount) + Number(value)))
                      }
                      className="bg-[#2A2D40] hover:bg-gray-700 text-white text-xs py-1 rounded"
                    >
                      {value}
                    </button>
                  ))}
                  <button
                    onClick={() => setBetAmount("")}
                    className="bg-red-600 hover:bg-red-700 flex items-center justify-center text-xs py-1 rounded"
                  >
                    <FaTimes size={10} />
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => placeBet(Number(betAmount))}
                    disabled={!betActive}
                    className={`flex-1 py-1 text-xs rounded font-semibold h-10 ${
                      betActive
                        ? "bg-orange-500 hover:bg-orange-600"
                        : "bg-gray-600"
                    }`}
                  >
                    <div>PLACE A BET</div>
                    <div className="text-[10px]">
                      {gameActive && "(next round)"}
                    </div>
                  </button>
                  <button
                    onClick={() => cashOut(multiplier)}
                    disabled={cashoutDisabled}
                    className={`flex-1 py-1 text-xs rounded font-semibold ${
                      cashoutDisabled
                        ? "bg-[#7d2d46] text-gray-500"
                        : "bg-[#b11b1b] hover:bg-[#b11b1d] text-white"
                    }`}
                  >
                    TAKE WINNINGS
                  </button>
                </div>
              </div>
            ) : (
              <Autobet
                gameActive={gameActive}
                countdown={countdown}
                cashOutDisabled={cashoutDisabled}
                placebet={placeBet}
                cashOut={cashOut}
              />
            )}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Game;
