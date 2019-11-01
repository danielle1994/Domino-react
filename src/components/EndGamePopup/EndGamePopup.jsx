import React, { Component } from "react";
import Statistics from "../Statistics/Statistics.jsx";
import theme from "./theme.css";

class EndGamePopup extends React.Component {
    render() {
      return (
        <div className='popup'>
          <div className='popup_inner'>
            {this.props.orderOfWins.map((value, index) => (
              <div key={value.name}>
                <h3>{`Place ${index+1}: ${value.name}`}</h3>
                <Statistics avgTimeTurns={this.props.avgTimeTurns} playerScore={value.score} timesPullTileFromBox={value.timesPullTileFromBox} totalTurns={value.turnTimes} name={value.name}></Statistics>
              </div>
            ))}
            <button onClick={this.props.backToLobby}>Back to lobby</button>
          </div>
        </div>
      );
    }
  }

export default EndGamePopup;
