import asyncPageLoad from "./awaitPageLoad.js";
import GameObject from "./GameObject.js";
import resolution from "./resolution.js";
import generate from "./generate.js";
import titleScreen from "./titleScreen.js";
export default class {
  constructor(params) {
    this.canvas = void 0;
    this.oCanvas = void 0;
    this.ctx = null;
    this.init();
  }
  async init() {
    console.log("initializing...");
    await asyncPageLoad();
    console.log("page loaded");
    console.log("user input");
    this.canvas = document.getElementById("canvas");
    if (this.canvas)
      console.log("found canvas");
    const fixResolution = () => {
      resolution.width = window.innerWidth * resolution.scaleFactor / 10;
      resolution.height = window.innerHeight * resolution.scaleFactor / 10;
      if (this.oCanvas) {
        this.oCanvas.width = resolution.width;
        this.oCanvas.height = resolution.height;
      }
    };
    window.addEventListener("resize", fixResolution);
    this.oCanvas = this.canvas.transferControlToOffscreen();
    this.ctx = this.oCanvas.getContext("2d");
    await titleScreen(this.ctx, fixResolution);
    fixResolution();
    console.log("generating game objects");
    generate();
    var lastRender = Date.now();
    const loop = async () => {
      if (!this.ctx)
        return;
      const timestamp = Date.now();
      const progress = timestamp - lastRender;
      lastRender = timestamp;
      this.update(progress);
      this.draw();
      setTimeout(loop, 1);
    };
    console.log("starting game loop");
    loop();
  }
  update(progress) {
    for (let i = 0; i < GameObject.instances.length; i++) {
      GameObject.instances[i].update(progress);
    }
    const newInstances = [];
    for (let i = 0; i < GameObject.instances.length; i++) {
      if (!GameObject.instances[i].isGarbage)
        newInstances.push(GameObject.instances[i]);
    }
    GameObject.instances = newInstances;
  }
  draw() {
    if (!this.ctx)
      return;
    this.ctx.clearRect(0, 0, resolution.width, resolution.height);
    for (let i = 0; i < GameObject.instances.length; i++) {
      GameObject.instances[i].draw(this.ctx);
    }
  }
}
