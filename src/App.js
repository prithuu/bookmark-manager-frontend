import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory
} from "react-router-dom";
import Bookmarks from './components/Bookmarks';
import Login from './components/Login';
import Signup from './components/Signup';


export default function App(){
  const history = useHistory();

  return(
    <Router history = {history}>
    <Switch>
        <Route exact path="/" component={props => <Login />}/>

        <Route path="/bookmarks" component={props => <Bookmarks />}/>
        
        <Route path="/signup" component={props => <Signup />}/>
        
      </Switch>
    </Router>
    );
}


