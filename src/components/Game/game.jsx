import React from 'react';
import ReactDOM from 'react-dom';
import Player from "../Player/Player.jsx";
import Board from "../Board/Board.jsx";
import TileBox from "../TileBox/TileBox.jsx";
import Statistics from "../Statistics/Statistics.jsx";
import LogoImage from "../pictures/logo.png";
import theme from "./theme.css";
import Timer from "../Timer/Timer.jsx";
import EndGamePopup from "../EndGamePopup/EndGamePopup.jsx"
import PlayerWonPopup from "../PlayerWonPopup/PlayerWonPopup.jsx"



export default class Game extends React.Component {
    constructor(props) {
        super(props);
        this.Timer = React.createRef();

        this.state = {
            content: [],
            playerTiles:[],
            game: props.currentGame,
            currentPlayerTurnIndex: 0,
            playerIndex:-1,
            didGetIndex:false,
            isPlayerEndGame: false,
            isGameOver: false,
            showEndGamePopup: false,
            showPlayerWonPopup:false,
            backToLobbyCounter: 0,
        };  

        this.getPlayerTilesOfCurrentPlayer = this.getPlayerTilesOfCurrentPlayer.bind(this);
        this.updateGame = this.updateGame.bind(this);
        this.selectTile = this.selectTile.bind(this);
        this.selectCell = this.selectCell.bind(this);
        this.getTileFromBox = this.getTileFromBox.bind(this);
        this.exitGameHandler = this.exitGameHandler.bind(this);
        this.isPlayerEndGame = this.isPlayerEndGame.bind(this);
        this.updateGameLoop = this.updateGameLoop.bind(this);
        this.closePopup = this.closePopup.bind(this);
        this.backToLobby = this.backToLobby.bind(this);
        this.closePlayerEndGamePopup = this.closePlayerEndGamePopup.bind(this);
    }

    componentDidMount() {
        this.mounted = true;
        if (this.state.playerTiles.length === 0) {
            this.getPlayerTilesOfCurrentPlayer();
        }
        this.updateGameLoop();
    }

    componentWillUnmount() {
        this.mounted = false;
        clearTimeout(this.timeoutIdUpdateGameLoop);
        clearTimeout(this.timeoutIdGetPlayerTilesOfCurrentPlayer);

    }

    render() {
        const {isGameOver, playerTiles, game, currentPlayerTurnIndex, playerIndex, didGetIndex, showEndGamePopup, showPlayerWonPopup } = this.state;            
        if(this.state.game.isActive && didGetIndex) {
            let isYourTurn = game.activePlayers[currentPlayerTurnIndex].name === this.props.currentUser.name;
            return (
                <div className="wrap">
                    <div className="center">
                         <h1>{isGameOver ? null : `${game.activePlayers[currentPlayerTurnIndex].name}'s turn`}</h1>
                        <div id="playerTiles">
                            <Player isYourTurn={isYourTurn}selectTiles={this.selectTile} playerTiles={playerTiles}/>
                        </div>
                            <Board isYourTurn={isYourTurn} boardTiles={game.boardTiles} boardSize={game.boardSize} validCells={game.validCells} selectCell={this.selectCell} />
                    </div>
                    <div className="right">
                        <div>
                        </div>
                        <div>{showEndGamePopup && isGameOver ? 
                            <EndGamePopup avgTimeTurns={game.avgTurnTime} showEndGamePopup={showEndGamePopup} backToLobby={this.backToLobby} orderOfWins={game.orderOfWins} /> : null}
                        </div>
                        <div>{showPlayerWonPopup && !isGameOver ? 
                            <PlayerWonPopup avgTimeTurns={game.avgTurnTime} backToLobby={this.backToLobby} backToGame={this.closePlayerEndGamePopup} winner={game.orderOfWins[0]} /> : null}
                        </div>
                        <img className="logo-image" src={LogoImage}/>
                        <Statistics name={game.players[playerIndex].name} avgTimeTurns={game.avgTurnTime} playerScore={game.players[playerIndex].score} timesPullTileFromBox={game.players[playerIndex].timesPullTileFromBox} totalTurns={game.players[playerIndex].turnTimes}></Statistics> 
                        <TileBox counterOfTiles={game.boxTiles.length} isYourTurn={isYourTurn} isGameOver={false} boxTiles={game.boxTiles} getTile={this.getTileFromBox}/> 
                        <Timer ref={this.Timer} isGameOver={isGameOver}/>      
                        <h3>Players in game:</h3>
                        {game.activePlayers.length !== 0 ? game.activePlayers.map((value) => (<h3 key={value.name}>{value.name} : {value.numOfTiles} tiles</h3>)) : null}      
                    </div>
                </div>
            )
        }
        return (
         <div>
            <p>Waiting for other players...</p>
            <button className="exit-game-btn" onClick={this.exitGameHandler}>Exit Game</button>
        </div>
        )
    }

    updateGameLoop() {
        this.updateGame();
        this.timeoutIdUpdateGameLoop = setTimeout(this.updateGameLoop, 1000);
    }

    updateGame() {
        return fetch(`games/game?gameName=${this.state.game.gameName}&currentUser=${this.props.currentUser.name}`, {method: 'GET', credentials: 'include'})
        .then((response) => {
            if (!response.ok){
                throw response;
            }

            return response.json();            
        })
        .then(result => {
            if(this.mounted) {
                this.setState(()=>({
                    game: result.game,
                    isGameOver: result.isGameOver,
                    showEndGamePopup: result.isGameOver,
                    playerIndex:result.playerIndex,
                    currentPlayerTurnIndex: result.currentPlayerTurn,
                    playerTiles:result.playerTiles,
                    didGetIndex:true
                }));
            }
        })
        .catch(err => {throw err});   
    }

    getPlayerTilesOfCurrentPlayer() {
        return fetch(`games/playerTiles?game=${this.props.currentGame.gameName}&currentUser=${this.props.currentUser.name}`, {method: 'GET', credentials: 'include'})
        .then((response) => {
            if (!response.ok){
                throw response;
            }
            this.timeoutIdGetPlayerTilesOfCurrentPlayer = setTimeout(this.getPlayerTilesOfCurrentPlayer, 200);
            return response.json();            
        })
        .then(playerTiles => {
            if(this.mounted) {
                this.setState(()=>({playerTiles}));
            }
        })
        .catch(err => {throw err});
    }

    selectTile(tile) {
        fetch('/games/selectTile', {method:'POST', 
        body: JSON.stringify({"tile": tile, "gameName": this.state.game.gameName, "currentUser":this.props.currentUser }), 
        credentials: 'include'})
        .then(response=> {            
            if (response.ok){
                this.setState(()=> ({joinErrorMessage: ""}));
            }    
        });
        return false;
    }

    selectCell(boardRow, boardCol) {
        fetch('/games/selectCell', {method:'POST', 
        body: JSON.stringify({"boardRow": boardRow, "boardCol":boardCol, "gameName": this.state.game.gameName, "currentUser":this.props.currentUser }), 
        credentials: 'include'})
        .then(response=> {            
            if (response.ok){
                this.setState(()=> ({joinErrorMessage: ""}));
            }
            this.isPlayerEndGame().then(() => {
                this.updateGame();
            });  
        });
        return false;
    }
    
    getTileFromBox() {
        fetch('/games/getTileFromBox', {method:'POST', 
        body: JSON.stringify({"gameName": this.state.game.gameName, "currentUser":this.props.currentUser}), 
        credentials: 'include'})
        .then(response=> {            
            if (response.ok){
                this.setState(()=> ({joinErrorMessage: ""}));
            }
        });
        return false;
    }

    exitGameHandler() {
        return fetch(`games/exitGame?game=${this.state.game.gameName}&currentUser=${this.props.currentUser.name}`, {method: 'GET', credentials: 'include'})
        .then((response) => {
            if (!response.ok){
                throw response;
            }         
        })
        .then(()=>{this.props.setGame({})})
        .catch(err => {throw err});
    }
    
    isPlayerEndGame() {
        return fetch(`games/isPlayerEndGame?game=${this.state.game.gameName}&currentUser=${this.props.currentUser.name}`, {method: 'GET', credentials: 'include'})
        .then((response) => {
            if (!response.ok){
                throw response;
            }
            return response.json();       
        })
        .then(result => {
            this.updateGame().then(() => {
                this.setState(() => ({ isPlayerEndGame: result, showPlayerWonPopup: result }));
            });
        })
        .catch(err => {throw err});
    }

    closePopup() {
        this.setState(() =>({
            showEndGamePopup: false,
        }));
    }
    closePlayerEndGamePopup() {
        this.setState(() =>({
            showPlayerWonPopup: false,
        }));
    }

    backToLobby() {
        this.closePopup();
        this.exitGameHandler();      
    }
}