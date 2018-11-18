import * as React from 'react';
import * as ReactDOM from 'react-dom';
import MainHall from '../components/MainHall';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MainHall />, div);
  ReactDOM.unmountComponentAtNode(div);
});
