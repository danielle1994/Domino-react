import React, { Component } from "react";
import Statistics from "../Statistics/Statistics.jsx";
import theme from "./theme.css";

class PlayerWonPopup extends React.Component {
    render() {
      const {winner} = this.props;            
      return (
        <div className='popup'>
          <div className='popup_inner'>
            <h1>You won!</h1>
            <Statistics avgTimeTurns={this.props.avgTimeTurns} playerScore={winner.score} timesPullTileFromBox={winner.timesPullTileFromBox} totalTurns={winner.turnTimes} name={winner.name}></Statistics>
            <button onClick={this.props.backToLobby}>Back to lobby</button>
            <button onClick={this.props.backToGame}>Back to game</button>
          </div>
        </div>
      );
    }
  }

export default PlayerWonPopup;
