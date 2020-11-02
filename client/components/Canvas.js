import React, {useEffect, useState, useRef} from 'react';
import socket from '../socket.js';
import Slider from 'react-input-slider';
import { SketchPicker } from 'react-color';
import {
  animate,
  createGrid,
  renderSaved,
} from '../utility';


let initialFrames = [];
let initialColors = [];
let canvas, ctx;

const Canvas = (props) => {
  const [pixelSize, setPixelSize] = useState(8);
  const [pixelSelect, setPixelSelect] = useState(1);
  const [factor, setFactor] = useState(1);
  const [framesArray, setFramesArray] = useState([]);
  const [mappedGrid, setMappedGrid] = useState({});
  const [frameCounter, setFrameCounter] = useState(initialFrames.length+1);
  const [currentFrame, setCurrentFrame] = useState('1');
  const [fps, setFps] = useState(5);
  const [color, setColor] = useState('#000000');
  const [tool, setTool] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [colorsUsed, setColorsUsed] = useState([]);

  const canvasRef = useRef();

  useEffect(() => {
    canvas = canvasRef.current;
    getFrames();
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

    setColorsUsed(initialColors);
    setFramesArray(initialFrames)
    setCurrentFrame(`${frameCounter}`);
    getCanvas(currentFrame);
    console.log('colorsUsed', colorsUsed);
  }, []);

  useEffect(() => {
    canvas = canvasRef.current;
    ctx = canvas.getContext('2d');
  }, [color, mappedGrid, currentFrame, frameCounter, framesArray, pixelSize, factor, colorsUsed]);

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
    if (initialFrames[0]) {
      let frameObj = JSON.parse(localStorage.getItem(initialFrames[0]))
      console.log('frame = ', frameObj)
      for (let row in frameObj) {
        // console.log('frameObj row =  ', Array.isArray(frameObj[row]));
          for (let i = 0; i < 48; i++) {
            let elem = frameObj[row][i];
            if (!initialColors.includes(elem) && elem) {
              console.log('color = ', elem);
              initialColors.push(elem);
            }
          }
          // initialColors = row.filter(c => (!colorsUsed.includes(c) && c))

          // val = JSON.parse(val);
          // for (let elem in val) {
          //   initialColors = elem.filter(c => (!colorsUsed.includes(c) && c))
          //   console.log('elem = ', elem);
          // }
        }
    }
    setColorsUsed(initialColors);

    console.log('initialColors >>>> ', initialColors)
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
    createGrid(ctx, pixelSize, mappedGrid);

    setCurrentFrame(`${frameCounter}`)
    setTimeout(() => getCanvas(`${framesArray.length+1}`), 50);
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

  // --------- GET CANVAS--------- //
  function getCanvas(frameNumber) {
    ctx.clearRect(0, 0, 16 * 24, 16 * 24);
    let item = JSON.parse(localStorage.getItem(frameNumber));
    renderSaved(item, ctx); // item is obj of arrays
    setCurrentFrame(`${frameNumber}`);
    setMappedGrid(item);
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
    setColorsUsed([...colorsUsed, color]);
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
    setColorsUsed([...colorsUsed, color]);
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
          <div>
            COLORS USED
            {
              initialColors.length > 0 && !colorsUsed.length > 0 ?
              initialColors.map((colorString, index) => {
                <li key={index}>
                  <button
                    onClick={() => setColor(colorString)}
                  >
                    {colorString, index}
                  </button>
                </li>
              }) :
              Array.isArray(colorsUsed) &&
              colorsUsed.map((colorString, index) => {
                <li key={index}>
                  <button
                    onClick={() => setColor(colorString)}
                  >
                    {colorString}
                  </button>
                </li>
              })
            }
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


/**
 * OLD MASTER BRANCH - CLASS COMPONENT
 */


// import React from 'react';
// import socket from '../socket.js';
// import Slider from 'react-input-slider';
// import ColorPicker from './ColorPicker';
// import Instructions from './Instructions';
// import { createGrid } from '../utility/createGrid';
// import { renderSaved } from '../utility/renderSaved';
// import { animate } from '../utility/animate';

// class Canvas extends React.Component {
//   constructor(props) {
//     super(props);
//     this.canvas = React.createRef();
//     this.getCanvas = this.getCanvas.bind(this);
//     this.addFrame = this.addFrame.bind(this);
//     this.handleChange = this.handleChange.bind(this);
//     this.fillPixel = this.fillPixel.bind(this);
//     this.getFrames = this.getFrames.bind(this);
//     this.resetCanvas = this.resetCanvas.bind(this);
//     this.newSession = this.newSession.bind(this);
//     this.setPixelSize = this.setPixelSize.bind(this);
//     this.setColor = this.setColor.bind(this);
//     this.dragPixel = this.dragPixel.bind(this);
//     this.handleMouseDown = this.handleMouseDown.bind(this);

//     this.state = {
//       pixelSize: 24,
//       pixelSelect: 3,
//       factor: 3,
//       framesArray: [],
//       mappedGrid: {},
//       frameCounter: 1,
//       currentFrame: '',
//       fps: 5,
//       color: '',
//       setTool: true,
//       showInstructions: false,
//     };
//   }

//   componentDidMount() {
//     this.getFrames();
//     this.ctx = this.canvas.current.getContext('2d');
//     createGrid(this.ctx, this.state.pixelSize, this.state.mappedGrid);
//     socket.on('fill', (x, y, color, pixelSize, factor) => {
//       this.fillPixel(x, y, color, pixelSize, factor);
//     });

//     this.addFrame();
//     this.setState({
//       currentFrame: '1',
//     });
//   }

//   // --------- HANDLE CHANGE --------- //
//   handleChange(event) {
//     event.preventDefault();
//     this.setState({
//       [event.target.name]: event.target.value,
//       currentFrame: event.target.value,
//     });
//   }

//   // --------- SET COLOR--------- //
//   setColor(currentColor) {
//     this.setState({
//       color: currentColor,
//     });
//   }

//   // --------- TOGGLE TOOL--------- //
//   toggleTool = () => {
//     // toggles between draw and erase
//     this.setState((prevState) => ({ setTool: !prevState.setTool }));
//   };

//   // --------- TOGGLE INSTRUCTIONS--------- //
//   toggleInstructions = () => {
//     // toggles between draw and erase
//     this.setState((prevState) => ({
//       showInstructions: !prevState.showInstructions,
//     }));
//   };

//   // --------- GET FRAMES--------- //
//   getFrames() {
//     for (let key in localStorage) {
//       if (key !== 'currentColor' && typeof localStorage[key] === 'string') {
//         this.setState({
//           framesArray: [...this.state.framesArray, key],
//         });
//       }
//     }
//   }

//   // --------- DELETE FRAMES --------- //
//   deleteFrame(canvasName) {
//     const filteredArray = this.state.framesArray.filter(
//       (frame) => frame !== canvasName
//     );
//     localStorage.removeItem(canvasName);
//     this.setState({
//       framesArray: filteredArray,
//     });
//   }


//   // --------- CREATE A NEW FRAME --------- //
//   addBlankFrame() {
//     this.ctx.clearRect(0, 0, 16 * 24, 16 * 24);
//     createGrid(this.ctx, this.state.pixelSize, this.state.mappedGrid);

//     if (this.state.framesArray) {
//       localStorage.setItem(
//         `${this.state.frameCounter}`,
//         JSON.stringify(this.state.mappedGrid)
//       );
//     }
//     this.setState({
//       frameCounter: this.state.frameCounter + 1,
//     });
//     this.setState({
//       framesArray: [...this.state.framesArray, this.state.frameCounter],
//       currentFrame: this.state.frameCounter,
//     });
//   }

//   // --------- DUPLICATE CURRENT FRAME --------- //
//   // saves canvas, adds it to array of canvases
//   addFrame() {

//     if (this.state.framesArray) {
//       localStorage.setItem(
//         `${this.state.frameCounter}`,
//         JSON.stringify(this.state.mappedGrid)
//       );
//     }
//     this.setState({
//       frameCounter: this.state.frameCounter + 1,
//     });

//     this.ctx.clearRect(0, 0, 16 * 24, 16 * 24);
//     createGrid(this.ctx, this.state.pixelSize, this.state.mappedGrid);
//     this.setState({
//       framesArray: [...this.state.framesArray, this.state.frameCounter],
//       currentFrame: this.state.frameCounter,
//     });
//     setTimeout(() => this.getCanvas(this.state.currentFrame), 500);
//   }

//   // --------- NEW SESSION--------- //
//   newSession() {
//     // Clears Storage, clears display of frames underneath grid, resets canvas
//     this.resetCanvas();
//     localStorage.clear();
//     this.setState({
//       frameCounter: 1,
//       framesArray: [],
//     });

//     setTimeout(() => {
//       if (this.state.framesArray) {
//         localStorage.setItem(
//           `${this.state.frameCounter}`,
//           JSON.stringify(this.state.mappedGrid)
//         );
//       }
//       this.setState({
//         framesArray: [...this.state.framesArray, this.state.frameCounter],
//         currentFrame: '1',
//         frameCounter: this.state.frameCounter + 1,
//       });
//     }, 1000);
//   }

//   // --------- GET CANVAS--------- //
//   getCanvas(frameNumber) {
//     this.ctx.clearRect(0, 0, 16 * 24, 16 * 24);
//     let item = JSON.parse(localStorage.getItem(frameNumber));
//     renderSaved(item, this.ctx); // item is obj of arrays
//     this.setState({
//       currentFrame: frameNumber,
//       mappedGrid: item,
//     });
//   }

//   // --------- RESET CANVAS --------- //
//   resetCanvas() {
//     this.ctx.clearRect(0, 0, 16 * 24, 16 * 24);
//     createGrid(this.ctx, this.state.pixelSize, this.state.mappedGrid);
//     localStorage.setItem(
//       `${this.state.currentFrame}`,
//       JSON.stringify(this.state.mappedGrid)
//     );
//   }

//   // --------- DELETE PIXEL --------- //
//   deletePixel(defaultX, defaultY) {
//     const canvas = this.canvas.current.getBoundingClientRect();
//     // These are not the actual coordinates but correspond to the place on the grid
//     let x =
//       defaultX ??
//       Math.floor((window.event.clientX - canvas.x) / this.state.pixelSize);
//     let y =
//       defaultY ??
//       Math.floor((window.event.clientY - canvas.y) / this.state.pixelSize);
//     if (defaultX === undefined && defaultY === undefined) {
//       socket.emit('delete', x, y);
//     }
//     // MAP color to proper place on mappedGrid
//     for (let i = 0; i < this.state.factor; i++) {
//       for (let j = 0; j < this.state.factor; j++) {
//         this.state.mappedGrid[y * this.state.factor + i][
//           x * this.state.factor + j
//         ] = null;
//       }
//     }
//     // These are the actual coordinates to properly place the pixel
//     let actualCoordinatesX = x * this.state.pixelSize;
//     let actualCoordinatesY = y * this.state.pixelSize;
//     this.ctx.clearRect(
//       actualCoordinatesX,
//       actualCoordinatesY,
//       this.state.pixelSize,
//       this.state.pixelSize
//     );

//     localStorage.setItem(
//       `${this.state.currentFrame}`,
//       JSON.stringify(this.state.mappedGrid)
//     );
//   }

//   // --------- FILL PIXEL --------- //
//   fillPixel(
//     defaultX,
//     defaultY,
//     color = this.state.color,
//     pixelSize = this.state.pixelSize,
//     factor = this.state.factor
//   ) {
//     //need to add a color value to the parameters
//     const canvas = this.canvas.current.getBoundingClientRect();

//     // These are not the actual coordinates but correspond to the place on the grid
//     let x =
//       defaultX ?? Math.floor((window.event.clientX - canvas.x) / pixelSize);
//     let y =
//       defaultY ?? Math.floor((window.event.clientY - canvas.y) / pixelSize);

//     // MAP color to proper place on mappedGrid
//     for (let i = 0; i < factor; i++) {
//       for (let j = 0; j < factor; j++) {
//         this.state.mappedGrid[y * factor + i][x * factor + j] = color;
//       }
//     }
//     if (defaultX === undefined && defaultY === undefined) {
//       socket.emit('fill', x, y, color, pixelSize, factor);
//     }

//     // These are the actual coordinates to properly place the pixel
//     let actualCoordinatesX = x * pixelSize;
//     let actualCoordinatesY = y * pixelSize;

//     this.ctx.fillStyle = color;

//     this.ctx.fillRect(
//       actualCoordinatesX,
//       actualCoordinatesY,
//       pixelSize,
//       pixelSize
//     );

//     localStorage.setItem(
//       `${this.state.currentFrame}`,
//       JSON.stringify(this.state.mappedGrid)
//     );
//   }

//   // --------- MOUSE DOWN FOR DRAG--------- //
//   handleMouseDown() {
//     if (this.state.setTool) {
//       this.fillPixel();
//     } else {
//       this.deletePixel();
//     }
//   }

//   // --------- CONTINUOUS DRAG PIXEL --------- //
//   dragPixel() {
//     this.canvas.current.addEventListener(
//       'mousemove',
//       this.handleMouseDown,
//       true
//     );
//     window.addEventListener('mouseup', (secondEvent) => {
//       this.canvas.current.removeEventListener(
//         'mousemove',
//         this.handleMouseDown,
//         true
//       );
//     });
//   }

//   // --------- SET PIXEL SIZE --------- //
//   setPixelSize(event) {
//     let factor;
//     let pixels = parseInt(event.target.value);
//     if (pixels === 24) {
//       factor = 3;
//     } else if (pixels === 16) {
//       factor = 2;
//     } else if (pixels === 8) {
//       factor = 1;
//     }
//     socket.emit('setPixelSize', pixels, factor);
//     this.setState({
//       pixelSize: pixels,
//       factor: factor,
//       pixelSelect: factor,
//     });
//   }

//   render() {

//     const {
//       setTool,
//       currentFrame,
//       pixelSize,
//       fps,
//       pixelSelect,
//       showInstructions,
//     } = this.state;

//     socket.emit('joinroom', this.props.match.params.hash)




//     return (
//       <div>
//         <Instructions
//           toggleInstructions={this.toggleInstructions}
//           showInstructions={showInstructions}
//         />
//         <div className='main-container container'>
//           <div className='toolbox-container'>
//             <ColorPicker currentColor={this.setColor} />
//             <div className='tools'>
//               <button
//                 onClick={this.toggleTool}
//                 className={`btn ${
//                   setTool ? 'tool-btn tool-btn-active' : 'tool-btn'
//                 }`}
//               >
//                 Draw
//               </button>
//               <button
//                 onClick={this.toggleTool}
//                 className={`btn ${
//                   setTool ? 'tool-btn' : 'tool-btn tool-btn-active'
//                 }`}
//               >
//                 Erase
//               </button>
//             </div>
//           </div>
//           <div className='canvas-container'>
//             <h3>FRAME {currentFrame}</h3>

//             <div className='canvas'>
//               <canvas
//                 className='real-canvas'
//                 width={16 * 24}
//                 height={16 * 24}
//                 ref={this.canvas}
//                 onClick={() => this.handleMouseDown()}
//                 onMouseDown={() => this.dragPixel()}
//               />
//               <img
//                 className='checkered-background'
//                 src='checkeredBackground.png'
//                 width={16 * 24}
//                 height={16 * 24}
//               />
//               <canvas width={16 * 24} height={16 * 24} />
//             </div>

//             <div className='frames-header'>
//               <div className='frames-heading'>
//                 <h3>CHOOSE FRAME</h3>
//                 <button
//                   onClick={() => this.addBlankFrame()}
//                   className='btn add-btn'
//                 >
//                   +
//                 </button>
//               </div>
//               <hr />
//             </div>
//             <div className='frames-container'>
//               <ul>
//                 {this.state.framesArray.map((frame, index) => {
//                   return (
//                     <li key={index} className='frame-item'>
//                       <button
//                         className='frame-name frame-btn'
//                         onClick={() => this.getCanvas(frame)}
//                       >
//                         Frame {frame}
//                       </button>
//                       <button
//                         className='frame-btn frame-btn-delete'
//                         onClick={() => this.deleteFrame(frame)}
//                       >
//                         DELETE
//                       </button>
//                     </li>
//                   );
//                 })}
//               </ul>
//             </div>
//           </div>
//           <div className='buttons-container'>

//             <button onClick={this.resetCanvas} className='btn'>
//               Reset Canvas
//             </button>

//             <button onClick={() => this.addFrame(currentFrame)} className='btn'>
//               Duplicate Frame
//             </button>

//             <button onClick={() => animate(this.state.framesArray, this.getCanvas, this.state.fps)} className='btn animate-btn'>
//               Animate!
//             </button>

//             <button onClick={this.newSession} className='btn session-btn'>
//               New Session
//             </button>

//             <div className='slider-container'>
//               <h3 className='slider-header'>{fps} FPS</h3>
//               <div>
//                 <Slider
//                   xmax={10}
//                   xmin={1}
//                   axis='x'
//                   x={fps}
//                   onChange={({ x }) =>
//                     this.setState({
//                       fps: x,
//                     })
//                   }
//                   className='slider-bar'
//                 />
//               </div>
//             </div>
//             <div className='pixel-buttons tools'>
//               <button
//                 onClick={this.setPixelSize}
//                 className={`btn ${
//                   pixelSelect === 1 ? 'pixel-btn pixel-btn-active' : 'pixel-btn'
//                 }`}
//                 value={8}
//               >
//                 8px
//               </button>
//               <button
//                 onClick={this.setPixelSize}
//                 className={`btn ${
//                   pixelSelect === 2 ? 'pixel-btn pixel-btn-active' : 'pixel-btn'
//                 }`}
//                 value={16}
//               >
//                 16px
//               </button>
//               <button
//                 onClick={this.setPixelSize}
//                 className={`btn ${
//                   pixelSelect === 3 ? 'pixel-btn pixel-btn-active' : 'pixel-btn'
//                 }`}
//                 value={24}
//               >
//                 24px
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }
// }

// export default Canvas;
