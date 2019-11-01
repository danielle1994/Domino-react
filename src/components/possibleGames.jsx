import React from 'react';
import ReactDOM from 'react-dom';

export default class PossibleGames extends React.Component {
    constructor(args) {
        super(...args);
        
        this.state = {
            gamesList: [],
            joinErrorMessage: ""
        };        

        this.getGamesList = this.getGamesList.bind(this);
        this.joinGame = this.joinGame.bind(this);
        this.deleteGame = this.deleteGame.bind(this);

    }

    componentDidMount() {
        this.mounted = true;
        this.getGamesList();
    }

    componentWillUnmount() {
        this.mounted = false;
        if (this.timeoutIdGetGamesList) {
            clearTimeout(this.timeoutIdGetGamesList);
        }
    }

    // componentWillUnmount() {
    //     if (this.timeoutId) {
    //         clearTimeout(this.timeoutId);
    //     }
    // }

    renderErrorMessage() {
        if (this.state.joinErrorMessage) {
            return (
                <div className="joingame-error-message">
                    {this.state.joinErrorMessage}
                </div>
            );
        }
        return null;
    }
    render() {               
        return(
            <div className="possibleGamesList">
                <h1>Game rooms:</h1>
                <table>
                    <tbody>
                        <tr>
                            <th>Game's name</th>
                            <th>Creator name</th>
                            <th>Number of players required</th>
                            <th>Current number of players</th>
                            <th>Can you join?</th>
                        </tr>
                        {this.state.gamesList.map((game, index)=>(
                        <tr key={game.gameName+index}>
                            <td>{game.gameName.toString()}</td> 
                            <td>{game.creator.name}</td> 
                            <td>{game.numOfPlayers}</td> 
                            <td>{game.players.length}</td> 
                            <td>{game.isActive ? "The game has started" :
                                <button className="join-btn" onClick={() => this.joinGame(index)}>Join</button>}
                            </td> 
                            <td>{this.props.currentUserName === game.creator.name && !game.isActive && game.players.length === 0 ?
                                 <button className="delete-btn" onClick={() => this.deleteGame(index)}>Delete game</button> 
                                 : null}</td>
                        </tr>))}
                    </tbody>
                </table>
                {this.renderErrorMessage()}
            </div>
        )
    }

    getGamesList() {
        return fetch('games/allGames', {method: 'GET', credentials: 'include'})
        .then((response) => {
            if (!response.ok){
                throw response;
            }
            this.timeoutIdGetGamesList = setTimeout(this.getGamesList, 1000);
            return response.json();            
        })
        .then(gamesList => {
            if(this.mounted) {
                this.setState(()=>({gamesList}));
            }
        })
        .catch(err => {throw err});
    }

    joinGame(gameIndex) {
        fetch('/games/joinToGame', {method:'POST', 
        body: JSON.stringify({"gameIndex": gameIndex}), 
        credentials: 'include'})
        .then(response=> {            
            if (response.ok){
                this.setState(()=> ({joinErrorMessage: ""}));
                this.props.setGame(this.state.gamesList[gameIndex]);
            }    
        });
        return false;
    }

    deleteGame(gameIndex) {
        fetch('/games/deleteGame', {method:'POST', 
        body: JSON.stringify({"gameIndex": gameIndex}), 
        credentials: 'include'})
        .then(response=> {            
            if (response.ok){
                this.setState(()=> ({joinErrorMessage: ""}));
            }    
        });
        return false;
    }
}