import React, { Component } from "react";

export default class MainPage extends Component {
  render() {

    return (
      <div style={{width: '100%', height: '100%', backgroundColor: 'black'}}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'row',
          }}>
            <span className="bit" style={{fontSize:"40px", margin: '32px 0'}}>
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
              className="bit"
              style={{fontSize: '2rem', margin: '20px 0'}}>
              Create a new challenge
            </a>
            <a
              className="bit"
              style={{fontSize: '2rem',
              margin: '20px 0'}}
              href={"/challenges"}>
              Choose an existing one
            </a>
          </div>
      </div>
    );
  }
}