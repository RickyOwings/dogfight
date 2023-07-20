import Bullet from "./Bullet.js";
import Explosion from "./Explosion.js";
import GameAudio from "../Utility/GameAudio.js";
import GameObject from "./GameObject.js";
import {Missile, MissileMissile} from "./Missile.js";
import {addVec2, angleBetVecs, distBetVecs, polyOffset, scaleVec2} from "../Utility/Vec2.js";
import {pLineCircle, pLineV, pPoly, pPolyFillStip, pTextBasic} from "../Utility/pixelRendering.js";
import resolution from "../OnetimeOrShared/resolution.js";
import mapSize from "../OnetimeOrShared/mapSize.js";
export class BaseAntiAir extends GameObject {
  constructor({
    position,
    identifier,
    color = "#ff0000",
    rangeColor = "#ff000044",
    shape = [
      {x: -5, y: -5},
      {x: 5, y: -5},
      {x: 5, y: 5},
      {x: -5, y: 5}
    ],
    health = 20,
    range = 1e3,
    burstTime = 500,
    ROF = 30,
    restTime = 3e3,
    dieFunction = () => {
    },
    fireFunction = (position2, angle) => {
      console.log(`Fired from ${position2} at an angle of ${angle}`);
    },
    targetIdentifier = "Player",
    projectileVelocity = Bullet.lauchVel
  }) {
    super();
    this.damaged = false;
    this.resting = false;
    this.position = position;
    this.identifier = identifier;
    this.color = color;
    this.rangeColor = rangeColor;
    this.shape = shape;
    this.health = health;
    this.range = range;
    this.burstTime = burstTime;
    this.ROF = ROF;
    this.restTime = restTime;
    this.dieFunction = dieFunction;
    this.fireFunction = fireFunction;
    this.targetIdentifier = targetIdentifier;
    this.burstTimer = this.burstTime;
    this.fireTimer = this.ROF;
    this.projectileVelocity = projectileVelocity;
  }
  damage(amount) {
    this.health -= amount;
    this.damaged = true;
  }
  update(progress) {
    this.burst(progress);
    if (this.health <= 0) {
      this.die();
    }
    ;
  }
  die() {
    if (this.isGarbage)
      return;
    this.isGarbage = true;
    setTimeout(this.dieFunction, 4e3);
    new Explosion(this.position);
  }
  burst(progress) {
    if (this.burstTime > 0)
      this.burstTimer -= progress;
    if (this.resting && this.burstTime > 0) {
      if (this.burstTimer < 0) {
        this.burstTimer = this.burstTime;
        this.resting = false;
        return;
      }
    } else {
      if (this.burstTimer < 0) {
        this.burstTimer = this.restTime;
        this.resting = true;
        return;
      }
      this.fire(progress);
    }
  }
  fire(progress) {
    this.fireTimer -= progress;
    if (this.fireTimer <= 0) {
      this.fireTimer = this.ROF;
      const targets = GameObject.searchByIdentifier(this.targetIdentifier);
      for (let i = 0; i < targets.length; i++) {
        const worked = this.tryFire(targets[i]);
        if (worked)
          return;
      }
    }
  }
  tryFire(target) {
    const distance = distBetVecs(target.position, this.position);
    if (distance > this.range)
      return false;
    this.targetPosStore = target.position;
    const lead = this.obtainLead(target, distance);
    this.fireProjectile(lead);
    return true;
  }
  obtainLead(target, distance) {
    const timeS = distance / this.projectileVelocity;
    let leadPos = addVec2(target.position, scaleVec2(target.velocity, timeS));
    leadPos = addVec2(leadPos, scaleVec2(target.accelerationStore, timeS ** 2 / 2));
    this.leadStore = leadPos;
    return angleBetVecs(this.position, leadPos);
  }
  fireProjectile(angle) {
    const adustedAngle = angle - Math.PI / 2;
    this.fireFunction(this.position, adustedAngle);
  }
  draw(ctx) {
    const localShape = polyOffset(this.shape, this.position);
    const canvasShape = GameObject.gTCanPosPoly(localShape);
    pPolyFillStip(ctx, canvasShape, this.color);
    const lineColor = this.damaged ? "#ffffff" : this.color;
    pPoly(ctx, canvasShape, lineColor);
    const canPos = GameObject.gTCanPos(this.position);
    const offset = GameObject.cameraZoom * 16 + 4;
    pTextBasic(ctx, canPos.x - 5, canPos.y - offset, `${this.health}`, lineColor);
    pLineCircle(ctx, this.range * GameObject.cameraZoom, canPos, this.rangeColor, 32);
    this.drawOffscreenMarkers(ctx);
    this.damaged = false;
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
}
const _AntiAir = class extends BaseAntiAir {
  constructor(x, y) {
    _AntiAir.shootSound.setPlaybackRate(0.5);
    super({
      position: {x, y},
      identifier: "AntiAir",
      color: "#ff0000",
      rangeColor: "#ff000044",
      dieFunction: () => {
        let x1 = Math.random() * mapSize.width - mapSize.width / 2;
        let y1 = Math.random() * mapSize.height - mapSize.height / 2;
        let x2 = Math.random() * mapSize.width - mapSize.width / 2;
        let y2 = Math.random() * mapSize.height - mapSize.height / 2;
        new _AntiAir(x1, y1);
        new _AntiAir(x2, y2);
      },
      fireFunction: (position, angle) => {
        new Bullet(position, {x: 0, y: 0}, angle, "AntiAir");
        _AntiAir.shootSound.play();
      },
      projectileVelocity: Bullet.lauchVel
    });
  }
  draw(ctx) {
    super.draw(ctx);
    if (this.leadStore && this.targetPosStore && !this.resting) {
      pLineV(ctx, GameObject.gTCanPos(this.position), GameObject.gTCanPos(this.leadStore), this.rangeColor);
      pLineCircle(ctx, 2, GameObject.gTCanPos(this.leadStore), this.rangeColor, 4);
    }
  }
};
export let AntiAir = _AntiAir;
AntiAir.shootSound = new GameAudio("./assets/sounds/shoot.ogg");
const _MissileLauncher = class extends BaseAntiAir {
  constructor(x, y) {
    AntiAir.shootSound.setPlaybackRate(0.5);
    super({
      position: {x, y},
      identifier: "AntiAir",
      color: "#ffaa00",
      rangeColor: "#ffaa0044",
      range: 2e3,
      ROF: 8e3,
      restTime: 0,
      dieFunction: () => {
        let x1 = Math.random() * mapSize.width - mapSize.width / 2;
        let y1 = Math.random() * mapSize.height - mapSize.height / 2;
        let x2 = Math.random() * mapSize.width - mapSize.width / 2;
        let y2 = Math.random() * mapSize.height - mapSize.height / 2;
        new _MissileLauncher(x1, y1);
        new _MissileLauncher(x2, y2);
      },
      fireFunction: (position, angle) => {
        new Missile(position, {x: 0, y: 0}, angle, "AntiAir");
        _MissileLauncher.shootSound.play();
      },
      projectileVelocity: Bullet.lauchVel
    });
  }
};
export let MissileLauncher = _MissileLauncher;
MissileLauncher.shootSound = new GameAudio("./assets/sounds/missileLaunch.ogg");
const _MissileYeeter = class extends BaseAntiAir {
  constructor(x, y) {
    AntiAir.shootSound.setPlaybackRate(0.5);
    super({
      position: {x, y},
      identifier: "AntiAir",
      color: "#ffff00",
      rangeColor: "#ffff0044",
      range: 8e3,
      ROF: 16e3,
      restTime: 0,
      dieFunction: () => {
        let x1 = Math.random() * mapSize.width - mapSize.width / 2;
        let y1 = Math.random() * mapSize.height - mapSize.height / 2;
        let x2 = Math.random() * mapSize.width - mapSize.width / 2;
        let y2 = Math.random() * mapSize.height - mapSize.height / 2;
        new _MissileYeeter(x1, y1);
        new _MissileYeeter(x2, y2);
      },
      fireFunction: (position, angle) => {
        new Missile(position, {x: 0, y: 0}, angle, "AntiAir", 1e3);
        new Missile(position, {x: 0, y: 0}, angle + Math.PI / 8, "AntiAir", 1e3);
        new Missile(position, {x: 0, y: 0}, angle - Math.PI / 8, "AntiAir", 1e3);
        MissileLauncher.shootSound.play();
      },
      projectileVelocity: 1e6
    });
  }
};
export let MissileYeeter = _MissileYeeter;
MissileYeeter.shootSound = new GameAudio("./assets/sounds/missileLaunch.ogg");
const _MissileLauncherLauncher = class extends BaseAntiAir {
  constructor(x, y) {
    AntiAir.shootSound.setPlaybackRate(0.5);
    super({
      position: {x, y},
      identifier: "AntiAir",
      color: "#ff00ff",
      rangeColor: "#ff00ff44",
      range: 16e3,
      ROF: 32e3,
      restTime: 0,
      dieFunction: () => {
        let x1 = Math.random() * mapSize.width - mapSize.width / 2;
        let y1 = Math.random() * mapSize.height - mapSize.height / 2;
        let x2 = Math.random() * mapSize.width - mapSize.width / 2;
        let y2 = Math.random() * mapSize.height - mapSize.height / 2;
        new _MissileLauncherLauncher(x1, y1);
        new _MissileLauncherLauncher(x2, y2);
      },
      fireFunction: (position, angle) => {
        new MissileMissile(position, {x: 0, y: 0}, angle, "AntiAir", 100);
        MissileLauncher.shootSound.play();
      },
      projectileVelocity: 1e6
    });
  }
};
export let MissileLauncherLauncher = _MissileLauncherLauncher;
MissileLauncherLauncher.shootSound = new GameAudio("./assets/sounds/missileLaunch.ogg");
