import asyncPageLoad from './awaitPageLoad';
import GameObject from './GameObject'
import resolution from './resolution';
import generate from './generate';
import awaitUserInput from './awaitUserInput';
import titleScreen from './titleScreen';


interface GameParams {
    width?: number;
    height?: number;
}

export default class {
    private canvas: HTMLCanvasElement | undefined = undefined;
    private oCanvas: OffscreenCanvas | undefined = undefined;
    private ctx: OffscreenCanvasRenderingContext2D | null = null;

    constructor(params: GameParams) {
        this.init();
    }


    async init() {
        console.log("initializing...")
        await asyncPageLoad();
        console.log("page loaded")
        console.log("user input")
        // getting reference to the canvas element
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        if (this.canvas) console.log("found canvas")
        const fixResolution = () => {
            resolution.width = window.innerWidth * resolution.scaleFactor / 10;
            resolution.height = window.innerHeight * resolution.scaleFactor / 10;
            if (this.oCanvas) {
                this.oCanvas.width = resolution.width;
                this.oCanvas.height = resolution.height;
            }
        }
        window.addEventListener('resize', fixResolution);
        //setTimeout(fixResolution, 50);
        this.oCanvas = this.canvas.transferControlToOffscreen();
        this.ctx = this.oCanvas.getContext("2d")
        // defining drawing context
        await titleScreen(this.ctx, fixResolution)
        fixResolution();
        // initializing game objects at the start
        console.log("generating game objects")
        generate();

        // starting the game loop
        var lastRender = Date.now();
        const loop = async () => {
            if (!this.ctx) return;
            const timestamp = Date.now();
            const progress = timestamp - lastRender;
            lastRender = timestamp;
            this.update(progress);
            this.draw();
            setTimeout(loop, 1);
        }
        console.log("starting game loop")
        loop();
    }


    update(progress: number) {
        for (let i = 0; i < GameObject.instances.length; i++) {
            GameObject.instances[i].update(progress);
        }
        const newInstances: GameObject[] = [];
        for (let i = 0; i < GameObject.instances.length; i++) {
            if (!GameObject.instances[i].isGarbage) newInstances.push(GameObject.instances[i]);
        }
        GameObject.instances = newInstances;
    }


    draw() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, resolution.width, resolution.height)
        for (let i = 0; i < GameObject.instances.length; i++) {
            GameObject.instances[i].draw(this.ctx as OffscreenCanvasRenderingContext2D);
        }
    }
}
