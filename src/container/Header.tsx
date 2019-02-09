import Button from '@material-ui/core/Button';
import React from 'react';
import { HashRouter, Link } from 'react-router-dom';

export default function Header() {
  return (
    <div>
      <Button>test</Button>
      <HashRouter>
      <Link to="/">b-monster</Link>
      </HashRouter>
    </div>
  );
}
