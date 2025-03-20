import React from "react";
import Game from "../components/Game";
import UserList from "../components/UserList";

const Landing: React.FC = () => {
  return (
    <div className="app">
      <Game />
      <UserList />
    </div>
  );
};

export default Landing;
