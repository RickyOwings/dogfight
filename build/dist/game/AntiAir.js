import Bullet from "./Bullet.js";
import Explosion from "./Explosion.js";
import GameAudio from "./GameAudio.js";
import GameObject from "./GameObject.js";
import Missile from "./Missile.js";
import {addVec2, angleBetVecs, distBetVecs, polyOffset, scaleVec2} from "./Vec2.js";
import {pLineCircle, pLineV, pPoly, pPolyFillStip, pTextBasic} from "./pixelRendering.js";
import resolution from "./resolution.js";
import mapSize from "./mapSize.js";
const _AntiAir = class extends GameObject {
  constructor(x, y) {
    _AntiAir.shootSound.setPlaybackRate(0.5);
    super();
    this.color = _AntiAir.color;
    this.health = 20;
    this.damaged = false;
    this.ROF = _AntiAir.ROF;
    this.burstTime = _AntiAir.burstTime;
    this.burstRest = _AntiAir.burstRest;
    this.range = 1e3;
    this.burstTimer = _AntiAir.burstTime;
    this.resting = false;
    this.fireTime = this.ROF;
    this.hasShot = false;
    this.playerPosStore = {x: 0, y: 0};
    this.leadStore = {x: 0, y: 0};
    this.projVel = Bullet.lauchVel;
    this.position = {
      x,
      y
    };
    this.identifier = "AntiAir";
  }
  damage(amount) {
    this.health -= amount;
    this.damaged = true;
  }
  update(progress) {
    this.shoot(progress);
    if (this.health <= 0) {
      this.die();
    }
    ;
  }
  die() {
    this.isGarbage = true;
    setTimeout(() => {
      new _AntiAir(mapSize.width * Math.random() - mapSize.width / 2, mapSize.height * Math.random() - mapSize.height / 2);
      new _AntiAir(mapSize.width * Math.random() - mapSize.width / 2, mapSize.height * Math.random() - mapSize.height / 2);
    }, 4e3);
    new Explosion(this.position);
  }
  shoot(progress) {
    this.burstTimer -= progress;
    if (this.resting) {
      this.hasShot = false;
      if (this.burstTimer < 0) {
        this.resting = false;
        this.burstTimer = this.burstTime;
      }
      ;
      return;
    }
    if (this.burstTimer < 0) {
      this.resting = true;
      this.burstTimer = this.burstRest;
      this.fireTime = this.ROF;
      return;
    }
    this.fireTime -= progress;
    if (this.fireTime > 0)
      return;
    this.fireTime = this.ROF;
    const players = GameObject.searchByIdentifier("Player");
    players.forEach((player) => {
      this.fireFunction(player);
    });
  }
  fireFunction(player) {
    const distance = distBetVecs(player.position, this.position);
    if (distance > this.range)
      return;
    const lead = this.obtainLead(player, distance);
    this.fireBullet(lead);
  }
  obtainLead(player, distance) {
    this.playerPosStore = player.position;
    this.hasShot = true;
    const timeS = distance / this.projVel;
    let leadPos = addVec2(player.position, scaleVec2(player.velocity, timeS));
    leadPos = addVec2(leadPos, scaleVec2(player.accelerationStore, timeS ** 2 / 2));
    this.leadStore = leadPos;
    return angleBetVecs(this.position, leadPos);
  }
  fireBullet(angle) {
    new Bullet(this.position, {x: 0, y: 0}, angle - Math.PI / 2, "AntiAir");
    _AntiAir.shootSound.play();
  }
  draw(ctx) {
    const localShape = polyOffset(_AntiAir.shape, this.position);
    const canvasShape = GameObject.gTCanPosPoly(localShape);
    pPolyFillStip(ctx, canvasShape, this.color);
    const lineColor = this.damaged ? "#ffffff" : this.color;
    pPoly(ctx, canvasShape, lineColor);
    const canPos = GameObject.gTCanPos(this.position);
    const offset = GameObject.cameraZoom * 16 + 4;
    pTextBasic(ctx, canPos.x - 5, canPos.y - offset, `${this.health}`, lineColor);
    this.damaged = false;
    pLineCircle(ctx, this.range * GameObject.cameraZoom, canPos, "#ff000044", 32);
    this.drawOffscreenMarkers(ctx);
    this.drawLeadMarkers(ctx);
  }
  drawLeadMarkers(ctx) {
    const canPos = GameObject.gTCanPos(this.position);
    if (this.resting)
      return;
    if (!this.hasShot)
      return;
    pLineV(ctx, canPos, GameObject.gTCanPos(this.playerPosStore), "#ff000044");
    pLineV(ctx, GameObject.gTCanPos(this.leadStore), GameObject.gTCanPos(this.playerPosStore), "#ff000044");
    pLineCircle(ctx, 2, GameObject.gTCanPos(this.leadStore), "#ff0000ff", 8);
  }
  drawOffscreenMarkers(ctx) {
    const canPos = GameObject.gTCanPos(this.position);
    const lineColor = this.damaged ? "#ffffff" : this.color;
    const markerWidth = 10;
    if (canPos.x < 0 && canPos.y < 0) {
      pPoly(ctx, [{x: 0, y: 0}, {x: markerWidth, y: markerWidth}], lineColor);
    }
    if (canPos.x > resolution.width && canPos.y < 0) {
      pPoly(ctx, [{x: resolution.width, y: 0}, {x: resolution.width - markerWidth, y: markerWidth}], lineColor);
    }
    if (canPos.x < 0 && canPos.y > resolution.height) {
      pPoly(ctx, [{x: 0, y: resolution.height}, {x: markerWidth, y: resolution.height - markerWidth}], lineColor);
    }
    if (canPos.x > resolution.width && canPos.y > resolution.height) {
      pPoly(ctx, [{x: resolution.width, y: resolution.height}, {x: resolution.width - markerWidth, y: resolution.height - markerWidth}], lineColor);
    }
    if (canPos.x < 0) {
      pPoly(ctx, [{x: 0, y: canPos.y}, {x: markerWidth, y: canPos.y}], lineColor);
    }
    if (canPos.x > resolution.width) {
      pPoly(ctx, [{x: resolution.width, y: canPos.y}, {x: resolution.width - markerWidth, y: canPos.y}], lineColor);
    }
    if (canPos.y < 0) {
      pPoly(ctx, [{x: canPos.x, y: 0}, {x: canPos.x, y: markerWidth}], lineColor);
    }
    if (canPos.y > resolution.height) {
      pPoly(ctx, [{x: canPos.x, y: resolution.height}, {x: canPos.x, y: resolution.height - markerWidth}], lineColor);
    }
  }
};
export let AntiAir = _AntiAir;
AntiAir.color = "#ff0000";
AntiAir.shootSound = new GameAudio("./assets/sounds/shoot.ogg");
AntiAir.shape = [
  {x: -5, y: -5},
  {x: 5, y: -5},
  {x: 5, y: 5},
  {x: -5, y: 5}
];
AntiAir.ROF = 15;
AntiAir.burstTime = 500;
AntiAir.burstRest = 4e3;
const _MissileAAA = class extends AntiAir {
  constructor(x, y) {
    _MissileAAA.shootSound.setPlaybackRate(2);
    super(x, y);
    this.color = "#ffaa00";
    this.projVel = Missile.lauchVel;
    this.ROF = 8e3;
    this.range = 4e3;
  }
  shoot(progress) {
    this.fireTime -= progress;
    if (this.fireTime > 0)
      return;
    const players = GameObject.searchByIdentifier("Player");
    players.forEach((player) => {
      this.fireFunction(player);
    });
  }
  fireFunction(player) {
    this.fireTime = this.ROF;
    const distance = distBetVecs(player.position, this.position);
    if (distance > this.range)
      return;
    const angle = angleBetVecs(this.position, player.position);
    this.fireMissile(angle, player);
  }
  fireMissile(angle, player) {
    new Missile(this.position, {x: 0, y: 0}, angle - Math.PI / 2, "AntiAir", player);
    _MissileAAA.shootSound.play();
  }
  die() {
    this.isGarbage = true;
    setTimeout(() => {
      new _MissileAAA(mapSize.width * Math.random() - mapSize.width / 2, mapSize.height * Math.random() - mapSize.height / 2);
      new _MissileAAA(mapSize.width * Math.random() - mapSize.width / 2, mapSize.height * Math.random() - mapSize.height / 2);
    }, 4e3);
    new Explosion(this.position);
  }
};
export let MissileAAA = _MissileAAA;
MissileAAA.shootSound = new GameAudio("./assets/sounds/missileLaunch.ogg");
