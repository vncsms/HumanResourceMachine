import React, { useEffect, useState, useRef } from "react";
import PlayButton from '../../assets/icons/play-solid.svg';
import NextButton from '../../assets/icons/step-forward-solid.svg';
import StopButton from '../../assets/icons/stop-solid.svg';
import PauseButton from '../../assets/icons/pause-solid.svg';
import { nextChar } from "./utils";
import { Switch } from 'antd';
import { defaultCommands, freeExectuion } from "./utils/code";
import { 
  endExecError,
  endExecErrorWrongOutput,
  noOutbox,
  errorHand,
  errorMemory,
  endExecSuccess,
} from './utils/errors';
import { DragDropContext, Droppable, Draggable  } from 'react-beautiful-dnd';
import {
  add,
  sub
} from '../../components/functions';
import {
  useLocation
} from "react-router-dom";
import styles from './style.module.css';

export default function MainPage () {

  const [commands, setCommands] = useState([]);
  const [code, setCode] = useState('');
  const [lastLabel, setLastLabel] = useState(0);
  const [messageError, setMessageError] = useState('');
  const [offSet, setOffSet] = useState(0);
  const [memory, setMemory] = useState(new Array(20).fill(null));
  const [inbox, setInbox] = useState([]);
  const [outbox, setOutbox] = useState([]);
  const [ram, setRam] = useState(null);
  const [modalError, setModalError] = useState(false);
  const location = useLocation();
  const [answer, setAnswer] = useState([]);
  const [initialInbox, setInitialInbox] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [interval, setInter] = useState();
  const [commandHold, setCommandHold] = useState(null);
  const [modalMemory, setModalMemory] = useState(false);
  const [initialMemory, setInitialMemory] = useState([]);
  const [selectTarget, setSelectedTarget] = useState({
    command: 0,
    target: 0,
  });
  

  useEffect(() => {
    const data = location.state.data;
    setMemory([...data.memory]);
    setInbox([...data.tests[0].inbox]);
    setInitialInbox([...data.tests[0].inbox]);
    setInitialMemory([...data.memory]);
    setAnswer(data.tests[0].outbox);
  }, [location]);

  const ref = useRef();
  useOnClickOutside(ref, () => setModalMemory(false));

  function useOnClickOutside(ref, handler) {
    useEffect(
      () => {
        const listener = (event) => {
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

  const renderTable = (data) => {
    return (
      <div className={styles.table}>
        {
          data.map((item) => (
            <div className={styles.box}>
              <div className={styles.innerBox}>{item}</div>
            </div>
          ))
        }
      </div>
    )
  }

  const restart = () => {
    const data = location.state.data;
    setOffSet(0);
    setInbox([...initialInbox]);
    setMemory(initialMemory);
    setRam(null);
    setOutbox([]);
    setPlaying(false);
    // setAnswer(false);
  }

  const isNumeric = (str) => {
    if (typeof str != "string") return false
    return !isNaN(str) && !isNaN(parseFloat(str))
  }

  const compile = () => {
    const listCommands = code.split('\n');
    const tempC = [];
    const allC = {
      'inbox': 0,
      'outbox': 0,
      'copyfrom': 1,
      'copyto': 1,
      'add': 1,
      'sub': 1,
      'bumpup': 1,
      'bumpdn': 1,
      'jump': 1,
      'jumpz': 1,
      'jumpn': 1
    };

    const labels = {};

    let errorCompiler = false;

    listCommands.forEach(element => {
      const cv = element.trim().split(' ');
      if(cv.length) {
        if (!(cv[0].toLowerCase() in allC)) {
          if(cv.length === 1 && cv[0].slice(-1) === ':') {
            if(cv[0] in labels) {
              errorCompiler = true;
              console.log('Label já declarado', element);
            } else {
              labels[cv[0].slice(0, -1)] = tempC.length;
            }
          } else {
            errorCompiler = true;
            console.log('Comando inexistente', element);
          }
        } else {
          if(cv.length !== allC[cv[0]] + 1) {
            errorCompiler = true;
            console.log('Número de argumentos invalidos', element);
          } else {
            if(allC[cv[0]] === 1 && !isNumeric(cv[1]) && !cv[0].includes('jump')) {
              errorCompiler = true;
              console.log('Argumento é inválido', element);
            }
          }
        }
        tempC.push(cv.join(' ').toLowerCase())
      }
    });
    if(!errorCompiler) {
      setCommands(tempC);
    }
  }

  const arrayEquals = (a, b) => {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
  }

  

  const nextCommand2 = (mem, kram, out, inb, offs) => {
    if(offs >= commands.length) {
      endExecError(setModalError, setMessageError, restart);
      restart();
      return { error: 1, message: '', mem, kram, out, inb, offs };
    } else if (arrayEquals(outbox, answer)) {
      endExecSuccess(setModalError, setMessageError, restart);
      restart();
      return { error: 1, message: '', mem, kram, out, inb, offs };
    }
    const result = freeExectuion(commands, {
      errorMemory: ((target) => errorMemory(setModalError, setMessageError, restart, target)),
      errorHand: (() => errorHand(setModalError, setMessageError, restart)),
      noOutbox: (() => noOutbox(setModalError, setMessageError, restart)),

    } ,{mem, kram, out, inb, offs});

    if (!arrayEquals(result.out, answer.slice(0, result.out.length))) {
      endExecErrorWrongOutput(setModalError, setMessageError, restart);
      return { error: 1, message: '', mem, kram, out, inb, offs };
    }

    if(result.error === 0) {
      setMemory(result.mem);
      setRam(result.kram);
      setOutbox(result.out);
      setInbox(result.inb);
      setOffSet(result.offs);
      return result;
    } else {
      return { error: 1, message: '', mem, kram, out, inb, offs };
    }
  }

  useEffect(() => {
    if (playing) {
      playCommands(memory, ram, outbox, inbox, offSet);
    } else {
      clearInterval(interval);
    }
  }, [playing])

  const playCommands = (mem, kram, out, inb, offs) => {
    const interval = setInterval(() => {
      const result = nextCommand2(mem, kram, out, inb, offs);
      mem = result.mem;
      kram = result.kram;
      out = result.out;
      inb = result.inb;
      offs = result.offs;
      if(result.error) {
        setPlaying(false);
      }
    }, 1000);
    setInter(interval);
  }

  const onChangeVector = (checked, id) => {
    const items = [...commands];
    items[id].vector = checked;
    console.log(items[id]);
    setCommands(items);
  }

  const handleOnDragEnd = (result) => {
    
    setCommandHold(null);
    const { source, destination } = result;
    const items = [...commands];
    if (!destination && source.droppableId === 'characters') {
      const index = result.source.index;

      if (items[index].command.includes('jump')) {
        const id = items[index].target;
        items.splice(index, 1);
        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          if (item.command === 'label' && item.id === id) {
            items.splice(i, 1);
            break;
          }
        }
      } else if (items[index].command.includes('label')) {
        const id = items[index].id;
        items.splice(index, 1);
        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          if (item.command.includes('jump') && item.target === id) {
            items.splice(i, 1);
            break;
          }
        }
      } else {
        items.splice(index, 1);
      }
    } else if (source.droppableId === 'characters2' && !destination) {

    } else if (source.droppableId === 'characters2' && destination.droppableId === 'characters') {
      const newItem = {
        command: defaultCommands[source.index].command,
        target: 0,
        hasTarget: defaultCommands[source.index].hasTarget,
        vector: defaultCommands[source.index].vector,
      }
      if (['jumpz', 'jump', 'jumpn'].includes(newItem.command)) {
        newItem.target = lastLabel + 1;
        const newLabel = {
          command: 'label',
          target: '',
          id: newItem.target,
          hasTarget: false,
        }
        items.splice(destination.index, 0, newLabel);  
        setLastLabel(lastLabel + 1);
      }
      console.log(newItem);
      items.splice(destination.index, 0, newItem);  
    } else if (source.droppableId === 'characters2' && destination.droppableId === 'characters2') { 

    } else {
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
    }

    let target = 'A';
    items.forEach((item) => {
      if (item.command === 'label') {
        item.target = target;
        target = nextChar(target);
      }
    });

    setCommands(items);
  }

  const handleOnDragStart = (result) => {
    const { source } = result;

    if(source.droppableId === 'characters2') {
      setCommandHold(source.index);
    }
  }

  return (
    <div className='game-page'>
      <div style={{position: 'absolute', bottom: 0, left: '10px'}}>
        {renderTable(inbox)}
      </div>
      <div className='control-panel'>
        <button className="button-game"
          disabled={playing}
          style={{
            backgroundColor: !playing ? "#43b280" : 'rgb(190, 204, 199)',
          }}
          onClick={() => nextCommand2(memory, ram, outbox, inbox, offSet)}>
          <img className="control-button" src={NextButton} alt="React Logo" />
        </button>
        <button className="button-game"
          disabled={commands.length === 0}
          style={{ backgroundColor: "#43b280" }}
          onClick={() => {
            setPlaying(!playing);
          }}>
          <img className="control-button" src={playing? PauseButton : PlayButton} alt="React Logo" />
        </button>
        <button style={{backgroundColor: 'brown'}}
          className="button-game"
          onClick={() => {
            clearInterval(interval);
            restart();
          }}>
        <img className="control-button" src={StopButton} alt="React Logo" />
        </button>
      </div>
      
      <div className='memory-board'>
        {
          memory.map((item, index) =>
            (
              <div className={styles.memory} key={index}>
                { item || item === 0 ? 
                    (
                      <div className={styles.box}>
                        <div className={styles.innerBox}>{item}</div>
                      </div>
                    )
                  : null}
                <div style={{position: 'absolute', bottom: 0}}>{index}</div>
              </div>
            )
          )
        }
      </div>
      <div style={{position: 'absolute', bottom: 0, right: '500px'}}>
        {renderTable(outbox)}
      </div>
      <div style={{position: 'absolute', top: 50, left: '300px'}}>
        <div className={styles.box}>
          <div className={styles.innerBox}>{ram}</div>
        </div>
      </div>

      {modalError?
        <div style={{
          height: '100%',
          width: '100%',
          backgroundColor: '#00000075',
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: 'white',
            height: 200,
            width: 400,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span>{messageError}</span>
            <button onClick={() => setModalError(false)} style={{width: 50, height: 30}}>
              ok
            </button>
          </div>
        </div>
      : null }
      <DragDropContext onDragStart={handleOnDragStart} onDragEnd={handleOnDragEnd}>
        <ul style={{right: playing ? 0 : '250px', listStyleType: 'none'}} className={'commands-box-placeholder'}>
          {defaultCommands.map((item, id) => {
            return (
              <li>
                <div className={'commands-item commands-item-default'}>
                  {item.command}
                </div>
              </li>
            ) 
          })}
        </ul>
        <Droppable droppableId="characters2">
          {(provided) => (
            <ul 
              style={{right: playing ? 0 : '250px', overflowY: 'auto', listStyleType: 'none'}}
              {...provided.droppableProps}
              ref={provided.innerRef} 
              className={'commands-box-source'}>
              {defaultCommands.map((item, id) => {
               return (
                <Draggable isDragDisabled={playing} key={id} draggableId={(id).toString() + 'k'} index={id}>
                  {(provided) => (
                    <li {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                      <div className={commandHold === id ? 'commands-item-hold commands-item-default' : 'commands-item-default commands-item-invisible' }>
                        {item.command}
                      </div>
                    </li>
                  )}
                </Draggable>
               ) 
              })}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
        <Droppable droppableId="characters">
          {(provided) => (
            <ul
              style={{overflowY: 'auto'}}
              {...provided.droppableProps}
              ref={provided.innerRef} 
              className={'commands-box'}>
              {commands.map((item, id) => {
               return (
                <Draggable isDragDisabled={playing} key={id} draggableId={id.toString()} index={id}>
                  {(provided) => (
                    <li {...provided.draggableProps} {...provided.dragHandleProps}  ref={provided.innerRef}>
                      <div 
                        style={{backgroundColor: modalMemory && selectTarget.command === id ? 'green' : (playing && offSet === id ? 'brown' : 'aqua')}}
                        className='commands-container-item'>
                        <div className={'code-lines'}>
                          {id + 1}
                        </div>
                        <div className={'commands-item commands-item-default'}>
                          {item.command === 'label' ? item.target : item.command}
                        </div>
                        { item.hasTarget ?
                          <button
                            onClick={() => {
                              if (!item.command.includes('jump')) {
                                setSelectedTarget({
                                  target: item.target,
                                  command: id,
                                });
                                setModalMemory(true)}
                              }
                            }
                            className={'commands-item commands-item-default'}>
                            {item.vector ? '[' : null}
                            {item.command.includes('jump') ?
                              commands.find((i) => i.command === 'label' && i.id === item.target ).target :
                            item.target}
                            {item.vector ? ']' : null}
                          </button>
                        : null }
                        { item.vector === false || item.vector === true ?
                          <div className={'commands-item commands-item-default'}>
                            <Switch checked={item.vector} onChange={(checked) => onChangeVector(checked, id)}/>
                          </div>
                        : null }
                      </div>
                    </li>
                  )}
                </Draggable>
               ) 
              })}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
      {modalMemory?
        <div style={{
          height: '100%',
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'flex',
        }}>
          <div className='memory-board' ref={ref}>
            {
              memory.map((item, index) =>
                (
                  <button style={{borderColor: selectTarget.target === index ? 'red' : '#294d07'}}
                    onClick={() => {
                      setSelectedTarget({ 
                        command: selectTarget.command,
                        target: index,
                      });
                      const items = [...commands];
                      items[selectTarget.command].target = index;
                      setCommands(items);
                      setModalMemory(false);
                    }}
                    className={styles.memory} key={index}>
                    { item || item === 0 ? 
                        (
                          <div className={styles.box}>
                            <div className={styles.innerBox}>{item}</div>
                          </div>
                        )
                      : null}
                    <div style={{position: 'absolute', bottom: 0}}>{index}</div>
                  </button>
                )
              )
            }
          </div>
        </div>
      : null }
    </div>       
  );
}
