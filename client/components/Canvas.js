import React, {useEffect, useState, useRef} from 'react';
import socket from '../socket.js';
import Slider from 'react-input-slider';
import ColorPicker from './ColorPicker';
import SavedCanvas from './SavedCanvas';
import { SketchPicker } from 'react-color';

let initialFrames = [];
let canvas, ctx;

const Canvas = (props) => {
  const [pixelSize, setPixelSize] = useState(24);
  const [pixelSelect, setPixelSelect] = useState(3);
  const [factor, setFactor] = useState(3);
  const [framesArray, setFramesArray] = useState([]);
  const [mappedGrid, setMappedGrid] = useState({});
  const [frameCounter, setFrameCounter] = useState(initialFrames.length+1);
  const [currentFrame, setCurrentFrame] = useState('1');
  const [fps, setFps] = useState(5);
  const [color, setColor] = useState('#000000');
  const [tool, setTool] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  const canvasRef = useRef();

  // const [canvas, setCanvas] = useState(canvasRef.current);
  // const [ctx, setCtx] = useState(canvas.getContext('2d'));


  // // componentDidMount() code here
  useEffect(() => {
    canvas = canvasRef.current;
    getFrames();
    ctx = canvas.getContext('2d');
    console.log('initial render, initialFrames >>>', initialFrames)
    createGrid();

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

    setFrameCounter(initialFrames.length)
    if (initialFrames.length === 0) {
      addBlankFrame();
    }

    setFramesArray(initialFrames)
    setCurrentFrame(`${frameCounter}`);
    getCanvas(currentFrame)
  }, []);

  useEffect(() => {
    canvas = canvasRef.current;
    ctx = canvas.getContext('2d');

  }, [color, mappedGrid, currentFrame, frameCounter, framesArray, pixelSize, factor]);

  function handleChangeComplete(color) {
    setColor(color.hex);
  }


  // --------- CREATE GRID --------- //
  function createGrid() {
    let y = 0;
    let rows = 48;
    for (let i = 0; i < rows; i++) {
      let x = 0;
      let array = [];
      for (let j = 0; j < rows; j++) {
        array.push(null);
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fillRect(x, y, pixelSize, pixelSize);
        x += pixelSize;
      }
      // Add each array to the mappedGrid
      mappedGrid[i] = array;
      y += pixelSize;
    }
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


  // --------- RENDER SAVED GRID --------- //

  function renderSaved(savedGrid) {
    let pixelSize = 8;
    ctx.clearRect(0, 0, 16 * 24, 16 * 24);
    for (let key in savedGrid) {
      // key = id = index of row array
      let pixelRow = savedGrid[key];
      for (let i = 0; i < pixelRow.length; i++) {
        if (pixelRow[i] !== null) {
          // These are the actual coordinates to render on the grid
          let coordinateX = i * pixelSize;
          let coordinateY = key * pixelSize;

          // Render each original pixel from the saved grid
          ctx.fillStyle = pixelRow[i];
          ctx.fillRect(coordinateX, coordinateY, pixelSize, pixelSize);
        }
      }
    }
  }

  // --------- GET FRAMES--------- //
  function getFrames() {
    for (let key in localStorage) {
      if (key !== 'currentColor'
        && typeof localStorage[key] === 'string'
        && !initialFrames.includes(key)
      ) {
        initialFrames.push(key);
      }
    }
    initialFrames = initialFrames.sort((a, b) => a - b)
    setFramesArray(framesArray.concat(initialFrames))
  }

  // --------- ANIMATE FRAMES --------- //
  function animate() {
    let len = framesArray.length;
    let interval = 0;
    for (let i = 0; i < len; i++) {
      setTimeout(() => {
        getCanvas(framesArray[i]);
      }, interval);

      interval = interval + 1000 / fps;
    }
  }

  // --------- DELETE FRAMES --------- //
  function deleteFrame(canvasName) {
    const filteredArray = framesArray.filter(
      (frame) => frame !== canvasName
    );
    localStorage.removeItem(canvasName);
    let idx = framesArray.indexOf(canvasName);
    setFramesArray(filteredArray);

    setCurrentFrame(`${framesArray.length}`)
    setFrameCounter(frameCounter-1)

    const storage = filteredArray.map(elem => {
      return localStorage.getItem(elem)
    })
    console.log('storage >>> ', storage)
    localStorage.clear()
    storage.forEach((item, idx) => {
      localStorage.setItem(`${idx+1}`, item)
    })

    setTimeout(() => {
      if (filteredArray.includes(`${idx}`)) getCanvas(`${idx}`);
      else getCanvas(filteredArray[0])
    }, 50);
  }


  // --------- CREATE A NEW FRAME --------- //
  function addBlankFrame() {
    ctx.clearRect(0, 0, 16 * 24, 16 * 24);
    createGrid();
    if (
      framesArray.includes(`${frameCounter}`) ||
      initialFrames.includes(`${frameCounter}`)
    ) {
      localStorage.setItem(
        `${initialFrames.length+1}`,
        JSON.stringify(mappedGrid)
      );
      setFrameCounter(frameCounter+1);
      setCurrentFrame(`${framesArray.length+1}`)
    }
    else {
      localStorage.setItem(
        `${frameCounter+1}`,
        JSON.stringify(mappedGrid)
      );
      setFrameCounter(frameCounter+1);
      setCurrentFrame(`${framesArray.length+1}`)
    }
    setFramesArray([...framesArray, `${frameCounter+1}`]);
    setCurrentFrame(`${frameCounter}`)

    setTimeout(() => getCanvas(`${frameCounter+1}`), 50);

  }

  // --------- DUPLICATE CURRENT FRAME --------- //
  // saves canvas, adds it to array of canvases
  function addFrame() {
    if (!framesArray.includes(`${frameCounter}`)) {
      localStorage.setItem(
        `${frameCounter}`,
        JSON.stringify(mappedGrid)
      );
      setFrameCounter(frameCounter+1);
      setFramesArray([...framesArray, `${frameCounter}`]);
    } else if (framesArray.includes(`${frameCounter}`)) {
      localStorage.setItem(
        `${frameCounter+1}`,
        JSON.stringify(mappedGrid)
      );
      setFrameCounter(frameCounter+1);
      setFramesArray([...framesArray, `${frameCounter+1}`]);
    }

    ctx.clearRect(0, 0, 16 * 24, 16 * 24);
    createGrid();

    setCurrentFrame(`${frameCounter}`)
    setTimeout(() => getCanvas(`${framesArray.length+1}`), 50);
  }

  // --------- NEW SESSION--------- //
  function newSession() {

    resetCanvas();
    localStorage.clear();

    setFrameCounter(1);
    setFramesArray([]);

    setTimeout(() => {
      if (framesArray) {
        localStorage.setItem(
          `${frameCounter}`,
          JSON.stringify(mappedGrid)
        );
      }

      setFramesArray([]);
      setCurrentFrame('1');
      setFrameCounter(1);

    }, 1000);
  }

  // --------- GET CANVAS--------- //
  function getCanvas(frameNumber) {
    ctx.clearRect(0, 0, 16 * 24, 16 * 24);
    let item = JSON.parse(localStorage.getItem(frameNumber));
    renderSaved(item); // item is obj of arrays
    setCurrentFrame(`${frameNumber}`);
    setMappedGrid(item);
  }

  // --------- RESET CANVAS --------- //
  function resetCanvas() {
    ctx.clearRect(0, 0, 16 * 24, 16 * 24);
    createGrid();
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
          <h3>FRAME {currentFrame}</h3>

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
                        onClick={() => getCanvas(frame)}
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

          <button onClick={() => animate()} className='btn animate-btn'>
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
