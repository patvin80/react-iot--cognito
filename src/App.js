import React, { Component } from 'react';
import { Link, withRouter } from "react-router-dom";
import { Navbar, NavItem, Nav } from "react-bootstrap";
import RouteNavItem from "./components/RouteNavItems"
import Routes from "./Routes";
import './App.css';

class App extends Component {
  constructor(props)
  {
    super(props);
  }

  render() {
    return (
      <div className="App container">
        <Navbar fluid collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/">Cognito IOT</Link> 
            </Navbar.Brand>
          </Navbar.Header>
        </Navbar>
        <Routes childProps={""} />
      </div>
        
    );
  }
}

export default withRouter(App);
