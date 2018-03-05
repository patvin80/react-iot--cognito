import React, { Component } from 'react'
import { Form, FormGroup, FormControl, ControlLabel, Button, Col, ButtonToolbar } from "react-bootstrap";
import AWS from 'aws-sdk';
import ResponseMessage from './ResponseMessage';
export default class Action extends Component {
  constructor(props)
  {
    super(props);
  }

  state = {
    iotThingName: "iOTThings1",
    iotEndpoint: "a2mk4nyc927oml.iot.us-east-1.amazonaws.com",
    responses: [],
    iotPolicy: "iOTThings1-Policy"
  }

  getThingShadow = () => {
    var params = {
      thingName: this.state.iotThingName /* required */
    };
    console.log('accessKeyId: ' + AWS.config.credentials.accessKeyId);
    var iotdata = new AWS.IotData({ endpoint: this.state.iotEndpoint});
    iotdata.getThingShadow(params, (err, data) => {
      let resps = this.state.responses;
      if (err) {
          resps.push(this.buildResponseObject("danger",err, err.stack));
      }
      else {
          resps.push(this.buildResponseObject("success","Successfully Retrieved Thing Shadow Details", JSON.stringify(data)));
      }
      this.setState({responses : resps});
    });
  }

  handleChange = event => {
      this.setState({
        [event.target.id]: event.target.value
      });
  }

  resetHandler = () => {
    let resps = this.state.responses;
    resps.push(this.buildResponseObject("success","Reset", "Clearing the Identity from the Cognito IDP"));
    this.setState({responses : resps});
  }

  buildResponseObject = (responseType, responseTitle, responseBody) => {
    return ({style: responseType, title: responseTitle, content: responseBody})
  }

  attachPolicy = () => {
    let cognitoUser = this.props.cogUser;
    AWS.config.credentials.refresh((error) => {
      if (error)
          console.log(error);
      else {
          window.sessionStorage.setItem('accessKeyId', AWS.config.credentials.accessKeyId);
          window.sessionStorage.setItem('secretAccessKey', AWS.config.credentials.secretAccessKey);
          window.sessionStorage.setItem('sessionToken', AWS.config.credentials.sessionToken);

          console.log('accessKeyId: ' + AWS.config.credentials.accessKeyId);
          console.log('secretAccessKey: ' + AWS.config.credentials.secretAccessKey);
          console.log('sessionToken: ' + AWS.config.credentials.sessionToken);
      }

      console.log(cognitoUser);
      console.log(cognitoUser.storage["aws.cognito.identity-id." + this.props.idPool]);
      var params = {
          policyName: this.state.iotPolicy, /* required */
          target: cognitoUser.storage["aws.cognito.identity-id." + this.props.idPool]/* required */
      };
      var iot = new AWS.Iot({apiVersion: '2015-05-28'});
      iot.attachPolicy(params,  (err, data) => {
        let resps = this.state.responses;
          if (err) {
            console.log('IOT error', err, err.stack); // an error occurred
            resps.push(this.buildResponseObject("danger",err, err.stack));
          }
          else {
            console.log(data);           // successful response
            resps.push(this.buildResponseObject("success","Successfully Associated Policy", "Policy Name: " + this.state.iotPolicy + " to Identity " + cognitoUser.storage["aws.cognito.identity-id." + this.props.idPool]));
          }
          this.setState({responses : resps});
      });
  });
  }

  onComponentWillUpdate = () => {
    console.log("I am in Actions componet");
    console.log(this.props.cogUser);
  }

  render() {
    console.log(this.props.cogUser);
    return (
      <div>
        <Form horizontal>
          <FormGroup controlId="iotThing">
              <Col componentClass={ControlLabel} sm={3}>
              IoT Thing Name
              </Col>
              <Col sm={5}>
              <FormControl
                  value={this.state.iotThingName}
                  onChange={this.handleChange}
              />
              </Col>
          </FormGroup>
          <FormGroup controlId="iotEndPoint" className="row">
              <Col componentClass={ControlLabel} sm={3}>
              IoT End Point
              </Col>
              <Col sm={5}>
              <FormControl
                  value={this.state.iotEndpoint}
                  onChange={this.handleChange}
              />
              </Col>
          </FormGroup> 
          <FormGroup controlId="iotPolicy" className="row">
              <Col componentClass={ControlLabel} sm={3}>
              IoT Policy
              </Col>
              <Col sm={5}>
              <FormControl
                  value={this.state.iotPolicy}
                  onChange={this.handleChange}
              />
              </Col>
          </FormGroup>           
          <FormGroup>
            <Col smOffset={2} sm={10}>  
            <ButtonToolbar>    
              <Button type="button" bsStyle="danger" onClick={this.getThingShadow} >Get Thing Shadow - Failed</Button> 
              <Button type="button" bsStyle="info" onClick={this.attachPolicy} >Attach IoT Policy</Button>
              <Button type="button" bsStyle="success" onClick={this.getThingShadow} >Get Thing Shadow</Button>
              <Button type="button" onClick={this.resetHandler} >Reset</Button>
            </ButtonToolbar>
            </Col>
          </FormGroup>
        </Form>
        <ResponseMessage responses={this.state.responses}/>
      </div>
    )
  }
}
