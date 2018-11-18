import * as React from 'react';
import * as ReactDOM from 'react-dom';
import MainHall from './components/MainHall';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <MainHall />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
