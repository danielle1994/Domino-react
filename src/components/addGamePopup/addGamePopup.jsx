import React, { Component } from "react";
import theme from "./theme.css";

class AddGamePopup extends React.Component {
  constructor(args) {
    super(...args);
    
    this.state = {
      errMessage: ""
    };        
    this.handleCreateGame = this.handleCreateGame.bind(this);
}
    render() {
      return (
        <div className='popup'>
          <div className='popup_inner'>
            <button onClick={this.props.closeAddGamePopup}>close me</button>
            <form onSubmit={this.handleCreateGame}>
                <label className="gamename-label" htmlFor="gameName"> Game name: </label>
                <input className="gamename-input" name="gameName"/> 
                <p>Please select the number of players:</p>
                <input type="radio" name="numberOfPlayers" value="2" onChange={this.onChange} checked /> 2 players
                <input type="radio" name="numberOfPlayers" value="3" /> 3 players                    
                <input id="newGameSubmit" className="submit-btn btn" type="submit" value="Create game"/>
            </form>
            {this.renderErrorMessage()}

          </div>
          
        </div>
      );
    }

    onChange() {

    }
    
    renderErrorMessage() {
      if (this.state.errMessage) {
          return (
              <div className="addgame-error-message">
                  {this.state.errMessage}
              </div>
          );
      }
      return null;
  }

    handleCreateGame(e) {
      e.preventDefault();
      const gameName = e.target.elements.gameName.value;
      const numOfPlayers = e.target.elements.numberOfPlayers.value;
      fetch('/games/addGame', {method:'POST', body: JSON.stringify({"gameName": gameName, "numOfPlayers": numOfPlayers}), credentials: 'include'})
      .then(response=> {            
          if (response.ok){
              this.setState(()=> ({errMessage: ""}));
              this.props.onGameCreated();
          }
          else {
            if (response.status === 403) {
                this.setState(()=> ({errMessage: "You chose a name that already exist or invalid name"}));
            }
          }
      });
      return false;
    }
  }

export default AddGamePopup;