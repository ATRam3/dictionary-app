import React from 'react';
import logo from '../../assets/images/logo.svg';
import FontToggle from './FontToggle';
import ThemeToggle from './ThemeToggle';
import '../../styles/Navbar.css';

const Navbar = () => {
  return (
    <div className='navbar'>
      <div className='logo-cont'>
        <img src={logo} alt='' />
      </div>

      <div className='toggle'>
        <FontToggle />
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Navbar;
