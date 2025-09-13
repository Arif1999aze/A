import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import InvestmentPlatform from './components/InvestmentPlatform';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <div className="App">
      <BrowserRouter>  
        <Routes>
          <Route path="/" element={<InvestmentPlatform />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;