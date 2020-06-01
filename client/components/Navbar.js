import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ handleClick, isLoggedIn }) => (
  <div className='container'>
    <nav className='navbar'>
      <div className='logo'>
        <h1>SpriteFox</h1>
      </div>

      <ul>
        <li>About</li>
      </ul>
    </nav>
  </div>
);

export default Navbar;
