import React from 'react';
import {TextField} from '@material-ui/core';
import {Button} from '@material-ui/core';
import {
  useHistory
} from "react-router-dom";
import axios from 'axios';


export default function Login(props){
  const [username, setUsername ]= React.useState("");
  const [password, setPassword] = React.useState("");
  const [invokeUrl,setInvokeUrl] = React.useState("https://e9f0h6m3dl.execute-api.us-east-1.amazonaws.com/dev")

  const history = useHistory();

  const updateUsername = (e) => {
    setUsername(e.target.value);
  }

  const updatePassword = (e) => {
    if(e.target.value !== 32){
      setPassword(e.target.value);
    }
  }

  const validateCredentials = (e) => {
    if(/\s/g.test(username) || username === "") {
      window.alert("Enter a valid username.")
    } else if (/\s/g.test(password) || password === "") {
      window.alert("Enter a valid password.")
    }
    else {
      axios.get(invokeUrl+'/user?user_name='+username+'&password='+password)
      .then(res => {
        if(res.data === "Invalid password ") {
          window.alert("Invalid password!");
        }
        else {
          history.push('/bookmarks', {userId: res.data, userName: username});
        }
        
      }).catch(error => {
          window.alert("Invalid credentials.");
          console.log(error);
      }) 
    }
  }

  const goToSignup = (e) => {
    history.push('/signup');
  }

  return(
  <div style={styling.mainDiv}>
    <h1 style = {styling.title}> Login</h1>
    <TextField id="outlined-basic" 
                style = {styling.textField}
                label="Username:" 
                variant="outlined" 
                onChange = {updateUsername}/>
    <br/>            
    <TextField id="outlined-basic"
                style = {styling.textField} 
                label="Password:" 
                variant="outlined" 
                type="password"
                onChange = {updatePassword}/>
    <br/>
    <Button style = {styling.button} 
            onClick={validateCredentials}
            color = 'primary' 
            variant = 'contained'>Login</Button>
    <br/>
    <Button style = {styling.button} 
            color = 'primary' 
            onClick = {goToSignup}
            variant = 'contained'>New user? Sign up</Button>
    
  </div>);
}


//Styling for the page
const styling = {
  mainDiv: {
    position: 'absolute', left: '50%', top: '50%',
    transform: 'translate(-50%, -50%)',
    border: '1px solid black',
    borderRadius: '10px',
    height: '48vh',
    width: '60vh',
    display: 'inline-block',
    textAlign: 'center',
  },
  textField: {
    marginBottom: '2vh',
    marginTop: '2vh'
  },
  button: {
    marginTop: '1vh'
  },
  title: {
    marginTop: '1vh'
  }
};