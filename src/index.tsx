import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import Locales from './translations/Locales';

const apiUrl = process.env.TGS || "http://localhost:5000";

ReactDOM.render(
  <App serverAddress={apiUrl} locale={Locales.enCA} />,
  document.getElementById('root') as HTMLElement
);
