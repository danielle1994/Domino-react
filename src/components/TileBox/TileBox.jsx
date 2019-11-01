import React, { Component } from "react";
import theme from "./theme.css";
import TileNew from "../Tile/Tile.jsx";
import tileBoxIcon from "./tileBoxIcon.jpg";

class TileBox extends Component {
  constructor(props) {
      super(props);
      this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    if(this.props.boxTiles.length > 0) {
      this.props.getTile(1)
    }
  }
  
  render(){
      return (
        <div className="tile-box">
          <button onClick={this.handleClick} className={this.props.boxTiles.length > 0 || !this.props.isGameOver ? 'clickable' : 'not-clickable'} disabled={!this.props.isYourTurn || this.props.boxTiles.length<=0 || this.props.isGameOver}>Take Tile</button>
          <h3>Number of tiles that left: {this.props.counterOfTiles}</h3>
        </div>);
  }
}
export default TileBox;