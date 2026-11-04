import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { StandaloneShell } from '@bank/shared';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <StandaloneShell moduleName="Beneficiary">
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
      </StandaloneShell>
    </BrowserRouter>
  </React.StrictMode>,
);
