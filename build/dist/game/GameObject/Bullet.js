import GameAudio from "../Utility/GameAudio.js";
import GameObject from "./GameObject.js";
import Spark from "./Sparks.js";
import {scaleVec2, addVec2, rotateVec2, polyOffset} from "../Utility/Vec2.js";
import {insidePoly, pLineV} from "../Utility/pixelRendering.js";
const _Bullet = class extends GameObject {
  constructor(pos, vel, angle, owner) {
    super();
    this.life = 1 * 1e3 + Math.random() * 2e3;
    this.lifeTime = this.life;
    this.position = pos;
    this.velocity = addVec2(vel, rotateVec2({x: 0, y: _Bullet.lauchVel}, angle + Math.random() * _Bullet.dispersion - 0.5 * _Bullet.dispersion));
    this.owner = owner;
    this.setZIndex(254);
    this.identifier = "Bullet";
  }
  draw(ctx) {
    const line = GameObject.gTCanPosPoly([
      addVec2(scaleVec2(this.velocity, 0.01), this.position),
      this.position
    ]);
    pLineV(ctx, line[0], line[1], `rgba(255,255,255,${this.lifeTime / this.life})`);
  }
  update(progress) {
    if (this.lifeTime < 0)
      this.isGarbage = true;
    const timeS = progress / 1e3;
    this.position = addVec2(this.position, scaleVec2(this.velocity, timeS));
    this.checkCollision();
    this.lifeTime -= progress;
  }
  checkCollision() {
    const searchType = this.owner == "Player" ? "AntiAir" : "Player";
    const enemies = GameObject.searchByIdentifier(searchType);
    enemies.forEach((enemy) => {
      const enemyPoly = polyOffset(enemy.shape, enemy.position);
      if (insidePoly(this.position, enemyPoly)) {
        _Bullet.hit.play();
        enemy.damage(1);
        this.isGarbage = true;
        new Spark(this.position, scaleVec2(this.velocity, -0.5));
      }
    });
  }
};
let Bullet = _Bullet;
Bullet.lauchVel = 600;
Bullet.color = "#ffffff";
Bullet.dispersion = 0.02;
Bullet.hit = new GameAudio("./assets/sounds/hit.ogg");
export default Bullet;
