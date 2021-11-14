import React, { useEffect, useState } from "react";
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
  const [inbox, setInbox] = useState([99,2,3,4,5,6,7,8,9]);
  const [outbox, setOutbox] = useState([]);
  const [ram, setRam] = useState(null);
  const [modalError, setModalError] = useState(false);
  const location = useLocation();
  const [answer, setAnswer] = useState([]);
  const [initialInbox, setInitialInbox] = useState([]);

  const checkCommand = (cmd) => {
    const commandAndValue = cmd.split(' ');
    return commandAndValue;
  }
  

  useEffect(() => {
    const data = location.state.data;
    setMemory(data.memory);
    setInbox([...data.tests[0].inbox]);
    setInitialInbox([...data.tests[0].inbox]);
    setAnswer(data.tests[0].outbox);
  }, [location]);

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
    setRam(null);
    setOutbox([]);
    setCommands([]);
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
    const cv = checkCommand(cmd);
    console.log(cmd);

    switch(cv[0]) {
      case 'add':
        if (kram == null) {
          errorHand();
          return { error: 1, message: '', mem, kram, out, inb, offs };
        }
        if (mem[parseInt(cv[1])] == null) {
          errorMemory(cv[1]);
          return { error: 1, message: '', mem, kram, out, inb, offs };
        }
        kram = add(ram, mem[parseInt(cv[1])]);
        offs += 1;
        break;
      case 'bumpup':
        if (mem[parseInt(cv[1])] == null) {
          errorMemory(cv[1]);
          return { error: 1, message: '', mem, kram, out, inb, offs };
        }
        kram = mem[parseInt(cv[1])] += 1;
        offs += 1;
        break;
      case 'bumpdn':
        if (mem[parseInt(cv[1])] == null) {
          errorMemory(cv[1]);
          return { error: 1, message: '', mem, kram, out, inb, offs };
        }
        kram = mem[parseInt(cv[1])] -= 1;
        offs -= 1;
        break;
      case 'sub':
        if (kram == null) {
          errorHand();
          return { error: 1, message: '', mem, kram, out, inb, offs };
        }
        if (mem[parseInt(cv[1])] == null) {
          errorMemory(cv[1]);
          return { error: 1, message: '', mem, kram, out, inb, offs };
        }
        kram = sub(ram, mem[parseInt(cv[1])]);
        offs += 1;
        break;
      case 'copyto':
        if (kram == null) {
          this.errorHand();
          break;
        }
        mem[parseInt(cv[1])] = kram;
        setMemory(mem);
        setOffSet(offSet + 1);
        break;
      case 'copyfrom':
        if (mem[parseInt(cv[1])] == null) {
          errorMemory(cv[1]);
          break;
        }
        kram = mem[parseInt(cv[1])];
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
        if(cv[1] in labels){
          offs = labels[cv[1]];
        }
        break;
      case 'jumpz':
        if(kram === 0) {
          if(cv[1] in labels){
            offs = labels[cv[1]];
          }
        }
        break;
      case 'jumpn':
        if(kram < 0) {
          if(cv[1] in labels){
            offs = labels[cv[1]];
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

  const playCommands = (mem, kram, out, inb, offs) => {
    setTimeout(() => {
      const result = nextCommand2(mem, kram, out, inb, offs);
      if(!result.error) {
        playCommands(result.mem, result.kram, result.out, result.inb, result.offs);
      }
    }, 1000);
  }

  return (
    <div style={{
        backgroundColor: 'teal',
        width: '1200px',
        height: '800px',
        position: 'relative',}}>
      <div style={{position: 'absolute', bottom: 0, left: '10px'}}>
        {renderTable(inbox)}
      </div>
      <div style={{
        position: 'absolute',
        left: 300,
        backgroundColor: 'yellow',
        padding: 20,
        display: "flex",
        bottom: 0,
      }}>
        <button className="button-game" onClick={() => compile()}>
          compile
        </button>
        <div style={{width: 25, height: 50}}></div>
        <button className="button-game"
          disabled={commands.length === 0}
          onClick={() => playCommands(memory, ram, outbox, inbox, offSet)}>
          next
        </button>
        <div style={{width: 25, height: 50}}></div>
        <button className="button-game"
          disabled={commands.length === 0}
          onClick={() => playCommands(memory, ram, outbox, inbox, offSet)}>
          next
        </button>
        <div style={{width: 25, height: 50}}></div>
        <button className="button-game" onClick={() => restart()}>
          reset
        </button>
      </div>
      
      <div style={{
        display: 'flex',
        width: 400,
        padding: '10px',
        backgroundColor: 'violet',
        justifyContent: "center",
        flexWrap: "wrap",
        position: "absolute",
        left: "290px",
        top: "200px",
      }}>
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
      <div style={{position: 'absolute', bottom: 0, right: '250px'}}>
        {renderTable(outbox)}
      </div>
      <div style={{position: 'absolute', top: 50, right: '600px'}}>
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
      <textarea style={{
        resize: 'none',
        position: 'absolute',
        height: '90%',
        right: 0,
        bottom: 0,
      }} cols="25"
      value={code}
      onChange={(e) => {setCode(e.target.value)}}>
      </textarea>
    </div>       
  );
}
