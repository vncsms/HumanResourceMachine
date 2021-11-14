import React, { useState, useEffect, useRef } from "react";
import { challenges } from "./challenges";
import { Link } from "react-router-dom"

export default function Challenges () {

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const ref = useRef();
  useOnClickOutside(ref, () => setShowModal(false));

  function useOnClickOutside(ref, handler) {
    useEffect(
      () => {
        const listener = (event) => {
          // Do nothing if clicking ref's element or descendent elements
          if (!ref.current || ref.current.contains(event.target)) {
            return;
          }
          handler(event);
        };
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
          document.removeEventListener("mousedown", listener);
          document.removeEventListener("touchstart", listener);
        };
      },
      [ref, handler]
    );
  }

  const challengeButtom = (item) => {
    return <div className="challenge-button-container">
      <button 
        onClick={() => {setShowModal(true); setSelectedItem(item)}}
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
      { showModal ?
        <div className="challenge-modal">
          <div className="challenge-modal-inner" ref={ref}>
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