import React, { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';

const ColorPicker = (props) => {
  const initialState = '#000000';
  const [currentColor, setColor] = useState(initialState);
  const [editMode, setMode] = useState(true);

  function handleChangeComplete(color) {
    setColor(color.hex);
  }

  useEffect(() => {
    props.currentColor(currentColor);
  }, [currentColor]);

  return (
    <div className=''>
      <div>
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

export default ColorPicker;
