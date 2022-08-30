import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ChatConnector from './components/chat-connector'

const options = {
  host: 'https://snacc.polare.org'
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ChatConnector options={options}>
      <App/>
    </ChatConnector>
  </React.StrictMode>
);
