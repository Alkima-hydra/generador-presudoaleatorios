import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SquaresMiddle from './pages/SquaresMiddle';
import MiddleProducts from './pages/MiddleProducts';
import LinearCongruential from './pages/LinearCongruential';
import MultiplicativeCongruential from './pages/MultiplicativeCongruential';
import './styles/main.scss';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/squares-middle" element={<SquaresMiddle />} />
          <Route path="/middle-products" element={<MiddleProducts />} />
          <Route path="/linear-congruential" element={<LinearCongruential />} />
          <Route path="/multiplicative-congruential" element={<MultiplicativeCongruential />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;