import React from 'react';
import ReactDOM from 'react-dom';

export default class UsersList extends React.Component {
    constructor(args) {
        super(...args);
        
        this.state = {
            usersNameList: []
        };        

        this.getUsersList = this.getUsersList.bind(this);
    }

    componentDidMount() {
        this.mounted = true;
        this.getUsersList();
    }

    componentWillUnmount() {
        this.mounted = false;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    

    render() {               
        return(
            <div className="userList">
                <h1>Connected users:</h1>
                {this.state.usersNameList.map((name, index) => (<p key={name + index}>{name}</p>))}
            </div>
        )
    }

    getUsersList() {
        return fetch('users/allUsers', {method: 'GET', credentials: 'include'})
        .then((response) => {
            if (!response.ok){
                throw response;
            }
            this.timeoutId = setTimeout(this.getUsersList, 200);
            return response.json();            
        })
        .then(usersNameList => {
            if(this.mounted) {
                this.setState(()=>({usersNameList}));
            }
        })
        .catch(err => {throw err});
    }
}