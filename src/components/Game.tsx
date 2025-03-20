import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { GameData, UserData } from "../types";

const socket = io("http://localhost:4000"); // Connect to the backend

const Game: React.FC = () => {
  const [multiplier, setMultiplier] = useState(1);
  const [gameActive, setGameActive] = useState(false);
  const [userId] = useState(1); // Replace with actual user ID
  const [username] = useState("Player1"); // Replace with actual username
  const multiplierRef = useRef(multiplier); // To keep track of multiplier without triggering re-renders

  useEffect(() => {
    // Listen for multiplier updates
    socket.on("multiplierUpdate", (data: GameData) => {
      // Only update if the multiplier has changed significantly
      if (Math.abs(data.multiplier - multiplierRef.current) > 0.01) {
        setMultiplier(data.multiplier);
        multiplierRef.current = data.multiplier;
      }
    });

    // Listen for game start
    socket.on("gameStart", () => {
      setGameActive(true);
      setMultiplier(1);
      multiplierRef.current = 1;
    });

    // Listen for game end
    socket.on("gameEnd", () => {
      setGameActive(false);
    });

    // Cleanup on unmount
    return () => {
      socket.off("multiplierUpdate");
      socket.off("gameStart");
      socket.off("gameEnd");
    };
  }, [multiplier]); // Only track multiplier for updates

  const placeBet = () => {
    const amount = 100; // Replace with actual bet amount
    const betData: UserData = { userId, username, amount };
    socket.emit("placeBet", betData);
  };

  const cashOut = () => {
    socket.emit("cashout", { userId, multiplier });
  };

  return (
    <div className="game">
      <h1>Crash Game</h1>
      <div className="multiplier">Multiplier: {multiplier.toFixed(2)}x</div>
      <button onClick={placeBet} disabled={!gameActive}>
        Place Bet
      </button>
      <button onClick={cashOut} disabled={!gameActive}>
        Cash Out
      </button>
    </div>
  );
};

export default Game;
