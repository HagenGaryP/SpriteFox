// import axios from 'axios'
// import history from '../history'

// /**
//  * ACTION TYPES
//  */
// const GET_USER = 'GET_USER'

// const REMOVE_USER = 'REMOVE_USER'

// /**
//  * ACTION CREATORS
//  */
// const getUser = user => ({type: GET_USER, user})

// const removeUser = () => ({type: REMOVE_USER})

// /**
//  * INITIAL STATE
//  */
// const defaultUser = {}

// /**
//  * THUNK CREATORS
//  */
// export const me = () => async dispatch => {
//   let res;
//   try {
//     res = await axios.get('/auth/me')
//     dispatch(getUser(res.data || defaultUser))
//   } catch (err) {
//     console.error(err)
//   }
// }

// export const auth = (
//   email,
//   password,
//   method,
//   firstName,
//   lastName
// ) => async dispatch => {
//   let res
//   try {
//     let reqBody = {email, password}
//     if (firstName && lastName) {
//       reqBody = {email, password, firstName, lastName}
//     }
//     res = await axios.post(`/auth/${method}`, reqBody)
//   } catch (authError) {
//     return dispatch(getUser({error: authError}))
//   }

//   try {
//     dispatch(getUser(res.data))
//     history.push('/home')
//   } catch (dispatchOrHistoryErr) {
//     console.error(dispatchOrHistoryErr)
//   }
// }

// export const logout = () => async dispatch => {
//   try {
//     await axios.post('/auth/logout')
//     dispatch(removeUser())
//     history.push('/login')
//   } catch (err) {
//     console.error(err)
//   }
// }

// /**
//  * REDUCER
//  */
// export default function(state = defaultUser, action) {
//   switch (action.type) {
//     case GET_USER:
//       return action.user
//     case REMOVE_USER:
//       return defaultUser

//     default:
//       return state
//   }
// }
