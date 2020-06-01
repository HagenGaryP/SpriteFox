import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

function LandingPage() {
  let chars = '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';

  let hash = '';
  for (let j = 0; j < 6; j++) {
    hash += chars[Math.floor(Math.random() * 62)];
  }

  return (
    <div className='container'>
      <div className='landing-container'>
        <div className='center-box'>
          <h1>SpriteFox</h1>
          <p>
            A real-time, collaborative editor
            <br />
            for creating animated sprites and pixel art
          </p>
          <Link className='btn landing-btn' to={`/${hash}`}>
            Create Sprite
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
