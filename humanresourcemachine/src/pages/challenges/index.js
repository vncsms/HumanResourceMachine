import React, { Component, useState } from "react";
import { challenges } from "./challenges";
import { Link } from "react-router-dom"

export default function Challenges () {

  const [modal, setModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const challengeButtom = (item) => {
    return <div className="challenge-button-container">
      <button 
        onClick={() => {setModal(true); setSelectedItem(item)}}
        className="challenge-button">
        {item.name}
      </button>
    </div>
  }
  return (
    <div style={{width: '100%', height: '100%', backgroundColor: 'aliceblue'}}>
      <div style={{padding: '30px', display: 'flex', flexWrap: 'wrap'}}>
        {challenges.map((item) => {
          return challengeButtom(item)
        })}
      </div>
      { modal ?
        <div className="challenge-modal">
          <div className="challenge-modal-inner">
            <div className="challenge-modal-description">
              {selectedItem.description}
            </div>
            <Link  
              to={{ pathname: '/game', state: { data: selectedItem } }}
              className="challenge-modal-button">
              START
            </Link>
          </div>
        </div>
      : null }
    </div>
  );
}