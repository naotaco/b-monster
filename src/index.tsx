import React from 'react';
import ReactDom from 'react-dom';
import App from '~/container/App';

const container = document.getElementById('contents');

ReactDom.render(
  <App />,
  container,
);
