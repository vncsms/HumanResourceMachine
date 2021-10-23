import React, { Component } from "react";
import {
  add,
  sub
} from '../../components/functions';
import styles from './style.module.css';

export default class MainPage extends Component {

  constructor() {
    super();
    this.state = {
      commands: [
        'INBOX',
        'COPYTO 1',
        'ADD 1',
        'COPYTO 3',
        'COPYFROM 1',
        'OUTBOX',
        'SUB 3',
        'a:',
        'SUB 3',
        'BUMP+ 3',
        'BUMP- 1',
        'JUMP a',
        'OUTBOX'
      ],
      labels:              {
        
      },
      offSet: 0,
      memory: new Array(20).fill(null),
      ram: null,
      inbox: [1,2,3,4,5,6,7,8,9],
      outbox: [],
    };
  }

  checkCommand(cmd) {
    const commandAndValue = cmd.split(' ');

    return commandAndValue;
  }

  renderTable(data) {
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

  nextCommand() {

    if(this.state.offSet >= this.state.commands.length) {
      console.log('fim');
      return null;
    }

    const cmd = this.state.commands[this.state.offSet];
    console.log(cmd);
    const cv = this.checkCommand(cmd);

    let result = null;

    const mem = [...this.state.memory];

    switch(cv[0]) {
      case 'ADD':
        result = add(this.state.ram, this.state.memory[parseInt(cv[1])]);
        this.setState({ram: result});
        this.setState({ offSet: this.state.offSet + 1 });
        break;
      case 'BUMPUP':
        mem[parseInt(cv[1])] += 1;
        // result = add(1, mem[parseInt(cv[1])]);
        this.setState({ram: result, memory: mem});
        this.setState({ offSet: this.state.offSet + 1 });
        break;
      case 'BUMPDN':
        mem[parseInt(cv[1])] -= 1;
        // result = sub(mem[parseInt(cv[1])], 1);
        this.setState({ram: result, memory: mem});
        this.setState({ offSet: this.state.offSet + 1 });
        break;
      case 'SUB':
        result = sub(this.state.ram, this.state.memory[parseInt(cv[1])]);
        this.setState({ram: result});
        this.setState({ offSet: this.state.offSet + 1 });
        break;
      case 'COPYTO':
        mem[parseInt(cv[1])] = this.state.ram;
        this.setState({memory: mem});
        this.setState({ offSet: this.state.offSet + 1 });
        break;
      case 'COPYFROM':
        this.setState({ram: this.state.memory[parseInt(cv[1])]});
        this.setState({ offSet: this.state.offSet + 1 });
        break;
      case 'INBOX':
        const ib = [...this.state.inbox];
        const value = ib.shift();
        this.setState({ inbox: ib, ram: value });
        this.setState({ offSet: this.state.offSet + 1 });
        break;
      case 'OUTBOX':
        const ob = [...this.state.outbox];
        ob.unshift(this.state.ram);
        this.setState({ outbox: ob });
        this.setState({ offSet: this.state.offSet + 1 });
        break;
      case 'JUMP':
        this.setState({offSet: parseInt(cv[1])})
        break;
      case 'JUMPZ':
        if(this.state.ram === 0) {
          this.setState({offSet: parseInt(cv[1])})
        }
        break;
      case 'JUMPN':
        if(this.state.ram < 0) {
          this.setState({offSet: parseInt(cv[1])})
        }
        break;
      default:
        console.log("NENHUM CASO");
    }
  }

  render() {

    return (
      <div style={{
          backgroundColor: 'blue',
          width: '1000px',
          height: '800px',
          position: 'relative',}}>
        <button onClick={() => this.nextCommand()}>
          next command
        </button>
        <div style={{position: 'absolute', bottom: 0, left: '10px'}}>
          {this.renderTable(this.state.inbox)}
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
            this.state.memory.map((item, index) =>
              (
                <div className={styles.memory}>
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
        <div style={{position: 'absolute', bottom: 0, right: '10px'}}>
          {this.renderTable(this.state.outbox)}
        </div>
        <div style={{position: 'absolute', top: 0, right: '10px'}}>
          <div className={styles.box}>
            <div className={styles.innerBox}>{this.state.ram}</div>
          </div>
        </div>
      </div>       
    );
  }
}