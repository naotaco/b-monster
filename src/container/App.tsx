import React from 'react';
import { HashRouter, Link, Route } from 'react-router-dom';
import Config from '~/container/Config';
import Home from '~/container/Home';
import Header from './Header';

export default function App() {
  return (
    <div>
      <Header/>
      <HashRouter>
        <div>
          <Route exact={true} path="/" component={Home} />
          <Route path="/config" component={Config} />
        </div>
      </HashRouter>
    </div>
  );
}
