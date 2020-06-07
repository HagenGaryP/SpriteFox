import React, { useState, useEffect } from 'react';
import { SketchPicker } from 'react-color';

const ColorPicker = (props) => {
  const [currentColor, setColor] = useState('#000000');
  const [editMode, setMode] = useState(true);

  function handleChangeComplete(color) {
    setColor(color.hex);
  }

  useEffect(() => {
    // console.log('>>>> currentColor >>>>', currentColor)
    setColor(currentColor);
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
