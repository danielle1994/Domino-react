import React, { Component } from "react";
import theme from "./theme.css";

const Statistics = (props) => {
  return (
    <div>
      <h2>Player's Name:{props.name}</h2>
      <h2>Total turns for player:{props.totalTurns}</h2>
      <h2>Avg turn time:{props.avgTimeTurns}</h2>
      <h2>pull from box times:{props.timesPullTileFromBox}</h2>
      <h2>Score:{props.playerScore}</h2>
    </div>
  );
}

export default Statistics;