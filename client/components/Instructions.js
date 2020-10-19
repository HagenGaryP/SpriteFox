import React from 'react';

const Instructions = (props) => {
  return (
    <div>
      <nav className='nav container'>
        <button
          onClick={props.toggleInstructions}
          className='btn instruct-btn'
        >
          Instructions
        </button>
        <div
          className={`${
            props.showInstructions ? 'instructions show' : 'instructions'
          }`}
        >
          <h3>Welcome!</h3>
          <p>
            - If you'd like to have a friend draw with you, simply send them
            the url and they'll join your room automatically.
          </p>
          <p>- Click or hold down your mouse to draw.</p>
          <p>
            - Frames will autosave, so don't worry about losing your work!
          </p>
          <p>
            - The 'Duplicate Frame' button will make a new frame with the same
            art that is on the current one.
          </p>
          <p>
            - If you'd like a brand new canvas, press the '+' button on the
            Frames List below the canvas.
          </p>
          <button
            onClick={props.toggleInstructions}
            className='btn close-instruct-btn'
          >
            Close
          </button>
        </div>
      </nav>
    </div>
  )
}

export default Instructions;
