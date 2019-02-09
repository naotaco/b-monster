import React from 'react';

interface IAppState {
  email: string;
  password: string;
}

export default class Config extends React.Component<{}, IAppState> {
  public render() {
    return <div>Config</div>;
  }
}
