import axios from 'axios'

/**
 * ACTION TYPES
 */

const GET_ALL_USERS = 'GET_ALL_USERS'
const DELETE_USER = 'DELETE_USER'

/**
 * ACTION CREATORS
 */
const getAllUsers = (users) => ({type: GET_ALL_USERS, users})
const deleteUser = (userId) => ({type: DELETE_USER, userId})

/**
 * THUNK CREATORS
 */

export const fetchAllUsers = () => async (dispatch) => {
  try {
    const {data} = await axios.get('/api/users')
    dispatch(getAllUsers(data))
  } catch (error) {
    console.log(error)
  }
}

export const deletedUser = (userId) => async (dispatch) => {
  try {
    await axios.delete(`/api/users/${userId}`)
    console.log('the error is in the thunk, userId = ', userId)
    dispatch(deleteUser(userId))
  } catch (error) {
    console.error(error)
  }
}

/**
 * REDUCER
 */
export default function (state = [], action) {
  switch (action.type) {
    case GET_ALL_USERS:
      return [...action.users]
    case DELETE_USER:
      const filteredUsers = state.filter((user) => user.id !== action.userId)
      return [...filteredUsers]
    default:
      return state
  }
}
