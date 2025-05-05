import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import RenovationEstimator from './components/RenovationEstimator';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <RenovationEstimator />
  </React.StrictMode>
); 