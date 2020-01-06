import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './components/App';
import { AppProvider } from './providers/AppProvider';

const rootElement = document.getElementById('root');

ReactDOM.render(
  <AppProvider
    App={App}
    msExpectedRefreshDuration={1000}
    msStatusDisplay={600}
    pxDistanceRequired={100}
  />,
  rootElement,
);
