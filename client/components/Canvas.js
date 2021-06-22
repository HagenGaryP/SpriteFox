import React, {useEffect, useState, useRef} from 'react';
import socket from '../socket.js';
import Slider from 'react-input-slider';
import { SketchPicker } from 'react-color';
import {
  animate,
  createGrid,
  getCanvas,
  getFrames,
} from '../utility';


let initialFrames = [];
let canvas, ctx;

const Canvas = (props) => {
  const [pixelSize, setPixelSize] = useState(8);
  const [pixelSelect, setPixelSelect] = useState(1);
  const [factor, setFactor] = useState(1);
  const [framesArray, setFramesArray] = useState([]);
  const [mappedGrid, setMappedGrid] = useState({});
  const [frameCounter, setFrameCounter] = useState(initialFrames.length);
  const [currentFrame, setCurrentFrame] = useState('1');
  const [fps, setFps] = useState(5);
  const [color, setColor] = useState('#000000');
  const [tool, setTool] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  const canvasRef = useRef();

  useEffect(() => {
    canvas = canvasRef.current;
    getFrames(framesArray, initialFrames);
    ctx = canvas.getContext('2d');

    createGrid(ctx, pixelSize, mappedGrid);

    const storage = initialFrames.map(elem => {
      return localStorage.getItem(elem)
    })

    localStorage.clear()
    storage.forEach((item, idx) => {
      localStorage.setItem(`${idx+1}`, item)
    })

    // socket.on('fill', (x, y, color, pixelSize, factor) => {
    //   fillPixel(x, y, color, pixelSize, factor);
    // });

    setFrameCounter(initialFrames.length);
    if (initialFrames.length === 0) {
      addBlankFrame();
    }
    setFramesArray(initialFrames)
  }, []);

  useEffect(() => {
    canvas = canvasRef.current;
    ctx = canvas.getContext('2d');
    setCurrentFrame(getCanvas(currentFrame, ctx));
  }, [color, mappedGrid, currentFrame, frameCounter, framesArray, pixelSize, factor]);

  function handleChangeComplete(color) {
    setColor(color.hex);
  }

  // --------- TOGGLE TOOL--------- //
  function toggleTool() {
    // toggles between draw and erase
    setTool(!tool);
  };

  // --------- TOGGLE INSTRUCTIONS--------- //
  function toggleInstructions() {
    // toggles between draw and erase
    setShowInstructions(!showInstructions);
  };

  // --------- DELETE FRAMES --------- // used on line 425
  function deleteFrame(canvasName) {
    console.log('canvas name = ', typeof canvasName);
    const filteredArray = framesArray.filter(
      (frame) => frame !== canvasName
    );
    localStorage.removeItem(canvasName);
    let idx = framesArray.indexOf(canvasName);
    setFramesArray(filteredArray);
    setCurrentFrame(`${framesArray.length-1}`)
    setFrameCounter(frameCounter-1)

    const storage = filteredArray.map(elem => {
      return localStorage.getItem(elem)
    })
    localStorage.clear()
    storage.forEach((item, idx) => {
      localStorage.setItem(`${idx+1}`, item)
    })

    setTimeout(() => {
      if (filteredArray.includes(`${idx}`)) getCanvas(`${idx}`, ctx);
      else getCanvas(filteredArray[0], ctx)
    }, 50);
  }


  // --------- CREATE A NEW FRAME --------- //
  function addBlankFrame() {
    ctx.clearRect(0, 0, 16 * 24, 16 * 24);
    createGrid(ctx, pixelSize, mappedGrid);
    if (framesArray.includes(`${frameCounter}`)) {
      localStorage.setItem(
        `${frameCounter+1}`,
        JSON.stringify(mappedGrid)
      );
      setFrameCounter(frameCounter+1);
      setCurrentFrame(`${framesArray.length+1}`)
    } else {
      localStorage.setItem(
        `${frameCounter+1}`,
        JSON.stringify(mappedGrid)
      );
      setFrameCounter(frameCounter+1);
      setCurrentFrame(`${framesArray.length+1}`)
    }
    setFramesArray([...framesArray, `${frameCounter+1}`]);
    setCurrentFrame(`${frameCounter+1}`)

    setTimeout(() => getCanvas(`${frameCounter+1}`, ctx), 50);
  }

  // --------- DUPLICATE CURRENT FRAME --------- //
  // saves canvas, adds it to array of canvases
  function addFrame() {
    let item = JSON.parse(localStorage.getItem(currentFrame))
    localStorage.setItem(
      `${frameCounter+1}`,
      JSON.stringify(item)
    );
    setFrameCounter(frameCounter+1);
    setFramesArray([...framesArray, `${frameCounter+1}`]);
    setMappedGrid(item);

    ctx.clearRect(0, 0, 16 * 24, 16 * 24);
    createGrid(ctx, pixelSize, mappedGrid);

    setCurrentFrame(`${frameCounter+1}`)
    setTimeout(() => getCanvas(frameCounter+1, ctx), 50);
  }

  // --------- NEW SESSION--------- //
  function newSession() {

    resetCanvas();
    localStorage.clear();

    setFrameCounter(1);
    setFramesArray(['1']);
    initialFrames = [];
    localStorage.setItem(`1`, JSON.stringify(mappedGrid));
    setCurrentFrame('1');
  }

  // --------- RESET CANVAS --------- //
  function resetCanvas() {
    ctx.clearRect(0, 0, 16 * 24, 16 * 24);
    createGrid(ctx, pixelSize, mappedGrid);
    localStorage.setItem(
      `${currentFrame}`,
      JSON.stringify(mappedGrid)
    );
  }

  // --------- DELETE PIXEL --------- //
  function deletePixel(defaultX, defaultY) {
    const canvas = canvas.current.getBoundingClientRect();
    // These are not the actual coordinates but correspond to the place on the grid
    let x =
      defaultX ??
      Math.floor((window.event.clientX - canvas.x) / pixelSize);
    let y =
      defaultY ??
      Math.floor((window.event.clientY - canvas.y) / pixelSize);
    if (defaultX === undefined && defaultY === undefined) {
      socket.emit('delete', x, y);
    }
    // MAP color to proper place on mappedGrid
    for (let i = 0; i < factor; i++) {
      for (let j = 0; j < factor; j++) {
        mappedGrid[y * factor + i][
          x * factor + j
        ] = null;
      }
    }
    // These are the actual coordinates to properly place the pixel
    let actualCoordinatesX = x * pixelSize;
    let actualCoordinatesY = y * pixelSize;
    ctx.clearRect(
      actualCoordinatesX,
      actualCoordinatesY,
      pixelSize,
      pixelSize
    );

    localStorage.setItem(
      `${currentFrame}`,
      JSON.stringify(mappedGrid)
    );
  }

  // --------- FILL PIXEL --------- //
  function fillPixel(
    defaultX,
    defaultY,
    // color = color,
    // pixelSize = pixelSize,
    // factor = factor
  ) {
    //need to add a color value to the parameters
    const canvasRect = canvas.getBoundingClientRect();

    // These are not the actual coordinates but correspond to the place on the grid
    let x =
      defaultX ?? Math.floor((window.event.clientX - canvasRect.x) / pixelSize);
    let y =
      defaultY ?? Math.floor((window.event.clientY - canvasRect.y) / pixelSize);

    // MAP color to proper place on mappedGrid
    for (let i = 0; i < factor; i++) {
      for (let j = 0; j < factor; j++) {
        mappedGrid[y * factor + i][x * factor + j] = color;
      }
    }
    if (defaultX === undefined && defaultY === undefined) {
      socket.emit('fill', x, y, color, pixelSize, factor);
    }

    // These are the actual coordinates to properly place the pixel
    let actualCoordinatesX = x * pixelSize;
    let actualCoordinatesY = y * pixelSize;

    ctx.fillStyle = color;

    ctx.fillRect(
      actualCoordinatesX,
      actualCoordinatesY,
      pixelSize,
      pixelSize
    );

    localStorage.setItem(
      `${currentFrame}`,
      JSON.stringify(mappedGrid)
    );
  }

  // --------- MOUSE DOWN FOR DRAG--------- //
  function handleMouseDown() {
    if (tool) {
      fillPixel();
    } else {
      deletePixel();
    }
  }

  // --------- CONTINUOUS DRAG PIXEL --------- //
  function dragPixel() {
    canvas.addEventListener(
      'mousemove',
      handleMouseDown,
      true
    );
    window.addEventListener('mouseup', (secondEvent) => {
      canvas.removeEventListener(
        'mousemove',
        handleMouseDown,
        true
      );
    });
  }

  // --------- SET PIXEL SIZE --------- //
  function pixelChange(event) {
    let factor;
    let pixels = parseInt(event.target.value);
    if (pixels === 24) {
      factor = 3;
    } else if (pixels === 16) {
      factor = 2;
    } else if (pixels === 8) {
      factor = 1;
    }
    // socket.emit('setPixelSize', pixels, factor);
    setPixelSize(pixels);
    setFactor(factor);
    setPixelSelect(factor);
  }

  return (
    <div>
      <nav className='nav container'>
        <button
          onClick={toggleInstructions}
          className='btn instruct-btn'
        >
          Instructions
        </button>
        <div
          className={`${
            showInstructions ? 'instructions show' : 'instructions'
          }`}
        >
          <h3>Welcome!</h3>
          INSTRUCTIONS GO HERE
          <button
            onClick={toggleInstructions}
            className='btn close-instruct-btn'
          >
            Close
          </button>
        </div>
      </nav>
      <div className='main-container container'>
        <div className='toolbox-container'>
          <div className=''>
            <div>
              <SketchPicker
                className='sketch'
                color={color}
                disableAlpha={true}
                onChangeComplete={handleChangeComplete}
              />
            </div>
          </div>
          {/* <ColorPicker currentColor={setColor} /> */}
          <div className='tools'>
            <button
              onClick={toggleTool}
              className={`btn ${
                setTool ? 'tool-btn tool-btn-active' : 'tool-btn'
              }`}
            >
              Draw
            </button>
            <button
              onClick={toggleTool}
              className={`btn ${
                setTool ? 'tool-btn' : 'tool-btn tool-btn-active'
              }`}
            >
              Erase
            </button>
          </div>

        </div>
        <div className='canvas-container'>
          <h3> FRAME {currentFrame} </h3>

          <div className='canvas'>
            <canvas
              className='real-canvas'
              width={16 * 24}
              height={16 * 24}
              ref={canvasRef}
              onClick={() => handleMouseDown()}
              onMouseDown={() => dragPixel()}
            />
            <img
              className='checkered-background'
              src='checkeredBackground.png'
              width={16 * 24}
              height={16 * 24}
            />
            <canvas width={16 * 24} height={16 * 24} />
          </div>

          <div className='frames-header'>
            <div className='frames-heading'>
              <h3>CHOOSE FRAME</h3>
              <button
                onClick={() => addBlankFrame()}
                className='btn add-btn'
              >
                +
              </button>
            </div>
            <hr />
          </div>

          <div className='frames-container'>
              <ul>
                {
                  Array.isArray(framesArray) &&
                  framesArray.map((frame, index) => {
                  return (
                    <li key={index} className='frame-item'>
                      <button
                        className='frame-name frame-btn'
                        onClick={() => setCurrentFrame(getCanvas(frame, ctx))}
                      >
                        Frame {frame}
                      </button>
                      <button
                        className='frame-btn frame-btn-delete'
                        onClick={() => deleteFrame(frame)}
                      >
                        DELETE
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

        </div>
        <div className='buttons-container'>

          <button onClick={resetCanvas} className='btn'>
            Reset Canvas
          </button>

          <button onClick={() => addFrame(currentFrame)} className='btn'>
            Duplicate Frame
          </button>

          <button onClick={() => animate(framesArray, getCanvas, fps, currentFrame)} className='btn animate-btn'>
            Animate!
          </button>

          <button onClick={newSession} className='btn session-btn'>
            New Session
          </button>

          <div className='slider-container'>
            <h3 className='slider-header'>{fps} FPS</h3>
            <div>
              <Slider
                xmax={10}
                xmin={1}
                axis='x'
                x={fps}
                onChange={({ x }) =>
                  setFps(x)
                }
                className='slider-bar'
              />
            </div>
          </div>
          <div className='pixel-buttons tools'>
            <button
              onClick={pixelChange}
              className={`btn ${
                pixelSelect === 1 ? 'pixel-btn pixel-btn-active' : 'pixel-btn'
              }`}
              value={8}
            >
              8px
            </button>
            <button
              onClick={pixelChange}
              className={`btn ${
                pixelSelect === 2 ? 'pixel-btn pixel-btn-active' : 'pixel-btn'
              }`}
              value={16}
            >
              16px
            </button>
            <button
              onClick={pixelChange}
              className={`btn ${
                pixelSelect === 3 ? 'pixel-btn pixel-btn-active' : 'pixel-btn'
              }`}
              value={24}
            >
              24px
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Canvas;
