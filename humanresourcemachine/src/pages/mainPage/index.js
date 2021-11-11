import React, { Component } from "react";

export default class MainPage extends Component {
  render() {

    return (
      <div style={{width: '100%', height: '100%', backgroundColor: 'aliceblue'}}>
          <div style={{
            backgroundColor: 'antiquewhite',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'row',
          }}>
            <span style={{fontSize:"80px"}}>Human Resource Machine</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <a>Create a new challenge</a>
            <a>Choose a existing one</a>
          </div>
      </div>
    );
  }
}