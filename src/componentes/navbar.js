import React from 'react';
import { Navbar as BSNavbar, Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <BSNavbar expand="lg">
      <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
      <BSNavbar.Collapse id="basic-navbar-nav">
        <Nav className="mx-auto">
          <NavLink to="/" className="nav-link">
            Inicio
          </NavLink>
          <NavLink to="/squares-middle" className="nav-link">
            Cuadrados Medios
          </NavLink>
          <NavLink to="/middle-products" className="nav-link">
            Productos Medios
          </NavLink>
          <NavLink to="/linear-congruential" className="nav-link">
            Linear Congruencial
          </NavLink>
          <NavLink to="/multiplicative-congruential" className="nav-link">
            Multiplcativo Congruencial
          </NavLink>
        </Nav>
      </BSNavbar.Collapse>
    </BSNavbar>
  );
};

export default Navbar;