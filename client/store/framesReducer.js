/* eslint-disable no-case-declarations */
import axios from 'axios'

export const GET_FRAMES = 'GET_FRAMES'
export const ADD_FRAME = 'ADD_FRAME'
export const REMOVE_FRAME = 'REMOVE_FRAME'
export const FILTERED_FRAMES = 'FILTERED_FRAMES'

const getFrames = (frames) => ({type: GET_FRAMES, frames})
const addFrame = (frame) => ({type: ADD_FRAME, frame})
const removeFrame = (frameId) => ({type: REMOVE_FRAME, frameId})
const filteredFrames = (frames) => ({type: FILTERED_FRAMES, frames})

export const fetchFrames = (
  selections,
  ratings,
  order,
  page,
  perPage,
  searchTerm
) => async (dispatch) => {
  try {
    const {data} = await axios.put('/api/frames', {
      selections,
      ratings,
      order,
      page,
      perPage,
      searchTerm,
    })
    dispatch(getFrames(data))
  } catch (err) {
    console.error(err)
  }
}

export const newFrame = (info) => async (dispatch) => {
  try {
    if (info.coverImg.length > 0) {
      info = {
        ...info.frameInfo,
        coverImg: info.coverImg,
      }
    } else {
      info = info.frameInfo
    }
    const {data} = await axios.post('/api/frames/add', info)
    dispatch(addFrame(data))
  } catch (error) {
    console.error(error)
  }
}

export const removedFrame = (frameId) => async (dispatch) => {
  try {
    await axios.delete(`/api/frames/${frameId}`)
    dispatch(removeFrame(frameId))
  } catch (error) {
    console.error(error)
  }
}

// const defaultFrames = {
//   count: 0,
//   rows: [],
// }
const defaultFrames = [];

export default function (state = defaultFrames, action) {
  switch (action.type) {
    case GET_FRAMES:
      return action.frames
    // case ADD_frame:
    //   const added = state.count + 1
    //   return {count: added, rows: [...state.rows, action.frame]}
    // case REMOVE_frame:
    //   const filteredframe = state.rows.filter(
    //     (frame) => frame.id !== action.frameId
    //   )
    //   const removed = state.count - 1
    //   return {count: removed, rows: filteredframe}
    // case FILTERED_frameS:
    //   return {...action.frames}
    default:
      return state
  }
}
