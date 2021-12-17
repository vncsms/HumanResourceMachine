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
            <span style={{fontSize:"80px", margin: '30px 0'}}>
              Human Resource Machine
            </span>
          </div>
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <a
              href={"/new-challenge"} 
              style={{fontSize: '30px', margin: '20px 0'}}>
              Create a new challenge
            </a>
            <a
              style={{fontSize: '30px', margin: '20px 0'}}
              href={"/challenges"}>
              Choose a existing one
            </a>
          </div>
      </div>
    );
  }
}