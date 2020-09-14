import 'core-js/features/map';
import 'core-js/features/set';
import '@vkontakte/vkui/dist/vkui.css';
import './main';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './app';
import * as serviceWorker from './serviceWorker';

if (process.env.REACT_APP_ERUDA) {
  import('./eruda').catch(console.error);
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
