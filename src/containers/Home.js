import React, {Component} from 'react';
import AWS from 'aws-sdk';
import Action from './Action';
import { Form, FormGroup, FormControl, ControlLabel, Button, Col } from "react-bootstrap";
import config from "../config";
import {
    CognitoUserPool,
    AuthenticationDetails,
    CognitoUser
  } from "amazon-cognito-identity-js";

class Home extends Component {

    state = {
        cognitoUserPool: process.env.REACT_APP_cognitoUserPool,
        cognitoIdentityPool: process.env.REACT_APP_cognitoIdentityPool,
        clientId: process.env.REACT_APP_clientId,
        email: process.env.REACT_APP_email,
        password: process.env.REACT_APP_password,
        authenticated: false,
        cogUser: null
    }

    handleChange = event => {
        this.setState({
          [event.target.id]: event.target.value
        });
    }
    
    handleSubmit = event => {
        event.preventDefault();
        if (!this.state.authenticated)
            this.login(this.state.email, this.state.password);
        else 
            this.logout();
    }

    logout (){
        this.setState({ authenticated: false});
        return AWS.config.credentials.clearCachedId();
    }

    login(email, password) {
        var authenticationData = {
            Username: email,
            Password: password,
        };
        var authenticationDetails = new AuthenticationDetails(authenticationData);
    
        var poolData = {
            UserPoolId: this.state.cognitoUserPool, // Your user pool id here
            ClientId: this.state.clientId // Your client id here
        };
        var userPool = new CognitoUserPool(poolData);
    
        var userData = {
            Username: email,
            Pool: userPool
        };
        var cognitoUser = new CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
                window.sessionStorage.setItem("idToken", result.getIdToken().getJwtToken());
                window.sessionStorage.setItem("accessToken", result.getAccessToken().getJwtToken());
                window.sessionStorage.setItem("refreshToken", result.getRefreshToken().getToken());
                AWS.config.region = 'us-east-1';
                let loginurl = "cognito-idp.us-east-1.amazonaws.com/" + poolData.UserPoolId ;
                AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: this.state.cognitoIdentityPool, // your identity pool id here
                    Logins: {
                        [loginurl] : result.getIdToken().getJwtToken()
                        //['cognito-idp.us-east-1.amazonaws.com/' + poolData.UserPoolId] : result.getIdToken().getJwtToken()
                    }
                });
                try {
                    AWS.config.credentials.clearCachedId();
                }
                catch (ex) {                    
                }
                // Instantiate aws sdk service objects now that the credentials have been updated.
                // example: var s3 = new AWS.S3();
    
                AWS.config.credentials.refresh((error) => {
                    if (error) {
                        console.error(error);
                    } else {
                        console.log('Successfully logged!');
                        this.setState({authenticated : true});
                        this.setState({cogUser : cognitoUser})
                    }
                });
    
                console.log("Login success");
                console.log(result);
            },
    
            onFailure: function (err) {
                console.log("Login failure");
                alert(err);
            },

            newPasswordRequired: function (val)
            {
                console.log("New Password");
            }
    
        });
    }

    render () {
        return (
            [
            <div>
                <Form onSubmit={this.handleSubmit} horizontal>
                    <FormGroup controlId="cognitoUserPool">
                        <Col componentClass={ControlLabel} sm={2}>
                        Cognito User Pool 
                        </Col>
                        <Col sm={10}>
                        <FormControl 
                            placeholder="Cognito User Pool"
                            value={this.state.cognitoUserPool}
                            onChange={this.handleChange} />
                        </Col>
                    </FormGroup>
                    <FormGroup controlId="cognitoIdentityPool">
                        <Col componentClass={ControlLabel} sm={2}>
                        Cognito Identity Pool 
                        </Col>
                        <Col sm={10}>
                        <FormControl 
                            placeholder="Cognito Identity Pool"
                            value={this.state.cognitoIdentityPool}
                            onChange={this.handleChange} />
                        </Col>
                    </FormGroup>   
                    <FormGroup controlId="clientId">
                        <Col componentClass={ControlLabel} sm={2}>
                        App Client ID
                        </Col>
                        <Col sm={10}>
                        <FormControl 
                            placeholder="Cognito Identity Pool"
                            value={this.state.clientId}
                            onChange={this.handleChange} />
                        </Col>
                    </FormGroup>                    
                    <FormGroup controlId="email">
                        <Col componentClass={ControlLabel} sm={2}>
                        Email
                        </Col>
                        <Col sm={10}>
                        <FormControl
                            autoFocus
                            value={this.state.email}
                            onChange={this.handleChange}
                        />
                        </Col>
                    </FormGroup>
                    <FormGroup controlId="password">
                        <Col componentClass={ControlLabel} sm={2}>
                        Password
                        </Col>
                        <Col sm={10}>
                        <FormControl
                            value={this.state.password}
                            onChange={this.handleChange}
                            type="password"
                        />
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col smOffset={2} sm={10}>
                        { this.state.authenticated ? 
                            <Button type="submit" bsStyle="warning" onSubmit={this.handleSubmit} >Sign Out</Button> :
                            <Button type="submit" bsStyle="primary" onSubmit={this.handleSubmit} >Sign in</Button> 
                             
                        }
                        </Col>
                    </FormGroup>
                </Form>

            </div>,
            <div class="row">
                <div class="col-sm-8"> { this.state.authenticated ? <Action cogUser={this.state.cogUser} idPool={this.state.cognitoIdentityPool}/> : null } </div>
            </div>
            ]
        );
    }
}

export default Home;