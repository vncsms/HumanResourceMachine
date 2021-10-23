import React, { Component } from "react";
import {
  add,
  sub
} from '../../components/functions';

export default class MainPage extends Component {

  constructor() {
    super();
    this.state = {
      commands: ['INBOX', 'COPYTO 1', 'ADD 1', 'COPYTO 3', 'SUB 3'],
      offSet: 0,
      memory: [],
      ram: null,
      inbox: [1,2,3,4,5,6,7,8,9],
      outbos: [],
    };
  }

  componentDidMount() {
    this.setState({memory: new Array(5).fill(0)});
  }

  checkCommand(cmd) {
    const commandAndValue = cmd.split(' ');

    return commandAndValue;
  }

  nextCommand() {

    console.log(this.state.inbox);

    const cmd = this.state.commands[this.state.offSet];
    console.log(cmd);
    const cv = this.checkCommand(cmd);

    let result = null;

    switch(cv[0]) {
      case 'ADD':
        result = add(this.state.ram, this.state.memory[parseInt(cv[1])]);
        this.setState({ram: result});
        break;
      case 'SUB':
        result = sub(this.state.ram, this.state.memory[parseInt(cv[1])]);
        this.setState({ram: result});
        break;
      case 'COPYTO':
        const mem = [...this.state.memory];
        mem[parseInt(cv[1])] = this.state.ram;
        this.setState({memory: mem});
        break;
      case 'INBOX':
        const ib = [...this.state.inbox];
        const value = ib.shift();
        this.setState({ inbox: ib, ram: value });
      default:
        console.log('+' + cv[0] + '+');
        console.log("NENHUM DOS DOIS");
    }

    this.setState({ offSet: this.state.offSet + 1 });
  }

  render() {

    return (
      <div>
        <button onClick={() => this.nextCommand()}>
          next command
        </button>
        <br/>inbox:
        <div style={{display: 'flex', flexDirection: 'row'}}>
        {
          this.state.inbox.map((item) => (
            <div style={{border: '1px solid black', maxWidth: '20px', padding: '2px'}}>{item}</div>
          ))
        }
        </div>
        <div style={{display: 'flex', flexDirection: 'row'}}>
        ram: <div style={{border: '1px solid black', maxWidth: '20px', padding: '2px'}}>{this.state.ram}</div>
        </div>
        <div style={{display: 'flex', flexDirection: 'row'}}>memory:
        {
          this.state.memory.map((item) => (
            <div style={{border: '1px solid black', maxWidth: '20px', padding: '2px'}}>{item}</div>
          ))
        }
        </div>
      </div>       
    );
  }
}