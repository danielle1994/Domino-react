import React, { Component } from "react";
import theme from "./theme.css";
import Tile from "../Tile/Tile.jsx";

class Player extends Component {
  constructor(props) {
      super(props);
  }
  render(){
      let tiles = this.props.playerTiles.map(value => (
       <div key={value.first + '_' + value.second} onClick={this.props.isYourTurn ? () => this.props.selectTiles(value): null} >
          <Tile key={value.first + '_' + value.second} tileFirstValue={value.first} tileSecondValue={value.second} />
        </div> 
      ));
      return (
        <div id="playerTiles">
          {tiles}
        </div>)
  }
}
export default Player;