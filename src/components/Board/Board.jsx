import React, { Component } from "react";
import theme from "./theme.css";
import Tile from "../Tile/Tile.jsx";

class Board extends Component {
  constructor(props) {
      super(props);
  }
  render(){
    let rows = [];
    for (var i = 0; i < this.props.boardSize; i++) {
      let rowID = `row${i}`;
      let cells = [];
      for (var j = 0; j < this.props.boardSize; j++) {
        let cellID = `cell${i}_${j}`;
        cells.push(
        // (<td key={cellID} id={cellID}  className={this.props.validCells[i][j] ? 'valid' : 'not-valid'} onClick={this.props.validCells[i][j] && !(this.props.isGameOver) ? this.props.selectCell.bind(this,i,j) : null}>
        //     {this.props.boardTiles[i][j].second != undefined && (<Tile key={this.props.boardTiles[i][j].first + '_' + this.props.boardTiles[i][j].second} tileFirstValue={this.props.boardTiles[i][j].first} tileSecondValue={this.props.boardTiles[i][j].second} deg={this.props.boardTiles[i][j].deg} />)}
        // </td>));
        (<td key={cellID} id={cellID} className={this.props.isYourTurn && this.props.validCells[i][j] ? 'valid' : 'not-valid'}  onClick={this.props.validCells[i][j] ? this.props.selectCell.bind(this,i,j) : null}  >
            {this.props.boardTiles[i][j].second != undefined && (<Tile key={this.props.boardTiles[i][j].first + '_' + this.props.boardTiles[i][j].second} tileFirstValue={this.props.boardTiles[i][j].first} tileSecondValue={this.props.boardTiles[i][j].second} deg={this.props.boardTiles[i][j].deg} />)}
        </td>));
      }
      rows.push(<tr key={i} id={rowID}>{cells}</tr>);
    }

    return(
      <div className="container">
        <div className="row">
          <div className="col s12 board">
            <table id="simple-board">
               <tbody>
                 {rows}
               </tbody>
             </table>
          </div>
        </div>
      </div>
    )
  }
}
export default Board;

