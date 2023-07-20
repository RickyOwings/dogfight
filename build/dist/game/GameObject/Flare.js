import GameAudio from "../Utility/GameAudio.js";
import GameObject from "./GameObject.js";
import Spark from "./Sparks.js";
import {scaleVec2, addVec2, subVec2} from "../Utility/Vec2.js";
import {pLineV} from "../Utility/pixelRendering.js";
class Flare extends GameObject {
  constructor(pos, vel) {
    super();
    this.sound = new GameAudio("./assets/sounds/flare.ogg");
    this.life = 2e3;
    this.lifeTime = this.life;
    this.identifier = "Flare";
    this.position = pos;
    this.velocity = vel;
    this.setZIndex(254);
    this.sound.play();
  }
  draw(ctx) {
    const line = GameObject.gTCanPosPoly([
      addVec2(scaleVec2(this.velocity, 0.01), this.position),
      this.position
    ]);
    pLineV(ctx, line[0], line[1], `rgba(255, ${this.lifeTime * 205 / this.life + 50}, ${this.lifeTime * 400 / this.life - 200} , ${this.lifeTime / this.life})`);
  }
  update(progress) {
    new Spark(this.position, this.velocity, 0.5);
    if (this.lifeTime < 0)
      this.isGarbage = true;
    const timeS = progress / 1e3;
    const randomness = 5;
    this.velocity = addVec2(this.velocity, {
      x: Math.random() * progress * randomness - 0.5 * progress * randomness,
      y: Math.random() * progress * randomness - 0.5 * progress * randomness
    });
    this.velocity = subVec2(this.velocity, scaleVec2(this.velocity, timeS));
    this.position = addVec2(this.position, scaleVec2(this.velocity, timeS));
    this.lifeTime -= progress;
  }
}
export default Flare;
