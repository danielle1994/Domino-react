import React, { Component } from "react";
import theme from "./theme.css";

const Tile = (props) => {
    let {tileFirstValue, tileSecondValue, deg} = props;
    return (
      <div>
        <img className={`deg${deg}`} src={require(`./assets/tiles/${tileFirstValue}_${tileSecondValue}.png`)} alt=''/>
      </div>
    );
}
export default Tile;
