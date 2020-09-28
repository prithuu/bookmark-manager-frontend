import React from 'react';
import {TextField} from '@material-ui/core';
import {Button} from '@material-ui/core';
import {
  useHistory
} from "react-router-dom";
import axios from 'axios';


export default function Signup(props){
  const [username, setUsername ]= React.useState("");
  const [password, setPassword] = React.useState("");
  // const [invokeUrl] = React.useState("https://nomvt8uagi.execute-api.us-east-1.amazonaws.com/dev")
  const [invokeUrl] = React.useState("https://e9f0h6m3dl.execute-api.us-east-1.amazonaws.com/dev")

  const history = useHistory();

  const updateUsername = (e) => {
    setUsername(e.target.value);
  }

  const updatePassword = (e) => {
    setPassword(e.target.value);
  }

  const createCredentials = (e) => {
    if(/\s/g.test(username) || username === "") {
      window.alert("Enter a valid username.")
    } else if (/\s/g.test(password) || password.length <= 4 || password === "") {
      window.alert("Enter a valid password.")
    }
    else {
      const url = invokeUrl+"/user?user_name="+username+"&password="+password;
      console.log(url); 
      axios.post(url)
      .then(res => {
        history.push('/bookmarks', {userId: res.data, userName: username});
      })
    }
    
  }

  const goBackToLogin = () => {
    history.push("/", );
  }

  return(
  <div style={styling.mainDiv}>
    <h1 style = {styling.title}>Signup</h1>
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
                onChange = {updatePassword}
                />
    <br/>
    <Button style = {styling.button} 
            color = 'primary' 
            onClick = {createCredentials}
            variant = 'contained'>Create account and login</Button>
    <br/>
    <Button style = {styling.button} 
            color = 'primary' 
            onClick = {goBackToLogin}
            variant = 'contained'>Go back to login</Button>

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