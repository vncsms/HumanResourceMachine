import React, { Component } from "react";
import {
  add,
  sub
} from '../../components/functions';
import styles from './style.module.css';

export default class MainPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      commands: [],
      code: '',
      labels: {
        
      },
      messageError: 'You cant subtract from nothing',
      offSet: 0,
      memory: new Array(20).fill(null),
      inbox: [99,2,3,4,5,6,7,8,9],
      outbox: [],
      ram: null,
      modalError: false,
    };
  }

  componentDidMount() {
    console.log(this.props);
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

  restart() {
    this.setState({
      offSet: 0,
      memory: new Array(20).fill(null),
      inbox: [99,2,3,4,5,6,7,8,9],
      outbox: [],
      commands: [],
    })
  }

  errorHand() {
    this.setState({
      modalError: true,
      messageError: `There is nothing in your hand`,
    })
    this.restart();
  }

  endExec() {
    this.setState({
      modalError: true,
      messageError: `The code is over`
    })
    this.restart();
  }

  noOutbox() {
    this.setState({
      modalError: true,
      messageError: `There is no inbox blocks`,
      inbox: [1,2,3]
    })
    this.restart();
  }

  errorMemory(position) {
    this.setState({
      modalError: true,
      messageError: `There is nothing in the memory ${position}`
    })
    this.restart();
  }

  isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) && !isNaN(parseFloat(str))
  }

  compile() {
    const listCommands = this.state.code.split('\n');
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
            if(allC[cv[0]] === 1 && !this.isNumeric(cv[1]) && !cv[0].includes('jump')) {
              errorCompiler = true;
              console.log('Argumento é inválido', element);
            }
          }
        }
        tempC.push(cv.join(' ').toLowerCase())
      }
    });
    if(!errorCompiler) {
      this.setState({commands: tempC});
      this.setState({labels: labels});
    }
  }

  nextCommand() {

    if(this.state.offSet >= this.state.commands.length) {
      this.endExec();
      this.restart();
      return null;
    }

    const cmd = this.state.commands[this.state.offSet];
    console.log(cmd);
    const cv = this.checkCommand(cmd);

    let result = null;

    const mem = [...this.state.memory];

    switch(cv[0]) {
      case 'add':
        if (this.state.ram == null) {
          this.errorHand();
          break;
        }
        if (mem[parseInt(cv[1])] == null) {
          this.errorMemory(cv[1]);
          break;
        }
        result = add(this.state.ram, mem[parseInt(cv[1])]);
        this.setState({ram: result});
        this.setState({ offSet: this.state.offSet + 1 });
        break;
      case 'bumpup':
        if (mem[parseInt(cv[1])] == null) {
          this.errorMemory(cv[1]);
          break;
        }
        result = mem[parseInt(cv[1])] += 1;
        this.setState({ram: result, memory: mem});
        this.setState({ offSet: this.state.offSet + 1 });
        break;
      case 'bumpdn':
        if (mem[parseInt(cv[1])] == null) {
          this.errorMemory(cv[1]);
          break;
        }
        result = mem[parseInt(cv[1])] -= 1;
        this.setState({ram: result, memory: mem});
        this.setState({ offSet: this.state.offSet + 1 });
        break;
      case 'sub':
        if (this.state.ram == null) {
          this.errorHand();
          break;
        }
        if (mem[parseInt(cv[1])] == null) {
          this.errorMemory(cv[1]);
          break;
        }
        result = sub(this.state.ram, mem[parseInt(cv[1])]);
        this.setState({ram: result});
        this.setState({ offSet: this.state.offSet + 1 });
        break;
      case 'copyto':
        if (this.state.ram == null) {
          this.errorHand();
          break;
        }
        mem[parseInt(cv[1])] = this.state.ram;
        this.setState({memory: mem});
        this.setState({ offSet: this.state.offSet + 1 });
        break;
      case 'copyfrom':
        if (mem[parseInt(cv[1])] == null) {
          this.errorMemory(cv[1]);
          break;
        }
        this.setState({ram: mem[parseInt(cv[1])]});
        this.setState({ offSet: this.state.offSet + 1 });
        break;
      case 'inbox':
        if(this.state.inbox.length === 0) {
          this.noOutbox();
          break;
        }
        const ib = [...this.state.inbox];
        const value = ib.shift();
        this.setState({ inbox: ib, ram: value });
        this.setState({ offSet: this.state.offSet + 1 });
        break;
      case 'outbox':
        const ob = [...this.state.outbox];
        ob.unshift(this.state.ram);
        this.setState({ outbox: ob });
        this.setState({ ram: null })
        this.setState({ offSet: this.state.offSet + 1 });
        break;
      case 'jump':
        if(cv[1] in this.state.labels){
          this.setState({offSet: this.state.labels[cv[1]]})
        }
        break;
      case 'jumpz':
        if(this.state.ram === 0) {
          if(cv[1] in this.state.labels){
            this.setState({offSet: this.state.labels[cv[1]]})
          }
        }
        break;
      case 'jumpn':
        if(this.state.ram < 0) {
          if(cv[1] in this.state.labels){
            this.setState({offSet: this.state.labels[cv[1]]})
          }
        }
        break;
      default:
        this.setState({ offSet: this.state.offSet + 1 });
        console.log("NENHUM CASO");
    }
  }

  render() {

    return (
      <div style={{
          backgroundColor: 'teal',
          width: '1200px',
          height: '800px',
          position: 'relative',}}>
        <div style={{position: 'absolute', bottom: 0, left: '10px'}}>
          {this.renderTable(this.state.inbox)}
        </div>
        <div style={{
          position: 'absolute',
          left: 300,
          backgroundColor: 'yellow',
          padding: 20,
          display: "flex",
          bottom: 0,
        }}>
          <button style={{width: 50, height: 50}} onClick={() => this.compile()}>
            start
          </button>
          <div style={{width: 25, height: 50}}></div>
          <button style={{width: 50, height: 50}}
            disabled={this.state.commands.length === 0}
            onClick={() => this.nextCommand()}>
            next
          </button>
          <button style={{width: 50, height: 50}} onClick={() => this.restart()}>
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
            this.state.memory.map((item, index) =>
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
          {this.renderTable(this.state.outbox)}
        </div>
        <div style={{position: 'absolute', top: 50, right: '600px'}}>
          <div className={styles.box}>
            <div className={styles.innerBox}>{this.state.ram}</div>
          </div>
        </div>
        {this.state.modalError?
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
              <span>{this.state.messageError}</span>
              <button onClick={() => this.setState({modalError: false})} style={{width: 50, height: 30}}>
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
        value={this.state.code}
        onChange={(e) => {this.setState({code: e.target.value})}}>
        </textarea>
      </div>       
    );
  }
}