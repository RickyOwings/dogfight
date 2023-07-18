class Input {
  constructor(keys) {
    this.keyStates = {};
    keys.forEach((key) => {
      this.keyStates[key] = false;
    });
    document.addEventListener("keydown", (event) => {
      const keyPressed = event.key;
      if (!Object.keys(this.keyStates).includes(keyPressed))
        return;
      this.keyStates[keyPressed] = true;
    });
    document.addEventListener("keyup", (event) => {
      const keyPressed = event.key;
      if (!Object.keys(this.keyStates).includes(keyPressed))
        return;
      this.keyStates[keyPressed] = false;
    });
  }
  isPressed(key) {
    if (!Object.keys(this.keyStates).includes(key))
      return false;
    return this.keyStates[key];
  }
}
export default Input;
