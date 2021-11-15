import React, { useEffect, useState, useRef } from "react";
import PlayButton from '../../assets/icons/play-solid.svg';
import NextButton from '../../assets/icons/step-forward-solid.svg';
import StopButton from '../../assets/icons/stop-solid.svg';
import PauseButton from '../../assets/icons/pause-solid.svg';
import Arrow from '../../assets/icons/angle-right-solid.svg';
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
  const [labels, setLabels] = useState({});
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
  const [defaultCommands] = useState([
    { 
      command: 'inbox',
      hasTarget: false,
    },
    { 
      command: 'outbox',
      hasTarget: false,
    },
    { 
      command: 'copyfrom',
      hasTarget: true,
    },
    {
      command: 'copyto',
      hasTarget: true,
    },
    {
      command: 'add',
      hasTarget: true,
    },
    {
      command: 'sub',
      hasTarget: true,
    },
    {
      command: 'bumpup',
      hasTarget: true,
    },
    {
      command: 'bumpdn',
      hasTarget: true,
    },
    {
      command: 'jump',
      hasTarget: true,
    },
    {
      command: 'jumpz',
      hasTarget: true,
    },
    {
      command: 'jumpn',
      hasTarget: true,
    },
    {
      command: 'label',
      hasTarget: true,
    }
  ])

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
    setAnswer(false);
  }

  const errorHand = () => {
    setModalError(true);
    setMessageError(`There is nothing in your hand`);
    restart();
  }

  const endExecError = () => {
    setModalError(true);
    setMessageError(`The code is over`);
    restart();
  }

  const endExecSuccess = () => {
    setModalError(true);
    setMessageError(`You finished the challenge`);
    restart();
  }

  const noOutbox = () => {
    setModalError(true);
    setMessageError(`There is no inbox blocks`);
    restart();
  }

  const errorMemory = (position) => {
    setModalError(true);
    setMessageError(`There is nothing in the memory ${position}`);
    restart();
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
      setLabels(labels);
    }
  }

  const arrayEquals = (a, b) => {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
  }

  const freeExectuion = (mem, kram, out, inb, offs) => {

    const cmd = commands[offs];
    console.log(cmd);

    switch(cmd.command) {
      case 'add':
        if (kram == null) {
          errorHand();
          return { error: 1, message: '', mem, kram, out, inb, offs };
        }
        if (mem[parseInt(cmd.target)] == null) {
          errorMemory(cmd.target);
          return { error: 1, message: '', mem, kram, out, inb, offs };
        }
        kram = add(ram, mem[parseInt(cmd.target)]);
        offs += 1;
        break;
      case 'bumpup':
        if (mem[parseInt(cmd.target)] == null) {
          errorMemory(cmd.target);
          return { error: 1, message: '', mem, kram, out, inb, offs };
        }
        kram = mem[parseInt(cmd.target)] += 1;
        offs += 1;
        break;
      case 'bumpdn':
        if (mem[parseInt(cmd.target)] == null) {
          errorMemory(cmd.target);
          return { error: 1, message: '', mem, kram, out, inb, offs };
        }
        kram = mem[parseInt(cmd.target)] -= 1;
        offs -= 1;
        break;
      case 'sub':
        if (kram == null) {
          errorHand();
          return { error: 1, message: '', mem, kram, out, inb, offs };
        }
        if (mem[parseInt(cmd.target)] == null) {
          errorMemory(cmd.target);
          return { error: 1, message: '', mem, kram, out, inb, offs };
        }
        kram = sub(ram, mem[parseInt(cmd.target)]);
        offs += 1;
        break;
      case 'copyto':
        if (kram == null) {
          errorHand();
          break;
        }
        mem[parseInt(cmd.target)] = kram;
        // setMemory(mem);
        offs += 1;
        break;
      case 'copyfrom':
        if (mem[parseInt(cmd.target)] == null) {
          errorMemory(cmd.target);
          break;
        }
        kram = mem[parseInt(cmd.target)];
        offs += 1;
        break;
      case 'inbox':
        if(inbox.length === 0) {
          noOutbox();
          break;
        }
        kram = inb.shift();
        offs += 1;
        break;
      case 'outbox':
        out.unshift(kram);
        kram = null;
        offs += 1;
        break;
      case 'jump':
        if(cmd.target in labels){
          offs = labels[cmd.target];
        }
        break;
      case 'jumpz':
        if(kram === 0) {
          if(cmd.target in labels){
            offs = labels[cmd.target];
          }
        }
        break;
      case 'jumpn':
        if(kram < 0) {
          if(cmd.target in labels){
            offs = labels[cmd.target];
          }
        }
        break;
      default:
        offs += 1;
        console.log("NENHUM CASO");
    }

    return { error: 0, message: '', mem, kram, out, inb, offs };
  }

  const nextCommand2 = (mem, kram, out, inb, offs) => {
    console.log(offs);
    if(offs >= commands.length) {
      endExecError();
      restart();
      return { error: 1, message: '', mem, kram, out, inb, offs };
    } else if (arrayEquals(outbox, answer)) {
      endExecSuccess();
      restart();
      return { error: 1, message: '', mem, kram, out, inb, offs };
    }
    const result = freeExectuion(mem, kram, out, inb, offs);
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

  const handleOnDragEnd = (result) => {
    setCommandHold(null);
    const { source, destination } = result;
    if(!destination || destination.droppableId === 'characters2') return;
    const items = [...commands];
    if(source.droppableId === 'characters2') {
      const newItem = {
        command: defaultCommands[source.index].command,
        target: 0,
        hasTarget: defaultCommands[source.index].hasTarget,
      }
      items.splice(destination.index, 0, newItem);  
    } else {
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
    }
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
        <ul style={{right: playing ? 0 : '250px'}} className={'commands-box-placeholder'}>
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
            <ul style={{right: playing ? 0 : '250px'}}s {...provided.droppableProps} ref={provided.innerRef} 
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
            <ul {...provided.droppableProps} ref={provided.innerRef} 
              className={'commands-box'}>
              {commands.map((item, id) => {
               return (
                <Draggable isDragDisabled={playing} key={id} draggableId={id.toString()} index={id}>
                  {(provided) => (
                    <li {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                      <div 
                        style={{backgroundColor: modalMemory && selectTarget.command === id ? 'green' : (playing && offSet === id ? 'brown' : 'aqua')}}
                        className='commands-container-item'>
                        <div className={'code-lines'}>
                          {id + 1}
                        </div>
                        <div className={'commands-item commands-item-default'}>
                          {item.command}
                        </div>
                        { item.hasTarget ?
                          <button
                            onClick={() => {
                              setSelectedTarget({
                                target: item.target,
                                command: id,
                              });
                              setModalMemory(true)}}
                            className={'commands-item commands-item-default'}>
                            {item.target}
                          </button>
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
