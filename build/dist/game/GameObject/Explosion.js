import GameAudio from "../Utility/GameAudio.js";
import GameObject from "./GameObject.js";
import Spark from "./Sparks.js";
import {polyOffset, polyScale} from "../Utility/Vec2.js";
import {pPoly, pPolyFill, pPolyFillStip, pTextBasic} from "../Utility/pixelRendering.js";
const _Explosion = class extends GameObject {
  constructor(pos) {
    _Explosion.sound.play();
    super();
    this.lifeTime = _Explosion.time;
    this.scale = 1;
    this.setZIndex(100);
    for (let i = 0; i < 50; i++) {
      new Spark(pos, {x: 0, y: 0});
    }
    this.position = pos;
  }
  update(progress) {
    if (this.lifeTime < 0)
      this.isGarbage = true;
    this.scale += progress / _Explosion.time;
    this.lifeTime -= progress;
  }
  draw(ctx) {
    const scaled = polyScale(_Explosion.shape, this.scale);
    const inner = polyScale(scaled, 0.5);
    const localShape = polyOffset(scaled, this.position);
    const localShapeInner = polyOffset(inner, this.position);
    const canvasShape = GameObject.gTCanPosPoly(localShape);
    const canvasShapeInner = GameObject.gTCanPosPoly(localShapeInner);
    pPolyFillStip(ctx, canvasShape, _Explosion.color);
    pPolyFill(ctx, canvasShapeInner, "#ffccdd");
    pPoly(ctx, canvasShape, _Explosion.color);
    pTextBasic();
  }
};
let Explosion = _Explosion;
Explosion.sound = new GameAudio("./assets/sounds/explosion.ogg");
Explosion.color = "#ffaa00";
Explosion.shape = [
  {x: -5, y: 10},
  {x: 0, y: 6},
  {x: 5, y: 9},
  {x: 3, y: 3},
  {x: 7, y: -3},
  {x: 1, y: 0},
  {x: 0, y: -8},
  {x: -3, y: 0},
  {x: -10, y: 0},
  {x: -4, y: 4}
];
Explosion.time = 100;
export default Explosion;
