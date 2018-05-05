import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Layout from './containers/Layout';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Twitter Sentiment Analysis</h1>
          <h3>(in real time)</h3>
          <h4>React + D3 + Express</h4>
        </header>
        <Layout />
      </div>
    );
  }
}

export default App;
