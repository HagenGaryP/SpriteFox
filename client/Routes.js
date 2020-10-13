import React, {Component} from 'react'
import {connect} from 'react-redux'

import {withRouter, Route, Switch, BrowserRouter as Router} from 'react-router-dom'
import PropTypes from 'prop-types'

// import {me} from './store'
import LandingPage from './components/LandingPage';
import Canvas from './components/Canvas';

class Routes extends Component {
  // componentDidMount() {
  //   this.props.loadInitialData()
  // }
  render() {
    return (
      <Router>
        <Route exact path='/' component={LandingPage} />
        <Route exact path='/:hash' component={Canvas} />
      </Router>
    );
  }
}

export default Routes;


/**
 * CONTAINER
 */
// const mapState = (state) => {
//   return {
//     // Being 'logged in' for our purposes will be defined has having a state.user that has a truthy id.
//     // Otherwise, state.user will be an empty object, and state.user.id will be falsey
//     isLoggedIn: !!state.user.id,
//     user: state.user,
//     userId: state.user.id,
//     isAdmin: state.user.isAdmin,
//   }
// }

// const mapDispatch = (dispatch) => {
//   return {
//     loadInitialData() {
//       dispatch(me())
//     },
//   }
// }

// // The `withRouter` wrapper makes sure that updates are not blocked
// when the url changes
// export default withRouter(connect(mapState, mapDispatch)(Routes))

/**
 * PROP TYPES
 */
// Routes.propTypes = {
//   loadInitialData: PropTypes.func.isRequired,
//   isLoggedIn: PropTypes.bool.isRequired,
// }
