import GameAudio from "../Utility/GameAudio.js";
import GameObject from "./GameObject.js";
import Spark from "./Sparks.js";
import {scaleVec2, addVec2, rotateVec2, subVec2, angleBetVecs, distBetVecs, vecToDist} from "../Utility/Vec2.js";
import {pLineV} from "../Utility/pixelRendering.js";
const _Missile = class extends GameObject {
  constructor(pos, vel, angle, owner, launchVel = 300) {
    super();
    this.color = "#ffaa00";
    this.lineColor = "#ffaa0044";
    this.acceleration = {x: 0, y: 0};
    this.rotation = 0;
    this.rotVelocity = 0;
    this.rotAcceleration = 0;
    this.justSpawned = true;
    this.fuel = 1e4;
    this.guideFuel = 2e4;
    this.thrustForce = 60;
    this.life = 2e4;
    this.lifeTime = this.life;
    this.leadStore = {x: 0, y: 0};
    this.rotationTarget = 0;
    this.lostTarget = false;
    this.maxAngle = Math.PI / 3;
    this.doLead = true;
    this.ROFlame = 10;
    this.flameTimer = this.ROFlame;
    this.turnForce = 32;
    this.hitDistance = 10;
    this.position = pos;
    this.rotation = angle;
    this.velocity = addVec2(vel, rotateVec2({x: 0, y: launchVel}, angle));
    this.target = GameObject.searchByIdentifier("Player")[0];
    this.owner = owner;
    this.setZIndex(254);
    this.identifier = "Missile";
    this.audio = new GameAudio("./assets/sounds/missileSound.ogg");
    this.audio.setPlaybackRate(4);
    this.audio.setVolume(0.1);
    this.audio.loop();
  }
  update(progress) {
    if (this.lifeTime < 0)
      this.die(false);
    this.audioUpdate();
    this.flare(progress);
    this.guidance(progress);
    this.turn();
    this.lift();
    this.thrust(progress);
    this.drag();
    this.rotDrag();
    this.phys(progress);
    this.checkCollision();
    this.lifeTime -= progress;
    this.justSpawned = false;
  }
  audioUpdate() {
    if (this.fuel < 0)
      this.audio.stop();
    const players = GameObject.searchByIdentifier("Player");
    if (players.length) {
      const p = players[0];
      const audDV = subVec2(p.velocity, this.velocity);
      const ang = angleBetVecs({x: 0, y: 0}, audDV);
      this.audio.setVolume(100 / distBetVecs(this.position, p.position));
      this.audio.setPlaybackRate((rotateVec2(audDV, -ang).x + 400 + 100) / 1800);
    }
  }
  flare(progress) {
    const flares = GameObject.searchByIdentifier("Flare");
    const players = GameObject.searchByIdentifier("Player");
    const heats = [...flares, ...players];
    heats.forEach((heatTarget) => {
      const maxAngle = this.maxAngle;
      let angleToFlare = angleBetVecs(this.position, heatTarget.position) - this.rotation - Math.PI / 2;
      angleToFlare = angleToFlare % (Math.PI * 2);
      if (angleToFlare < 0)
        angleToFlare += Math.PI * 2;
      if (angleToFlare < maxAngle || angleToFlare > Math.PI * 2 - maxAngle) {
        const num1 = Math.floor(Math.random() * 5e3 / progress);
        const num2 = Math.floor(Math.random() * 5e3 / progress);
        if (num1 == num2) {
          this.target = heatTarget;
        }
        ;
      }
    });
  }
  guidance(progress) {
    this.fuel -= progress;
    this.guideFuel -= progress;
    const maxAngle = this.maxAngle;
    let angleToTarget = angleBetVecs(this.position, this.target.position) - this.rotation - Math.PI / 2;
    angleToTarget = angleToTarget % (Math.PI * 2);
    if (angleToTarget < 0)
      angleToTarget += Math.PI * 2;
    if (angleToTarget > maxAngle && angleToTarget < Math.PI * 2 - maxAngle) {
      if (!this.lostTarget)
        setTimeout(() => {
          this.die(false);
        }, 1e3);
      this.lostTarget = true;
    }
    if (this.target.isGarbage) {
      this.lostTarget = true;
    }
    if (this.guideFuel > 0 && !this.lostTarget) {
      const dv = subVec2(this.target.velocity, this.velocity);
      const dist = distBetVecs(this.position, this.target.position);
      const timeToTarget = dist / vecToDist(dv);
      let lead = addVec2(this.target.position, scaleVec2(this.target.velocity, timeToTarget));
      if (!this.doLead)
        lead = this.target.position;
      let rotationTarget = angleBetVecs(this.position, lead) - Math.PI / 2;
      rotationTarget = rotationTarget % (Math.PI * 2);
      if (rotationTarget < 0)
        rotationTarget += Math.PI * 2;
      this.rotationTarget = rotationTarget;
      if (this.justSpawned)
        this.rotation = this.rotationTarget;
      this.leadStore = lead;
    }
  }
  thrust(progress) {
    if (this.fuel < 0)
      return;
    this.flame(progress);
    this.acceleration = addVec2(this.acceleration, rotateVec2({x: 0, y: this.thrustForce}, this.rotation));
  }
  flame(progress) {
    this.flameTimer -= progress;
    if (this.flameTimer > 0)
      return;
    this.flameTimer = this.ROFlame;
    new Spark(this.position, addVec2(this.velocity, rotateVec2({x: 0, y: -2e3}, this.rotation)), 1);
    new Spark(this.position, addVec2(this.velocity, rotateVec2({x: 0, y: -2e3}, this.rotation)), 1);
  }
  phys(progress) {
    const timeS = progress / 1e3;
    this.rotVelocity += this.rotAcceleration * timeS;
    this.rotation += this.rotVelocity * timeS;
    this.rotation = this.rotation % (Math.PI * 2);
    if (this.rotation < 0)
      this.rotation += Math.PI * 2;
    this.velocity = addVec2(this.velocity, scaleVec2(this.acceleration, timeS));
    this.position = addVec2(this.position, scaleVec2(this.velocity, timeS));
    this.acceleration = {x: 0, y: 0};
    this.rotAcceleration = 0;
  }
  lift() {
    const liftForce = rotateVec2(this.velocity, -this.rotation).x * 8;
    const liftVector = {x: -liftForce, y: 0};
    const liftRotated = rotateVec2(liftVector, this.rotation);
    this.acceleration = addVec2(this.acceleration, liftRotated);
  }
  drag() {
    const drag = scaleVec2(this.velocity, -0.05);
    this.acceleration = addVec2(this.acceleration, drag);
  }
  rotDrag() {
    if (this.lostTarget)
      return;
    this.rotAcceleration -= this.rotVelocity * 5;
  }
  turn() {
    if (this.lostTarget)
      return;
    const deltaTarget = this.rotationTarget - this.rotation;
    const dir = deltaTarget < 0 ? -1 : 1;
    const turnFalloff = 32;
    const turn = turnFalloff * deltaTarget ** 2 * dir / (turnFalloff * deltaTarget ** 2 + 1);
    const optimalTurnSpeed = 300;
    const vel = vecToDist(this.velocity);
    const falloff = 1 / (16e4 * (vel / 2e3));
    const speedMult = 1 / (falloff * (vel - optimalTurnSpeed) ** 2 + 1);
    this.rotAcceleration += speedMult * turn * this.turnForce;
  }
  checkCollision() {
    const searchType = this.owner == "Player" ? "AntiAir" : "Player";
    const enemies = GameObject.searchByIdentifier(searchType);
    enemies.forEach((enemy) => {
      const distance = distBetVecs(enemy.position, this.position);
      if (distance < this.hitDistance) {
        this.hit(enemy);
      }
    });
  }
  hit(enemy) {
    this.lostTarget = true;
    enemy.damage(20);
    this.die();
  }
  die(fromHit = true) {
    this.isGarbage = true;
    _Missile.hit.setPlaybackRate(2);
    _Missile.hit.play();
    this.audio.stop();
    let factor = fromHit ? -0.5 : 1;
    for (let i = 0; i < 20; i++) {
      new Spark(this.position, scaleVec2(this.velocity, factor));
    }
  }
  draw(ctx) {
    const line = GameObject.gTCanPosPoly([
      addVec2(rotateVec2({x: 0, y: -4}, this.rotation), this.position),
      this.position
    ]);
    pLineV(ctx, line[0], line[1], this.color);
    if (this.guideFuel > 0 && !this.lostTarget) {
      pLineV(ctx, line[0], GameObject.gTCanPos(this.target.position), this.lineColor);
    }
  }
};
export let Missile = _Missile;
Missile.hit = new GameAudio("./assets/sounds/explosion.ogg");
export class MissileMissile extends Missile {
  constructor() {
    super(...arguments);
    this.color = "#ff00ff";
    this.lineColor = "#ff00ff44";
    this.hitDistance = 2e3;
    this.thrustForce = 800;
    this.fuel = 2e4;
    this.guideFuel = 2e4;
    this.lifeTime = 2e4;
    this.maxAngle = Math.PI * 2;
    this.turnForce = 32;
    this.doLead = false;
  }
  hit(enemy) {
    this.lostTarget = true;
    const angle = angleBetVecs(enemy.position, this.position) + Math.PI / 2;
    new Missile(this.position, {x: 0, y: 0}, angle, "AntiAir", 1e3);
    this.die();
  }
}
