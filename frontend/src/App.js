import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import InvestmentPlatform from './components/InvestmentPlatform';

function App() {
  return (
    <div className="App">
      <BrowserRouter>  
        <Routes>
          <Route path="/" element={<InvestmentPlatform />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;