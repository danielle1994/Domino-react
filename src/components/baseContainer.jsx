import React from 'react';
import ReactDOM from 'react-dom';
import LoginModal from './login-modal.jsx';
import UsersList from './usersList.jsx';
import PossibleGames from './possibleGames.jsx';
import AddGamePopup from './addGamePopup/addGamePopup.jsx';
import Game from './Game/game.jsx';
import LogoImage from "./pictures/logo.png";



export default class BaseContainer extends React.Component {
    constructor(args) {
        super(...args);
        this.state = {
            showLogin: true,
            currentUser: {
                name: ''
            },
            currentGame: {},
            addGamePopupVisible: false,
        };
        this.closeAddGamePopup = this.closeAddGamePopup.bind(this);
        this.handleSuccessedLogin = this.handleSuccessedLogin.bind(this);
        this.handleLoginError = this.handleLoginError.bind(this);
        this.fetchUserInfo = this.fetchUserInfo.bind(this);
        this.logoutHandler= this.logoutHandler.bind(this);
        this.showAddGamePopup = this.showAddGamePopup.bind(this);
        this.onGameCreated = this.onGameCreated.bind(this);
        this.setCurrentGame= this.setCurrentGame.bind(this);

        this.getUserName();
    }

    render() {
        const { showLogin, currentUser, addGamePopupVisible, currentGame } = this.state;    
        if (showLogin) {
            return (<LoginModal loginSuccessHandler={this.handleSuccessedLogin} loginErrorHandler={this.handleLoginError}/>)
        }
        if(Object.keys(currentGame).length !== 0) {
            return(<Game currentUser = {currentUser} currentGame = {currentGame} setGame={this.setCurrentGame} />)
        }
        return (
            <div className="wrap">
                    <div className="left-base">
                        <div className="lobby-logo">
                            <img className="domino-logo" src={LogoImage} />
                        </div>
                        <h1>Hello {currentUser.name}</h1>
                        <button className="logout-btn" onClick={this.logoutHandler}>Logout</button>
                        <UsersList/>
                    </div>
                <div className="right-base">
                    <button className="create game btn" onClick={this.showAddGamePopup}>Create new game</button>
                    <PossibleGames setGame={this.setCurrentGame} currentUserName={currentUser.name} />
                </div>
                    { addGamePopupVisible && 
                    <div className="add-game-popup">
                        <AddGamePopup onGameCreated={this.onGameCreated} closeAddGamePopup={this.closeAddGamePopup}/>
                    </div>}
            </div>)
    }

    onGameCreated() {
        this.closeAddGamePopup();
        
    }

    handleSuccessedLogin() {
        this.setState(()=>({showLogin:false}), this.getUserName);        
    }

    handleLoginError() {
        console.error('login failed');
        this.setState(()=>({showLogin:true}));
    }

    showAddGamePopup() {
        this.setState(() => ({addGamePopupVisible: true}));
    }
    closeAddGamePopup() {
        this.setState(() => ({addGamePopupVisible: false}));
    }

    getUserName() {
        this.fetchUserInfo()
        .then(userInfo => {
            this.setState(()=>({currentUser:userInfo, showLogin: false}));
        })
        .catch(err=>{            
            if (err.status === 401) { // incase we're getting 'unautorithed' as response
                this.setState(()=>({showLogin: true}));
            } else {
                throw err; // in case we're getting an error
            }
        });
    }

    fetchUserInfo() {        
        return fetch('/users',{method: 'GET', credentials: 'include'})
        .then(response => {            
            if (!response.ok){
                throw response;
            }
            return response.json();
        });
    }

    logoutHandler() {
        fetch('/users/logout', {method: 'GET', credentials: 'include'})
        .then(response => {
            if (!response.ok) {
                console.log(`failed to logout user ${this.state.currentUser.name} `, response);                
            }
            this.setState(()=>({currentUser: {name:''}, showLogin: true}));
        })
    }

    setCurrentGame(game) {
        this.setState(()=>({currentGame: game}));
    }
}