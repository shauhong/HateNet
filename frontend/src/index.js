import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Scroll, Modal, Toast } from './components';
import { CacheProvider, GlobalProvider } from './contexts';


ReactDOM.render(
  <React.StrictMode>
    <GlobalProvider>
      <CacheProvider>
        <BrowserRouter>
          <App />
          <Toast />
          <Modal />
          <Scroll />
        </BrowserRouter>
      </CacheProvider>
    </GlobalProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
