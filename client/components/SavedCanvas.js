import React, { useState, useEffect } from 'react';

const SavedCanvas = (props) => {
  const [frame, setFrame] = useState('');
  console.log('this is the SavedCanvas components props >>>', props)

  return (
    <div>
      <h1> hiiiii </h1>
      {/* <ul>
        {props.framesArray.map((frame, index) => {
          return (
            <li key={index} className='frame-item'>
              <button
                className='frame-name frame-btn'
                onClick={() => props.getCanvas(frame)}
              >
                Frame {frame}
              </button>
              <button
                className='frame-btn frame-btn-delete'
                onClick={() => props.deleteFrame(frame)}
              >
                DELETE
              </button>
            </li>
          );
        })}
      </ul> */}
    </div>
  )
}

export default SavedCanvas;
