const express = require('express');
const router = express.Router();
const auth = require('./auth');
const gameManagement = require('./gameManagement');

const games = express.Router();

const gamesList = [];

games.get('/allGames', auth.userAuthentication, (req, res) => {	
    res.json(gamesList);
});

function getGameByName(name) {
    for(let i=0; i<gamesList.length; i++) {
        if(gamesList[i].gameName === name)
        {
            game = gamesList[i];
            break;
        }
    }
	return game;
}

games.get('/specificGame', auth.userAuthentication, (req, res) => {	
    console.log("bla");
    let gameIndex = -1;
    const game = JSON.parse(req.body);

     for(let i=0; i<gamesList.length; i++)
    {
        if(gamesList[i].gameName === game.gameName)
        {
            gameIndex = i;
            break;
        }
    }
	res.json(gamesList[gameIndex]);
});

games.post('/addGame', auth.userAuthentication, (req, res) => {
    const newGame = JSON.parse(req.body);
    for(let i=0; i<gamesList.length; i++)
    {
        if(gamesList[i].gameName === newGame.gameName)
        {
            res.status(403).send('This name already exist');
			return;
        }
    }
    if(newGame.gameName === "") {
        res.status(403).send('invalid name');
    }
    else {
        newGame.creator = auth.getUserInfo(req.session.id);
        gameManagement.initGame(newGame);
        gamesList.push(newGame);
        res.sendStatus(200);	
    }
});

games.post('/joinToGame', auth.userAuthentication, (req, res) => {
    const game = gamesList[JSON.parse(req.body).gameIndex];
    const player = {};
    const playerTiles = gameManagement.getTile(6, game);

    player.name = auth.getUserInfo(req.session.id).name;
    player.turnTimes = 0;
    player.isEndGame = false;
    player.score = gameManagement.getPlayerTilesScore(playerTiles);
    player.timesPullTileFromBox = 0;
    player.numOfTiles = 6;
    gameManagement.gamesPlayerTiles[game.gameName][player.name] = playerTiles;
    game.players.push(player);
    game.activePlayers.push(player);
    
    if(game.players.length == game.numOfPlayers)
    {
        game.startGameTime = new Date().getTime() /1000,
        game.isActive = true; 
    }
	res.sendStatus(200);	
});

games.post('/deleteGame', auth.userAuthentication, (req, res) => {
    const game = JSON.parse(req.body);

    gamesList.splice(game.gameIndex, 1);
    
	res.sendStatus(200);	
});

games.get('/exitGame', auth.userAuthentication, (req, res) => {
    const gameName = req.query.game;
    const playerName = req.query.currentUser;
    const game = getGameByName(gameName);
    const player = gameManagement.getPlayerByName(playerName, game)

    if(gameManagement.deletePlayerFromGame(game,player)) {
        res.sendStatus(200);	
    }
    else {
        res.status(403).send('Error!');
    }
        
});

games.get('/playerTiles', auth.userAuthentication, (req, res) => {	
    const gameName = req.query.game;
    const currentUserName = req.query.currentUser;
    
	res.json(gameManagement.gamesPlayerTiles[gameName][currentUserName]);
});

games.post('/selectTile',auth.userAuthentication, (req, res) => {		
    const gameName = (JSON.parse(req.body)).gameName;
    const tile = JSON.parse(req.body).tile;
    let midBoardSize = Math.floor(gameManagement.boardTableSize / 2);
    let game = getGameByName(gameName);
    const currentUser = JSON.parse(req.body).currentUser;
    let player = gameManagement.getPlayerByName(currentUser.name, game);

    if(game.isBoardEmpty) {
        gameManagement.updateGameAfterSelectingCell(tile, midBoardSize, midBoardSize, 90, game);
        game.isBoardEmpty = false;
        player.turnTimes++;  //////fix this!!!!!!!!!1
        player.numOfTiles--;
        game.TurnNumber++;
        player.score-= tile.first + tile.second;
    }
    else {
        game.currentTileSelected = tile;
        gameManagement.checkValidCells(tile, false, game);
    }
        res.sendStatus(200);	
});

games.post('/selectCell',auth.userAuthentication, (req, res) => {		
    const gameName = (JSON.parse(req.body)).gameName;
    const row = JSON.parse(req.body).boardRow;
    const col = JSON.parse(req.body).boardCol;
    let game = getGameByName(gameName);
    const currentUser = JSON.parse(req.body).currentUser;
    let player = gameManagement.getPlayerByName(currentUser.name, game);
    let selectedCell = game.cellsState[row][col];
    let selectedTile = game.currentTileSelected;
    player.turnTimes++;
    player.numOfTiles--;
    player.score-= selectedTile.first + selectedTile.second;
    let deg = gameManagement.getDirectionOfTile(selectedCell, selectedTile);
    gameManagement.updateGameAfterSelectingCell(selectedTile, row, col, deg, game);
    game.TurnNumber++;
    res.sendStatus(200);	
});

games.post('/getTileFromBox',auth.userAuthentication, (req, res) => {		
    const gameName = JSON.parse(req.body).gameName;
    const currentUser = JSON.parse(req.body).currentUser;
    let game = getGameByName(gameName);
    let player =  gameManagement.getPlayerByName(currentUser.name, game);
    let tile = gameManagement.getTile(1, game);
    player.turnTimes++;
    player.timesPullTileFromBox++;
    player.numOfTiles++;
    player.score+= tile[0].first + tile[0].second;
    game.TurnNumber++;
    gameManagement.gamesPlayerTiles[gameName][currentUser.name] = (gameManagement.gamesPlayerTiles[gameName][currentUser.name]).concat(tile);
    res.sendStatus(200);	
});

games.get('/isPlayerEndGame', auth.userAuthentication, (req, res) => {
    const gameName = req.query.game;
    const playerName = req.query.currentUser;
    const game = getGameByName(gameName);
    const player = gameManagement.getPlayerByName(playerName, game);

    if(gameManagement.isPlayerEndGame(game,playerName)) {
       gameManagement.deletePlayerFromActivePlayers(game, player);
        res.json(true);	
    }
    else {
        res.json(false);	
    }
        
});

function isGameOver(game) {
    return (game.isActive && gameManagement.isGameOver(game));
}

function getPlayerIndex(game, playerName){
    for(let i=0; i<game.players.length; i++)
    {
        if(game.players[i].name === playerName)
        {
            playerIndex = i;
            break;
        }
    }
	return playerIndex;
}


function getPlayerTiles(game, playerName) {
    return gameManagement.gamesPlayerTiles[game.gameName][playerName];
}
games.get('/game', auth.userAuthentication, (req, res) => {	
    const currentUserName = req.query.currentUser;
    const gameName = req.query.gameName;
    let game = getGameByName(gameName);
    const gameDetails = {};
    gameDetails.isGameOver = isGameOver(game);
    gameDetails.playerIndex = getPlayerIndex(game, currentUserName);
    gameDetails.currentPlayerTurn = gameManagement.getCurrentPlayerTurn(game);
    game.currentPlayerIndex = gameDetails.currentPlayerTurn;
    gameDetails.playerTiles = getPlayerTiles(game, currentUserName);
    gameDetails.game = game;
	res.json(gameDetails);
});

games.post('/initialGame',auth.userAuthentication, (req, res) => {		
    const gameName = (JSON.parse(req.body)).gameName;
    let game = getGameByName(gameName);
    
    gameManagement.initGame(game);
    res.sendStatus(200);	
});

module.exports = games;