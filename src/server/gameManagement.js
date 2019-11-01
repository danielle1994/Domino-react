const express = require('express');
const router = express.Router();


const gameManagement = express.Router();
const EMPTY_CELL = 0;
const OCCUPIED_CELL = -1;
const gamesPlayerTiles = {};
let boardTableSize = 11; 


function initGame(newGame) {
    newGame.players = [];
    newGame.activePlayers = [];
    newGame.isActive = false;
    newGame.isBoardEmpty = true;
    newGame.boardTiles =  createEmptyMatrix(boardTableSize, boardTableSize, {});
    newGame.cellsState = createEmptyMatrix(boardTableSize, boardTableSize, EMPTY_CELL);
    newGame.validCells = createEmptyMatrix(boardTableSize,boardTableSize);
    newGame.boxTiles =  createBoxTiles();   
    newGame.currentTileSelected = null;
    newGame.boardSize = boardTableSize;
    newGame.TurnNumber = 0;
    newGame.orderOfWins = [];
    newGame.isGameOver = false;
    newGame.currentPlayerIndex = -1;
    newGame.avgTurnTime = 0;
    gamesPlayerTiles[newGame.gameName] = {};
}

function getPlayerByName(playerName, game) {
    for(let i=0; i<game.players.length; i++) {
        if(game.players[i].name === playerName)
        {
            player = game.players[i];
            break;
        }
    }
	return player;
}

function createBoxTiles() {
    const boxTiles = [];
    for(let i = 0; i < 7; i++) {
        for(let j = i; j < 7; j++) {
            boxTiles.push({ first: i, second: j });
        }
    }
     return boxTiles;
}

function getTile(numOfTiles, game) {
    let chosenTiles = [];
    let tmpBoxTiles = game.boxTiles.concat([]);
    //let newAvgTurnTime = 0;

    for (let i = 0; i < numOfTiles; i++){
        var lenArray = tmpBoxTiles.length;
        var randIndex = getRandomInt(lenArray);
        let chosenTile = tmpBoxTiles[randIndex];
        chosenTiles.push(chosenTile);
        tmpBoxTiles = tmpBoxTiles.filter(item => item !== chosenTile);
    }

    if(numOfTiles === 1) {
        updateAvgTurnTime(game);
    } 
    game.boxTiles = tmpBoxTiles;
    return chosenTiles;
}

function getRandomInt(max) {
    max = Math.floor(max);
    return Math.floor(Math.random() * (max)); 
}

function createEmptyMatrix(rowsCount, colsCount, initialValue) {
    let newMatrix = {};
    for(let i = 0; i < rowsCount; i++) {
        let currentRow = [];
        for(let j = 0; j < colsCount; j++) {
            currentRow.push(initialValue);
        }
        newMatrix[i] = currentRow;
    }
    return newMatrix;
}

function updateGameAfterSelectingCell(tile, boardRow, boardCol, deg, game)
{
    let newBoardSize = game.boardSize;
    let boardTiles = game.boardTiles;
    boardTiles[boardRow][boardCol] = {first:tile.first, second:tile.second, deg: deg};

    updateAvgTurnTime(game);

    if (isBoardHasToExpand(boardRow, boardCol, game.boardSize)) {
       newBoardSize+= 4;
    }

    let newValidCells = getValidCellsMatrix(boardRow, boardCol, game);
    let newBoardTiles = getUpdatedBoardTiles(tile,boardRow,boardCol, deg, game);
    let newCellsState = getUpdatedCellsState(tile,boardRow,boardCol, deg, game);

    updatePlayerTiles(tile, game);

    game.boardSize = newBoardSize;
    game.boardTiles = newBoardTiles;
    game.cellsState = newCellsState;
    game.validCells = newValidCells
}

function isBoardHasToExpand(boardRow, boardCol, boardSize) {
    return (boardRow === 0 || boardRow === boardSize - 1 || boardCol === 0 || boardCol === boardSize - 1) 
}

function getValidCellsMatrix(boardRow, boardCol, game) {
    let newBoardSize = game.boardSize;
    if(isBoardHasToExpand(boardRow, boardCol, game.boardSize)) {
        newBoardSize+= 4;        
    }
    let newValidCells = createEmptyMatrix(newBoardSize, newBoardSize);  //update valid cells matrix
    return newValidCells;
}

function getUpdatedBoardTiles(tile, boardRow, boardCol, deg, game) {
    let newBoardTiles;

    if(isBoardHasToExpand(boardRow, boardCol, game.boardSize)) {
        newBoardTiles = getExpandedBoardTileMatrix(game);
        boardRow+= 2;
        boardCol+= 2;
    } 
    else {
        newBoardTiles = JSON.parse(JSON.stringify(game.boardTiles));
    }

    newBoardTiles[boardRow][boardCol] = {first:tile.first, second:tile.second, deg: deg};
    return newBoardTiles;
}

function getExpandedBoardTileMatrix(game) {
    let newBoardSize = game.boardSize + 4;
    let newBoardTiles = createEmptyMatrix(newBoardSize, newBoardSize, {});
    for(let i = 2; i < game.boardSize + 2; i++) {
        for(let j = 2; j < game.boardSize + 2; j++) {
            newBoardTiles[i][j] = game.boardTiles[i-2][j-2];
        }
    }
    return newBoardTiles;
}

function getUpdatedCellsState(tile, boardRow, boardCol, deg, game) {
    let newCellsState;
    let newBoardSize = game.boardSize;

    if(isBoardHasToExpand(boardRow, boardCol, game.boardSize)) {
        newCellsState = getExpandedCellsStateMatrix(game);
        newBoardSize+= 4;
        boardRow+= 2;
        boardCol+= 2;
    } 
    else {
        newCellsState = JSON.parse(JSON.stringify(game.cellsState));
    }

    if (tile.first === tile.second){
        updateAdjacentCellsState(boardRow, boardCol,
            deg, tile.first, tile.second, newCellsState, newBoardSize);
        updateAdjacentCellsState(boardRow, boardCol,
            deg+90,tile.first, tile.second, newCellsState, newBoardSize);
    } else {
        if (deg === 90 || deg === 180) {
            updateAdjacentCellsState(boardRow, boardCol,
                deg, tile.second, tile.first, newCellsState, newBoardSize);
        }
        else {
            updateAdjacentCellsState(boardRow, boardCol,
                deg, tile.first, tile.second, newCellsState, newBoardSize);
        }
    }
    newCellsState[boardRow][boardCol] = OCCUPIED_CELL;

    return newCellsState;
}

function getExpandedCellsStateMatrix(game) {
    let newBoardSize = game.boardSize + 4;
    let newCellsState = createEmptyMatrix(newBoardSize, newBoardSize, EMPTY_CELL);
    for(let i = 2; i < game.boardSize + 2; i++) {
        for(let j = 2; j < game.boardSize + 2; j++) {
            newCellsState[i][j] = game.cellsState[i-2][j-2];
        }
    }
    return newCellsState;
}

function updateAdjacentCellsState(boardRow, boardCol, deg, firstValue, secondValue, cellsState, currBoardSize) {
    if (deg % 180 > 0) {
        if(boardCol > 0) {     //left
            if (cellsState[boardRow][boardCol - 1] == EMPTY_CELL) {
                cellsState[boardRow][boardCol - 1] = {};
            }
            if(cellsState[boardRow][boardCol - 1] != OCCUPIED_CELL) {
                cellsState[boardRow][boardCol - 1].right = firstValue;
            }
        }
        if(boardCol < currBoardSize - 1) { //right
            if (cellsState[boardRow][boardCol + 1] == EMPTY_CELL) {
                cellsState[boardRow][boardCol + 1] = {};
            }
            if(cellsState[boardRow][boardCol + 1] != OCCUPIED_CELL) {
                cellsState[boardRow][boardCol + 1].left = secondValue;
            }
        }
    } else {
        if(boardRow > 0) {  //up
            if (cellsState[boardRow - 1][boardCol] == EMPTY_CELL) {
                cellsState[boardRow - 1][boardCol] = {};
            }
            if(cellsState[boardRow - 1][boardCol] != OCCUPIED_CELL) {
                cellsState[boardRow - 1][boardCol].down = firstValue;
            }
        }
        if(boardRow < currBoardSize - 1) {  //down
            if (cellsState[boardRow + 1][boardCol] == EMPTY_CELL) {
                cellsState[boardRow + 1][boardCol] = {};
            }
            if(cellsState[boardRow + 1][boardCol] != OCCUPIED_CELL) {
                cellsState[boardRow + 1][boardCol].up = secondValue;
            }
        }
    }
}

function updatePlayerTiles(tile, game) {
    let playerIndex = game.currentPlayerIndex;
    let player = game.activePlayers[playerIndex];
    let tmpPlayerTiles = (gamesPlayerTiles[game.gameName][player.name]).concat([]);
    tmpPlayerTiles = tmpPlayerTiles.filter(item => item.first !== tile.first || item.second !== tile.second);
    gamesPlayerTiles[game.gameName][player.name] = tmpPlayerTiles;
}

function getDirectionOfTile(selectedCell, selectedTile) {
    let deg;

    if(selectedTile.first == selectedCell.left || selectedTile.second == selectedCell.right) {
        deg = 270;
    } else if(selectedTile.first == selectedCell.right || selectedTile.second == selectedCell.left) {
        deg = 90;
    }
    else if(selectedTile.first == selectedCell.up || selectedTile.second == selectedCell.down) {
        deg = 0;
    }
    else {
        deg = 180;
    }
    
    if(selectedTile.first == selectedTile.second) {
        deg += 90;
    }

    return deg;
}

function checkValidCells(tile, isCheckingGameOver, game) {
    let isHaveValidCells = false;
    let currentBoardSize = game.boardSize;
    const newValidCells = createEmptyMatrix(currentBoardSize, currentBoardSize);
    const tileValuesArray = [tile.first, tile.second];
    
    for(let i = 0; i < currentBoardSize; i++) {
        for(let j = 0; j < currentBoardSize; j++) {
            if (game.cellsState[i][j] != OCCUPIED_CELL) {
                const cellValues = [];
                cellValues.push(game.cellsState[i][j].up);
                cellValues.push(game.cellsState[i][j].down);
                cellValues.push(game.cellsState[i][j].left);
                cellValues.push(game.cellsState[i][j].right);

                if (cellValues.some(val => tileValuesArray.includes(val))){
                        newValidCells[i][j] = 1;
                        isHaveValidCells = true; 
                }
            }
        }
    }
    
    if(!isCheckingGameOver) {
        game.validCells = newValidCells;
    }
    return isHaveValidCells;
}

function deletePlayerFromGame(game, player) {
    for(let i = 0; i < game.players.length; i++) {
        if(game.players[i].name == player.name) {
            game.players.splice(i,1);
            if(game.players.length === 0) { //All players quit game 
                initGame(game);
            }
            return true;
        }
    }
    return false;
}

function deletePlayerFromActivePlayers(game, player) {
    for(let i = 0; i < game.activePlayers.length; i++) {
        if(game.activePlayers[i].name == player.name) {
            game.activePlayers.splice(i,1);
            return true;
        }
    }
    return false;
}

function isPlayerEndGame(game, playerName) {
    const player = getPlayerByName(playerName, game);

    if( !player.isEndGame && gamesPlayerTiles[game.gameName][playerName].length === 0) {
        player.isEndGame = true;
        game.orderOfWins.push(player);
    }
    
    return player.isEndGame;
}

function isGameOver(game) {
    if(!game.isGameOver) {
        let countPlayersInGame = 0;
        let playerIndex = -1;
        for(let i = 0; i < game.players.length; i++){
            if(!game.players[i].isEndGame) {
                playerIndex = i;
                countPlayersInGame++;
            }
        }

        if(countPlayersInGame === 1) {
            game.players[playerIndex].isEndGame = true;
            game.orderOfWins.push(game.players[playerIndex]);
            game.isGameOver = true;
            return true;
        }
        else {
            if(game.boxTiles.length === 0) {
                for(let i = 0; i < game.players.length; i++){
                    if(!game.players[i].isEndGame && checkValidMovesForPlayer(game.players[i].name, game)) {
                        return false;
                    }
                }
                insertToOrderOfWins(game);
                game.isGameOver = true;
                return true;
            }
            else {
                return false;
            }
        }
    }
    else {
        return true;
    }
}

function insertToOrderOfWins(game) {
    let score1 = game.players[0].score;
    let score2 = game.players[1].score;
    
    if(score1 < score2) {
        if (game.players.length === 3) {
            let score3 = game.players[2].score;
            if(score3 < score1) {
                game.orderOfWins.push(game.players[2]);
            }
            game.orderOfWins.push(game.players[0]);
            if(score3 < score2) {
                game.orderOfWins.push(game.players[2]);
            }
            game.orderOfWins.push(game.players[1]);
            if(score3 > score2) {
                game.orderOfWins.push(game.players[2]);
            }
        } else {
            game.orderOfWins.push(game.players[0]);
            game.orderOfWins.push(game.players[1]);
        }
    } else {
        if (game.players.length === 3) {
            let score3 = game.players[2].score;
            if(score3 < score2) {
                game.orderOfWins.push(game.players[2]);
            }
            game.orderOfWins.push(game.players[1]);
            if(score3 < score1) {
                game.orderOfWins.push(game.players[2]);
            }
            game.orderOfWins.push(game.players[0]);
            if(score3 > score1) {
                game.orderOfWins.push(game.players[2]);
            }
        } else {
            game.orderOfWins.push(game.players[1]);
            game.orderOfWins.push(game.players[0]);
        }

    }
    

}

function checkValidMovesForPlayer(playerName, game) {
    playerTilesArray = gamesPlayerTiles[game.gameName][playerName];
    let lenOfPlayerTile = gamesPlayerTiles[game.gameName][playerName].length;
    let isHaveValidMoves = false;
    for(let i = 0; i < lenOfPlayerTile && !isHaveValidMoves; i++) {
        isHaveValidMoves = checkValidCells(playerTilesArray[i], true, game);
    }
    return isHaveValidMoves;
}

function getPlayerTilesScore(playerTiles) {
    let sizeArr = playerTiles.length;
    let score = 0;
    for(let i = 0; i < sizeArr; i++) {
        score+= (playerTiles[i].first + playerTiles[i].second);
    }
    return score;
}


function getCurrentPlayerTurn(game) {
    let playerIndex;
    let numOfActivePlayers = game.activePlayers.length;
    if(game.boxTiles.length === 0 && !checkValidMovesForPlayer(game.players[game.TurnNumber % game.numOfPlayers].name,game)) { // if the current player doesn't have valid moves
            game.TurnNumber++;
    }

    playerIndex = game.TurnNumber % numOfActivePlayers;
    return playerIndex;
}

function updateAvgTurnTime(game) {
    let currentSeconds = new Date().getTime() / 1000;
    let totalTurns = game.TurnNumber;
    let newAvgTurnTime = ((currentSeconds - game.startGameTime) / totalTurns).toFixed(2);
    game.avgTurnTime = newAvgTurnTime;
}

module.exports = {deletePlayerFromActivePlayers, getCurrentPlayerTurn, initGame, boardTableSize, getPlayerTilesScore, checkValidMovesForPlayer, isGameOver, getPlayerByName, isPlayerEndGame, deletePlayerFromGame, gamesPlayerTiles, updatePlayerTiles, getDirectionOfTile, checkValidCells, createBoxTiles, getTile, getRandomInt, createEmptyMatrix, updateGameAfterSelectingCell, isBoardHasToExpand, getValidCellsMatrix, getUpdatedBoardTiles, getExpandedBoardTileMatrix, getExpandedCellsStateMatrix, getUpdatedCellsState};
