import React from 'react';
import socket from '../socket.js';
import Slider from 'react-input-slider';
import ColorPicker from './ColorPicker';
import Instructions from './Instructions';
import { createGrid } from '../utility/createGrid';
import { renderSaved } from '../utility/renderSaved';
import { animate } from '../utility/animate';

class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.getCanvas = this.getCanvas.bind(this);
    this.addFrame = this.addFrame.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.fillPixel = this.fillPixel.bind(this);
    this.getFrames = this.getFrames.bind(this);
    this.resetCanvas = this.resetCanvas.bind(this);
    this.newSession = this.newSession.bind(this);
    this.setPixelSize = this.setPixelSize.bind(this);
    this.setColor = this.setColor.bind(this);
    this.dragPixel = this.dragPixel.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);

    this.state = {
      pixelSize: 24,
      pixelSelect: 3,
      factor: 3,
      framesArray: [],
      mappedGrid: {},
      frameCounter: 1,
      currentFrame: '',
      fps: 5,
      color: '',
      setTool: true,
      showInstructions: false,
    };
  }

  componentDidMount() {
    this.getFrames();
    this.ctx = this.canvas.current.getContext('2d');
    createGrid(this.ctx, this.state.pixelSize, this.state.mappedGrid);
    socket.on('fill', (x, y, color, pixelSize, factor) => {
      this.fillPixel(x, y, color, pixelSize, factor);
    });

    this.addFrame();
    this.setState({
      currentFrame: '1',
    });
  }

  // --------- HANDLE CHANGE --------- //
  handleChange(event) {
    event.preventDefault();
    this.setState({
      [event.target.name]: event.target.value,
      currentFrame: event.target.value,
    });
  }

  // --------- SET COLOR--------- //
  setColor(currentColor) {
    this.setState({
      color: currentColor,
    });
  }

  // --------- TOGGLE TOOL--------- //
  toggleTool = () => {
    // toggles between draw and erase
    this.setState((prevState) => ({ setTool: !prevState.setTool }));
  };

  // --------- TOGGLE INSTRUCTIONS--------- //
  toggleInstructions = () => {
    // toggles between draw and erase
    this.setState((prevState) => ({
      showInstructions: !prevState.showInstructions,
    }));
  };

  // --------- GET FRAMES--------- //
  getFrames() {
    for (let key in localStorage) {
      if (key !== 'currentColor' && typeof localStorage[key] === 'string') {
        this.setState({
          framesArray: [...this.state.framesArray, key],
        });
      }
    }
  }

  // --------- DELETE FRAMES --------- //
  deleteFrame(canvasName) {
    const filteredArray = this.state.framesArray.filter(
      (frame) => frame !== canvasName
    );
    localStorage.removeItem(canvasName);
    this.setState({
      framesArray: filteredArray,
    });
  }


  // --------- CREATE A NEW FRAME --------- //
  addBlankFrame() {
    this.ctx.clearRect(0, 0, 16 * 24, 16 * 24);
    createGrid(this.ctx, this.state.pixelSize, this.state.mappedGrid);

    if (this.state.framesArray) {
      localStorage.setItem(
        `${this.state.frameCounter}`,
        JSON.stringify(this.state.mappedGrid)
      );
    }
    this.setState({
      frameCounter: this.state.frameCounter + 1,
    });
    this.setState({
      framesArray: [...this.state.framesArray, this.state.frameCounter],
      currentFrame: this.state.frameCounter,
    });
  }

  // --------- DUPLICATE CURRENT FRAME --------- //
  // saves canvas, adds it to array of canvases
  addFrame() {

    if (this.state.framesArray) {
      localStorage.setItem(
        `${this.state.frameCounter}`,
        JSON.stringify(this.state.mappedGrid)
      );
    }
    this.setState({
      frameCounter: this.state.frameCounter + 1,
    });

    this.ctx.clearRect(0, 0, 16 * 24, 16 * 24);
    createGrid(this.ctx, this.state.pixelSize, this.state.mappedGrid);
    this.setState({
      framesArray: [...this.state.framesArray, this.state.frameCounter],
      currentFrame: this.state.frameCounter,
    });
    setTimeout(() => this.getCanvas(this.state.currentFrame), 500);
  }

  // --------- NEW SESSION--------- //
  newSession() {
    // Clears Storage, clears display of frames underneath grid, resets canvas
    this.resetCanvas();
    localStorage.clear();
    this.setState({
      frameCounter: 1,
      framesArray: [],
    });

    setTimeout(() => {
      if (this.state.framesArray) {
        localStorage.setItem(
          `${this.state.frameCounter}`,
          JSON.stringify(this.state.mappedGrid)
        );
      }
      this.setState({
        framesArray: [...this.state.framesArray, this.state.frameCounter],
        currentFrame: '1',
        frameCounter: this.state.frameCounter + 1,
      });
    }, 1000);
  }

  // --------- GET CANVAS--------- //
  getCanvas(frameNumber) {
    this.ctx.clearRect(0, 0, 16 * 24, 16 * 24);
    let item = JSON.parse(localStorage.getItem(frameNumber));
    renderSaved(item, this.ctx); // item is obj of arrays
    this.setState({
      currentFrame: frameNumber,
      mappedGrid: item,
    });
  }

  // --------- RESET CANVAS --------- //
  resetCanvas() {
    this.ctx.clearRect(0, 0, 16 * 24, 16 * 24);
    createGrid(this.ctx, this.state.pixelSize, this.state.mappedGrid);
    localStorage.setItem(
      `${this.state.currentFrame}`,
      JSON.stringify(this.state.mappedGrid)
    );
  }

  // --------- DELETE PIXEL --------- //
  deletePixel(defaultX, defaultY) {
    const canvas = this.canvas.current.getBoundingClientRect();
    // These are not the actual coordinates but correspond to the place on the grid
    let x =
      defaultX ??
      Math.floor((window.event.clientX - canvas.x) / this.state.pixelSize);
    let y =
      defaultY ??
      Math.floor((window.event.clientY - canvas.y) / this.state.pixelSize);
    if (defaultX === undefined && defaultY === undefined) {
      socket.emit('delete', x, y);
    }
    // MAP color to proper place on mappedGrid
    for (let i = 0; i < this.state.factor; i++) {
      for (let j = 0; j < this.state.factor; j++) {
        this.state.mappedGrid[y * this.state.factor + i][
          x * this.state.factor + j
        ] = null;
      }
    }
    // These are the actual coordinates to properly place the pixel
    let actualCoordinatesX = x * this.state.pixelSize;
    let actualCoordinatesY = y * this.state.pixelSize;
    this.ctx.clearRect(
      actualCoordinatesX,
      actualCoordinatesY,
      this.state.pixelSize,
      this.state.pixelSize
    );

    localStorage.setItem(
      `${this.state.currentFrame}`,
      JSON.stringify(this.state.mappedGrid)
    );
  }

  // --------- FILL PIXEL --------- //
  fillPixel(
    defaultX,
    defaultY,
    color = this.state.color,
    pixelSize = this.state.pixelSize,
    factor = this.state.factor
  ) {
    //need to add a color value to the parameters
    const canvas = this.canvas.current.getBoundingClientRect();

    // These are not the actual coordinates but correspond to the place on the grid
    let x =
      defaultX ?? Math.floor((window.event.clientX - canvas.x) / pixelSize);
    let y =
      defaultY ?? Math.floor((window.event.clientY - canvas.y) / pixelSize);

    // MAP color to proper place on mappedGrid
    for (let i = 0; i < factor; i++) {
      for (let j = 0; j < factor; j++) {
        this.state.mappedGrid[y * factor + i][x * factor + j] = color;
      }
    }
    if (defaultX === undefined && defaultY === undefined) {
      socket.emit('fill', x, y, color, pixelSize, factor);
    }

    // These are the actual coordinates to properly place the pixel
    let actualCoordinatesX = x * pixelSize;
    let actualCoordinatesY = y * pixelSize;

    this.ctx.fillStyle = color;

    this.ctx.fillRect(
      actualCoordinatesX,
      actualCoordinatesY,
      pixelSize,
      pixelSize
    );

    localStorage.setItem(
      `${this.state.currentFrame}`,
      JSON.stringify(this.state.mappedGrid)
    );
  }

  // --------- MOUSE DOWN FOR DRAG--------- //
  handleMouseDown() {
    if (this.state.setTool) {
      this.fillPixel();
    } else {
      this.deletePixel();
    }
  }

  // --------- CONTINUOUS DRAG PIXEL --------- //
  dragPixel() {
    this.canvas.current.addEventListener(
      'mousemove',
      this.handleMouseDown,
      true
    );
    window.addEventListener('mouseup', (secondEvent) => {
      this.canvas.current.removeEventListener(
        'mousemove',
        this.handleMouseDown,
        true
      );
    });
  }

  // --------- SET PIXEL SIZE --------- //
  setPixelSize(event) {
    let factor;
    let pixels = parseInt(event.target.value);
    if (pixels === 24) {
      factor = 3;
    } else if (pixels === 16) {
      factor = 2;
    } else if (pixels === 8) {
      factor = 1;
    }
    socket.emit('setPixelSize', pixels, factor);
    this.setState({
      pixelSize: pixels,
      factor: factor,
      pixelSelect: factor,
    });
  }

  render() {

    const {
      setTool,
      currentFrame,
      pixelSize,
      fps,
      pixelSelect,
      showInstructions,
    } = this.state;

    socket.emit('joinroom', this.props.match.params.hash)




    return (
      <div>
        <Instructions
          toggleInstructions={this.toggleInstructions}
          showInstructions={showInstructions}
        />
        <div className='main-container container'>
          <div className='toolbox-container'>
            <ColorPicker currentColor={this.setColor} />
            <div className='tools'>
              <button
                onClick={this.toggleTool}
                className={`btn ${
                  setTool ? 'tool-btn tool-btn-active' : 'tool-btn'
                }`}
              >
                Draw
              </button>
              <button
                onClick={this.toggleTool}
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
                ref={this.canvas}
                onClick={() => this.handleMouseDown()}
                onMouseDown={() => this.dragPixel()}
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
                  onClick={() => this.addBlankFrame()}
                  className='btn add-btn'
                >
                  +
                </button>
              </div>
              <hr />
            </div>
            <div className='frames-container'>
              <ul>
                {this.state.framesArray.map((frame, index) => {
                  return (
                    <li key={index} className='frame-item'>
                      <button
                        className='frame-name frame-btn'
                        onClick={() => this.getCanvas(frame)}
                      >
                        Frame {frame}
                      </button>
                      <button
                        className='frame-btn frame-btn-delete'
                        onClick={() => this.deleteFrame(frame)}
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

            <button onClick={this.resetCanvas} className='btn'>
              Reset Canvas
            </button>

            <button onClick={() => this.addFrame(currentFrame)} className='btn'>
              Duplicate Frame
            </button>

            <button onClick={() => animate(this.state.framesArray, this.getCanvas, this.state.fps)} className='btn animate-btn'>
              Animate!
            </button>

            <button onClick={this.newSession} className='btn session-btn'>
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
                    this.setState({
                      fps: x,
                    })
                  }
                  className='slider-bar'
                />
              </div>
            </div>
            <div className='pixel-buttons tools'>
              <button
                onClick={this.setPixelSize}
                className={`btn ${
                  pixelSelect === 1 ? 'pixel-btn pixel-btn-active' : 'pixel-btn'
                }`}
                value={8}
              >
                8px
              </button>
              <button
                onClick={this.setPixelSize}
                className={`btn ${
                  pixelSelect === 2 ? 'pixel-btn pixel-btn-active' : 'pixel-btn'
                }`}
                value={16}
              >
                16px
              </button>
              <button
                onClick={this.setPixelSize}
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
}

export default Canvas;
