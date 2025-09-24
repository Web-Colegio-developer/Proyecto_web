import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';


ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="20063376824-oikgl3q9htj5dpp96u4fm5j56o0bqt69.apps.googleusercontent.com">
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  </GoogleOAuthProvider>
);