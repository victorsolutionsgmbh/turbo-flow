import React from 'react';
import ReactDOM from 'react-dom/client';
import Popup from './Popup';
import { LanguageProvider } from './i18n/LanguageContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <Popup />
    </LanguageProvider>
  </React.StrictMode>
);
