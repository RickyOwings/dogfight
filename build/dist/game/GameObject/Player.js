import Bullet from "./Bullet.js";
import GameObject from "./GameObject.js";
import Input from "../Utility/input.js";
import {pLineV, pPoly, pPolyFillStip, pTextBasic} from "../Utility/pixelRendering.js";
import {polyOffset, polyRotate, addVec2, scaleVec2, rotateVec2, vecToDist} from "../Utility/Vec2.js";
import GameAudio from "../Utility/GameAudio.js";
import Explosion from "./Explosion.js";
import Flare from "./Flare.js";
import resolution from "../OnetimeOrShared/resolution.js";
const _Player = class extends GameObject {
  constructor(x, y) {
    super();
    this.shape = [
      {x: 0, y: 5},
      {x: -3, y: -5},
      {x: 3, y: -5}
    ];
    this.velocity = {x: 0, y: 300};
    this.acceleration = {x: 0, y: 0};
    this.accelerationStore = {x: 0, y: 0};
    this.rotation = 0;
    this.rotVelocity = 0;
    this.rotAcceleration = 0;
    this.progressStore = 11;
    this.health = 100;
    this.turnFacStore = 0;
    this.liftStore = 0;
    this.fireTimer = _Player.ROF;
    this.flareFireTimer = _Player.FlareROF;
    this.flares = _Player.initalFlareCount;
    this.reloadingFlares = false;
    this.setZIndex(255);
    this.position = {
      x,
      y
    };
    this.identifier = "Player";
    _Player.moveSound.loop();
    _Player.moveSound.setVolume(0.05);
    _Player.airbrakeSound.setVolume(0);
    _Player.airbrakeSound.loop();
    _Player.windSound.setVolume(0);
    _Player.windSound.loop();
  }
  update(progress) {
    this.setPlaybackRate();
    this.thrust();
    this.drag();
    this.turn();
    this.rotDrag();
    this.lift();
    this.accelerationStore = scaleVec2(this.acceleration, 1);
    this.phys(progress);
    this.flare(progress);
    this.shoot(progress);
    this.progressStore = progress;
    const out = _Player.input.isPressed("-") ? 1 : 0;
    const zoom = _Player.input.isPressed("=") ? 1 : 0;
    const reset = _Player.input.isPressed("0") ? 1 : 0;
    if (out)
      _Player.zoomState = 0.1;
    if (zoom)
      _Player.zoomState = 1;
    if (reset)
      _Player.zoomState = 0.25;
    GameObject.setCameraZoom((1 - 7 * (vecToDist(this.velocity) / 7500)) * _Player.zoomState);
    if (_Player.input.isPressed("i"))
      GameObject.setCameraZoom(0.4);
    const zoomFactor = _Player.input.isPressed("i") ? 1 : 0;
    const padding = 0.4;
    const bulletVel = addVec2(this.velocity, rotateVec2({x: 0, y: Bullet.lauchVel}, this.rotation));
    let bulletVelMag = scaleVec2(bulletVel, 4e3 / vecToDist(bulletVel));
    if (bulletVelMag.x > resolution.width * padding / GameObject.cameraZoom)
      bulletVelMag.x = resolution.width * padding / GameObject.cameraZoom;
    if (bulletVelMag.x < resolution.width * -padding / GameObject.cameraZoom)
      bulletVelMag.x = resolution.width * -padding / GameObject.cameraZoom;
    if (bulletVelMag.y > resolution.height * padding / GameObject.cameraZoom)
      bulletVelMag.y = resolution.height * padding / GameObject.cameraZoom;
    if (bulletVelMag.y < resolution.height * -padding / GameObject.cameraZoom)
      bulletVelMag.y = resolution.height * -padding / GameObject.cameraZoom;
    let cameraPos = addVec2(this.position, scaleVec2(bulletVelMag, zoomFactor));
    GameObject.setCameraPosition(cameraPos.x, cameraPos.y);
  }
  damage(amount) {
    this.health -= amount;
    _Player.damageSound.play();
    _Player.damageSound.setPlaybackRate(this.health / 100);
    if (this.health <= 0)
      this.die();
  }
  die() {
    if (this.isGarbage)
      return;
    _Player.moveSound.stop();
    _Player.airbrakeSound.stop();
    _Player.windSound.stop();
    setTimeout(() => {
      new _Player(Math.random() * 6e3 - 3e3, Math.random() * 6e3 - 3e3);
    }, 5e3);
    new Explosion(this.position);
    this.isGarbage = true;
  }
  setPlaybackRate() {
    let playbackRate = vecToDist(this.velocity) / 150;
    if (playbackRate < 0.25)
      playbackRate = 0.25;
    if (playbackRate > 4)
      playbackRate = 16;
    _Player.moveSound.setPlaybackRate(playbackRate);
  }
  thrust() {
    const w = _Player.input.isPressed("w") ? 1 : 0;
    const s = _Player.input.isPressed("s") ? 1 : 0;
    const maxThrust = 50;
    const factor = maxThrust / 3 * (w - s) + maxThrust * 2 / 3;
    const force = {x: 0, y: factor};
    const forceRot = rotateVec2(force, this.rotation);
    this.acceleration = addVec2(this.acceleration, forceRot);
  }
  drag() {
    const chute = _Player.input.isPressed("k") ? 1 : 0;
    if (chute)
      _Player.airbrakeSound.setVolume(vecToDist(this.acceleration) / 60);
    else
      _Player.airbrakeSound.setVolume(0);
    const drag = scaleVec2(this.velocity, -0.05 - 0.4 * chute);
    this.acceleration = addVec2(this.acceleration, drag);
  }
  turn() {
    const a = _Player.input.isPressed("a") ? 1 : 0;
    const d = _Player.input.isPressed("d") ? 1 : 0;
    const optimalTurnSpeed = 300;
    const vel = vecToDist(this.velocity);
    const falloff = 1 / (25e4 * (vel / 2e3));
    const speedMult = 1 / (falloff * (vel - optimalTurnSpeed) ** 2 + 1);
    this.turnFacStore = speedMult;
    const turnFactor = (d - a) * 4;
    this.rotAcceleration += turnFactor * speedMult;
  }
  rotDrag() {
    this.rotAcceleration -= this.rotVelocity * 5;
  }
  lift() {
    const liftForce = rotateVec2(this.velocity, -this.rotation).x * 1;
    _Player.windSound.setVolume(Math.abs(liftForce) / 200);
    this.liftStore = liftForce;
    const liftVector = {x: -liftForce, y: 0};
    const liftRotated = rotateVec2(liftVector, this.rotation);
    this.acceleration = addVec2(this.acceleration, liftRotated);
  }
  phys(progress) {
    const timeS = progress / 1e3;
    this.rotVelocity += this.rotAcceleration * timeS;
    this.rotation += this.rotVelocity * timeS;
    this.velocity = addVec2(this.velocity, scaleVec2(this.acceleration, timeS));
    this.position = addVec2(this.position, scaleVec2(this.velocity, timeS));
    this.rotAcceleration = 0;
    this.acceleration = {x: 0, y: 0};
  }
  shoot(progress) {
    if (this.fireTimer > 0) {
      this.fireTimer -= progress;
      return;
    }
    if (_Player.input.isPressed("j")) {
      this.fireTimer = _Player.ROF;
      new Bullet(this.position, this.velocity, this.rotation, "Player");
      _Player.shootSound.play();
      this.acceleration = addVec2(this.acceleration, rotateVec2({x: 0, y: -50}, this.rotation));
    }
  }
  flare(progress) {
    if (this.flareFireTimer > 0) {
      this.flareFireTimer -= progress;
      return;
    }
    const xDisp = 1e3;
    const yDisp = 400;
    if (this.flares <= 0 && !this.reloadingFlares) {
      this.reloadingFlares = true;
      _Player.outOfFlares.play();
      setTimeout(() => {
        _Player.flaresLoaded.play();
        this.flares = _Player.initalFlareCount;
        this.reloadingFlares = false;
      }, 1e4);
    }
    if (this.reloadingFlares)
      return;
    if (_Player.input.isPressed(" ")) {
      this.flares--;
      this.flareFireTimer = _Player.FlareROF;
      new Flare(this.position, addVec2(this.velocity, rotateVec2({
        x: Math.random() * xDisp - xDisp / 2,
        y: -yDisp
      }, this.rotation)));
    }
  }
  draw(ctx) {
    const rotated = polyRotate(this.shape, this.rotation);
    const translated = polyOffset(rotated, this.position);
    const toCanvas = GameObject.gTCanPosPoly(translated);
    pPolyFillStip(ctx, toCanvas, _Player.color);
    pPoly(ctx, toCanvas, _Player.color);
    const lift = [
      this.position,
      addVec2(this.position, rotateVec2({x: -this.liftStore * 4, y: 0}, this.rotation))
    ];
    const liftToCanvas = GameObject.gTCanPosPoly(lift);
    pLineV(ctx, liftToCanvas[0], liftToCanvas[1], "#00ffff44");
    const prograde = [
      this.position,
      addVec2(this.position, scaleVec2(this.velocity, 4))
    ];
    const progradeToCanvas = GameObject.gTCanPosPoly(prograde);
    pLineV(ctx, progradeToCanvas[0], progradeToCanvas[1], "#ffff0044");
    const aimDist = 4e3;
    const bulletVel = rotateVec2({x: 0, y: Bullet.lauchVel}, this.rotation);
    const netVel = addVec2(this.velocity, bulletVel);
    const aimTime = aimDist / vecToDist(netVel);
    const aimOffset = addVec2(this.position, scaleVec2(netVel, aimTime));
    pLineV(ctx, GameObject.gTCanPos(this.position), GameObject.gTCanPos(aimOffset), "#ffffff44");
    pTextBasic(ctx, 0, 0, `FPS: ${Math.floor(1e3 / this.progressStore)}`, "#00ff00");
    const posOnCan = GameObject.gTCanPos(this.position);
    const offset = GameObject.cameraZoom * 32 + 4;
    pTextBasic(ctx, posOnCan.x - 5, posOnCan.y - offset, `HP: ${this.health}`, "#00ff00");
    pTextBasic(ctx, posOnCan.x - 5, posOnCan.y - offset - 6, `VEL: ${Math.round(vecToDist(this.velocity))}`, "#0000ff");
    pTextBasic(ctx, posOnCan.x - 5, posOnCan.y - offset - 12, `FLRS: ${this.flares}`, "#ffff00");
  }
};
let Player = _Player;
Player.input = new Input(["w", "a", "s", "d", "-", "=", "0", "j", "k", " ", "i"]);
Player.shootSound = new GameAudio("./assets/sounds/shoot.ogg");
Player.moveSound = new GameAudio("./assets/sounds/move.ogg");
Player.airbrakeSound = new GameAudio("./assets/sounds/airbrake.ogg");
Player.windSound = new GameAudio("./assets/sounds/wind.ogg");
Player.damageSound = new GameAudio("./assets/sounds/playerDamage.ogg");
Player.flaresLoaded = new GameAudio("./assets/sounds/flaresLoaded.ogg");
Player.outOfFlares = new GameAudio("./assets/sounds/outOfFlares.ogg");
Player.color = "#00ff00";
Player.zoomState = 0.1;
Player.ROF = 30;
Player.FlareROF = 100;
Player.initalFlareCount = 15;
export default Player;
