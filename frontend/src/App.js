import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import DemoInvestPage from './components/DemoInvestPage';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DemoInvestPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;