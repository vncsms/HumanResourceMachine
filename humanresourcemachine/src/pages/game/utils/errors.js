export const errorHand = (setModalError, setMessageError, restart) => {
  setModalError(true);
  setMessageError(`There is nothing in your hand`);
  restart();
}

export const errorMemory = (setModalError, setMessageError,restart, position) => {
  setModalError(true);
  setMessageError(`There is nothing in the memory ${position}`);
  restart();
}

export const endExecError = (setModalError, setMessageError, restart) => {
  setModalError(true);
  setMessageError(`The code is over`);
  restart();
}

export const endExecErrorWrongOutput = (setModalError, setMessageError, restart) => {
  setModalError(true);
  setMessageError(`Output is wrong`);
  restart();
}

export const endExecSuccess = (setModalError, setMessageError, restart) => {
  setModalError(true);
  setMessageError(`You finished the challenge`);
  restart();
}

export const noOutbox = (setModalError, setMessageError, restart) => {
  setModalError(true);
  setMessageError(`There is no inbox blocks`);
  restart();
}