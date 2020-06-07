import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import Canvas from './Canvas';
import Editor from './Editor';

class Routes extends Component {
  render() {
    return (
      <Router>
        <Route exact path='/' component={LandingPage} />
        <Route exact path='/:hash' component={Canvas} />
        {/* <Route exact path='/:hash' component={Editor} /> */}
      </Router>
    );
  }
}

export default Routes;
