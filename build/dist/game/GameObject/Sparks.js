import GameObject from "./GameObject.js";
import {scaleVec2, addVec2, subVec2} from "../Utility/Vec2.js";
import {pLineV} from "../Utility/pixelRendering.js";
class Spark extends GameObject {
  constructor(pos, vel, rand = 5) {
    super();
    this.life = 500 + Math.random() * 300;
    this.lifeTime = this.life;
    this.position = pos;
    const startRand = 60 * rand;
    this.velocity = addVec2(scaleVec2(vel, 0.5), {
      x: Math.random() * startRand - startRand / 2,
      y: Math.random() * startRand - startRand / 2
    });
    this.setZIndex(254);
    this.rand = rand;
  }
  draw(ctx) {
    const line = GameObject.gTCanPosPoly([
      addVec2(scaleVec2(this.velocity, 0.01), this.position),
      this.position
    ]);
    pLineV(ctx, line[0], line[1], `rgba(255, ${this.lifeTime * 205 / this.life + 50}, ${this.lifeTime * 400 / this.life - 200} , ${this.lifeTime / this.life})`);
  }
  update(progress) {
    if (this.lifeTime < 0)
      this.isGarbage = true;
    const timeS = progress / 1e3;
    const randomness = this.rand;
    this.velocity = addVec2(this.velocity, {
      x: Math.random() * progress * randomness - 0.5 * progress * randomness,
      y: Math.random() * progress * randomness - 0.5 * progress * randomness
    });
    this.velocity = subVec2(this.velocity, scaleVec2(this.velocity, timeS));
    this.position = addVec2(this.position, scaleVec2(this.velocity, timeS));
    this.lifeTime -= progress;
  }
}
export default Spark;
