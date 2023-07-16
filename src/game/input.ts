interface KeyStates {
    [key: string]: boolean
}

class Input {
    private keyStates: KeyStates = {};
    constructor(keys: string[]){
        keys.forEach((key)=>{
            this.keyStates[key] = false;
        });

        document.addEventListener('keydown', (event)=>{
            const keyPressed = event.key;
            if (!Object.keys(this.keyStates).includes(keyPressed)) return;
            this.keyStates[keyPressed] = true;
        })

        document.addEventListener('keyup', (event)=>{
            const keyPressed = event.key;
            if (!Object.keys(this.keyStates).includes(keyPressed)) return;
            this.keyStates[keyPressed] = false;
        })

    }

    public isPressed(key: string): boolean{
        if (!Object.keys(this.keyStates).includes(key)) return false;
        return this.keyStates[key];
    }
}

export default Input;
