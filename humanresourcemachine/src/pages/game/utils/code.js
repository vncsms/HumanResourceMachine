import { add, sub } from "../../../components/functions";

export const defaultCommands = [
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
      vector: false,
    },
    {
      command: 'copyto',
      hasTarget: true,
      vector: false,
    },
    {
      command: 'add',
      hasTarget: true,
      vector: false,
    },
    {
      command: 'sub',
      hasTarget: true,
      vector: false,
    },
    {
      command: 'bumpup',
      hasTarget: true,
      vector: false,
    },
    {
      command: 'bumpdn',
      hasTarget: true,
      vector: false,
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
    }
  ];

  export const freeExectuion = (commands, funcs, data) => {

    let { mem, kram, out, inb, offs } = data;
    const cmd = commands[offs];
    let value;
    let { errorMemory, errorHand, noOutbox } = funcs;

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

        value = cmd.vector ? mem[parseInt(cmd.target)] : parseInt(cmd.target) ;
        kram = add(kram, mem[value]);
        if (kram > 999 || kram < -999) {
          errorHand();
          return { error: 1, message: '', mem, kram, out, inb, offs };
        }
        offs += 1;
        break;
      case 'bumpup':
        if (mem[parseInt(cmd.target)] == null) {
          errorMemory(cmd.target);
          return { error: 1, message: '', mem, kram, out, inb, offs };
        }
        value = cmd.vector ? mem[parseInt(cmd.target)] : parseInt(cmd.target) ;
        kram = mem[value] += 1;
        if (kram > 999 || kram < -999) {
          errorHand();
          return { error: 1, message: '', mem, kram, out, inb, offs };
        }
        offs += 1;
        break;
      case 'bumpdn':
        if (mem[parseInt(cmd.target)] == null) {
          errorMemory(cmd.target);
          return { error: 1, message: '', mem, kram, out, inb, offs };
        }
        value = cmd.vector ? mem[parseInt(cmd.target)] : parseInt(cmd.target) ;
        kram = mem[value] -= 1;
        if (kram > 999 || kram < -999) {
          errorHand();
          return { error: 1, message: '', mem, kram, out, inb, offs };
        }
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
        value = cmd.vector ? mem[parseInt(cmd.target)] : parseInt(cmd.target) ;
        kram = sub(kram, mem[value]);
        if (kram > 999 || kram < -999) {
          errorHand();
          return { error: 1, message: '', mem, kram, out, inb, offs };
        }
        offs += 1;
        break;
      case 'copyto':
        if (kram == null) {
          errorHand();
          break;
        }
        value = cmd.vector ? mem[parseInt(cmd.target)] : parseInt(cmd.target) ;
        mem[value] = kram;
        offs += 1;
        break;
      case 'copyfrom':
        if (mem[parseInt(cmd.target)] == null) {
          errorMemory(cmd.target);
          break;
        }
        value = cmd.vector ? mem[parseInt(cmd.target)] : parseInt(cmd.target) ;
        kram = mem[value];
        offs += 1;
        break;
      case 'inbox':
        if(inb.length === 0) {
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
        for (let i = 0; i < commands.length; i++) {
          if (commands[i].command === 'label' && commands[i].id === cmd.target) {
            offs = i;
            break;
          }
        }
        break;
      case 'jumpz':
        if(kram === 0) {
          for (let i = 0; i < commands.length; i++) {
            if (commands[i].command === 'label' && commands[i].id === cmd.target) {
              offs = i;
              break;
            }
          }
          break;
        }
        offs += 1;
        break;
      case 'jumpn':
        if(kram < 0) {
          for (let i = 0; i < commands.length; i++) {
            if (commands[i].command === 'label' && commands[i].id === cmd.target) {
              offs = i;
              break;
            }
          }
          break;
        }
        offs += 1;
        break;
      default:
        offs += 1;
        console.log("NENHUM CASO");
    }

    return { error: 0, message: '', mem, kram, out, inb, offs };
  }