import React, { Component } from "react";
import { challenges } from "./challenges";
import { Link } from "react-router-dom"

export default class Challenges extends Component {
  challengeButtom(item) {
    return <Link 
    to={{
      pathname: '/game',
      state: {data: item},
    }}
    style={{
      padding: '10px',
      margin: '10px',
      borderRadius: '5px',
      fontSize: '14px',
      color: 'white',
      backgroundColor: 'green'}}>{item.name}</Link>
  }

  render() {
    return (
      <div style={{width: '100%', height: '100%', backgroundColor: 'aliceblue'}}>
        <div style={{padding: '30px', display: 'flex', flexWrap: 'wrap'}}>
          {challenges.map((item) => {
            return this.challengeButtom(item)
          })}
        </div>
      </div>
    );
  }
}