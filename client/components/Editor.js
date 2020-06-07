import React, { useState, useEffect } from 'react';
import io from '../socket'
// import ColorPicker, { currentColor } from './ColorPicker';

import { SketchPicker } from 'react-color';

const Editor = (props) => {
  const [currentColor, setColor] = useState('#000000');

  function handleChangeComplete(color) {
    setColor(color.hex);
  }

  useEffect(() => {
    console.log('>>>> currentColor >>>>', currentColor)
    setColor(currentColor);
  }, [currentColor]);

  return (
    <div className='toolbox-container'>
      <div className='palette'>
        <SketchPicker
          className='sketch'
          color={currentColor}
          disableAlpha={true}
          onChangeComplete={handleChangeComplete}
        />
      </div>
    </div>
  );
};


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


export default Editor;
