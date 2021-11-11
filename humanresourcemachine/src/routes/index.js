import React, { Component } from "react";
import { Routes ,Route } from 'react-router-dom';
import Game from "../pages/game";
import MainPage from '../pages/mainPage';

export default class RoutesPages extends Component {
  render() {

    return (
      <Routes>
        <Route path="/" exact component={Game} />
        <Route path="/game" exact component={Game} />
      </Routes>
    );
  }
}