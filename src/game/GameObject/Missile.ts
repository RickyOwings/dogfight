import { AntiAir } from "./AntiAir";
import Flare from "./Flare";
import GameAudio from "../Utility/GameAudio";
import GameObject from "./GameObject";
import Player from "./Player";
import Spark from "./Sparks";
import { scaleVec2, addVec2, rotateVec2, Vec2, subVec2, polyOffset, angleBetVecs, distBetVecs, vecToDist, polyRotate } from "../Utility/Vec2";
import { insidePoly, pDot, pLineCircle, pLineV, pTextBasic } from "../Utility/pixelRendering";

interface Target {
    position: Vec2,
    velocity: Vec2,
    isGarbage: boolean,
}


export class Missile extends GameObject {
    public color: string = "#ffaa00";
    public lineColor: string = "#ffaa0044";
    private static hit: GameAudio = new GameAudio('./assets/sounds/explosion.ogg')

    public acceleration: Vec2 = { x: 0, y: 0 };
    public rotation: number = 0;
    private rotVelocity: number = 0;
    private rotAcceleration: number = 0;
    private owner: string;
    private target: Target;
    private audio: GameAudio;
    private justSpawned: boolean = true;

    constructor(pos: Vec2, vel: Vec2, angle: number, owner: string, launchVel: number = 400) {
        super();
        this.position = pos;
        this.rotation = angle;
        this.velocity = addVec2(vel, rotateVec2(
            { x: 0, y: launchVel }, angle
        ));
        this.target = GameObject.searchByIdentifier('Player')[0] as Target;
        this.owner = owner;
        this.setZIndex(254);
        this.identifier = "Missile";
        this.audio = new GameAudio('./assets/sounds/missileSound.ogg');
        this.audio.setPlaybackRate(4);
        this.audio.setVolume(0.1);
        this.audio.loop();
    }


    public fuel: number = 10000;
    public guideFuel: number = 20000;
    public thrustForce: number = 60;

    public life: number = 20000;
    public lifeTime: number = this.life;

    public leadStore: Vec2 = { x: 0, y: 0 }

    update(progress: number): void {
        if (this.lifeTime < 0) this.die(false);
        this.audioUpdate();
        this.flare(progress);
        this.guidance(progress)
        this.turn()
        this.lift();
        this.thrust(progress)
        this.drag();
        this.rotDrag();
        this.phys(progress);
        this.checkCollision();
        this.lifeTime -= progress;
        this.justSpawned = false;
    }

    audioUpdate() {
        if (this.fuel < 0) this.audio.stop();
        const players = GameObject.searchByIdentifier('Player') as Player[];
        if (players.length) {
            const p = players[0];
            const audDV = subVec2(p.velocity, this.velocity);
            const ang = angleBetVecs({ x: 0, y: 0 }, audDV);
            this.audio.setVolume(100 / (distBetVecs(this.position, p.position)))
            this.audio.setPlaybackRate(((rotateVec2(audDV, -ang).x + 400) + 100) / 1800)
        }
    }

    private rotationTarget: number = 0;
    public lostTarget: boolean = false;
    public maxAngle: number = Math.PI / 2;

    flare(progress: number) {
        const flares = GameObject.searchByIdentifier('Flare') as Flare[];
        const players = GameObject.searchByIdentifier('Player') as Player[];
        const heats: Target[] = [...flares, ...players]
        heats.forEach((heatTarget) => {
            const maxAngle = this.maxAngle;
            let angleToFlare = angleBetVecs(this.position, heatTarget.position) - this.rotation - (Math.PI / 2)
            angleToFlare = angleToFlare % (Math.PI * 2);
            if (angleToFlare < 0) angleToFlare += Math.PI * 2;
            if (angleToFlare < maxAngle || angleToFlare > Math.PI * 2 - maxAngle) {
                const num1 = Math.floor(Math.random() * 5000 / progress);
                const num2 = Math.floor(Math.random() * 5000 / progress);
                if (num1 == num2) {
                    this.target = heatTarget;
                };
            }

        })
    }

    public doLead: boolean = true;

    guidance(progress: number) {
        this.fuel -= progress;
        this.guideFuel -= progress;

        const maxAngle = this.maxAngle;
        let angleToTarget = angleBetVecs(this.position, this.target.position) - this.rotation - (Math.PI / 2)
        angleToTarget = angleToTarget % (Math.PI * 2);
        if (angleToTarget < 0) angleToTarget += Math.PI * 2;
        if (angleToTarget > maxAngle && angleToTarget < Math.PI * 2 - maxAngle) {
            if (!this.lostTarget) setTimeout(() => { this.die(false) }, 1000);
            this.lostTarget = true;
        }
        if (this.target.isGarbage) {
            this.lostTarget = true;
        }

        if (this.guideFuel > 0 && !this.lostTarget) {
            const dv = subVec2(this.target.velocity, this.velocity);
            const dist = distBetVecs(this.position, this.target.position);
            const timeToTarget = dist / vecToDist(dv);
            let lead = addVec2(
                this.target.position,
                scaleVec2(this.target.velocity, timeToTarget)
            );
            if (!this.doLead) lead = this.target.position;
            let rotationTarget = angleBetVecs(this.position, lead) - Math.PI / 2
            rotationTarget = rotationTarget % (Math.PI * 2)
            if (rotationTarget < 0) rotationTarget += Math.PI * 2
            this.rotationTarget = rotationTarget;
            if (this.justSpawned) this.rotation = this.rotationTarget;
            this.leadStore = lead;
        }
    }


    thrust(progress: number) {
        if (this.fuel < 0) return
        this.flame(progress);
        this.acceleration =
            addVec2(
                this.acceleration,
                rotateVec2(
                    { x: 0, y: this.thrustForce },
                    this.rotation
                )
            )
    }

    private ROFlame = 10;
    private flameTimer = this.ROFlame;

    flame(progress: number) {
        this.flameTimer -= progress;
        if (this.flameTimer > 0) return;
        this.flameTimer = this.ROFlame;
        new Spark(this.position, addVec2(this.velocity, rotateVec2({ x: 0, y: -2000 }, this.rotation)), 1);
        new Spark(this.position, addVec2(this.velocity, rotateVec2({ x: 0, y: -2000 }, this.rotation)), 1);
    }


    phys(progress: number) {
        const timeS = progress / 1000;
        this.rotVelocity += this.rotAcceleration * timeS
        this.rotation += this.rotVelocity * timeS
        this.rotation = this.rotation % (Math.PI * 2)
        if (this.rotation < 0) this.rotation += Math.PI * 2;

        this.velocity = addVec2(
            this.velocity,
            scaleVec2(this.acceleration, timeS)
        )
        this.position = addVec2(
            this.position,
            scaleVec2(this.velocity, timeS)
        );
        this.acceleration = { x: 0, y: 0 }
        this.rotAcceleration = 0;
    }


    lift() {
        const liftForce: number = rotateVec2(this.velocity, -this.rotation).x * 8;
        const liftVector: Vec2 = { x: -liftForce, y: 0 };
        const liftRotated: Vec2 = rotateVec2(liftVector, this.rotation);
        this.acceleration = addVec2(
            this.acceleration,
            liftRotated
        );
    }

    drag() {
        const drag = scaleVec2(this.velocity, -0.05);
        this.acceleration = addVec2(
            this.acceleration,
            drag
        );
    }


    rotDrag() {
        if (this.lostTarget) return;
        this.rotAcceleration -= this.rotVelocity * 5;
    }


    public turnForce: number = 128;


    turn() {
        if (this.lostTarget) return;
        const deltaTarget = this.rotationTarget - this.rotation;
        const dir = (deltaTarget < 0) ? -1 : 1;
        const turnFalloff = 128;
        const turn = turnFalloff * deltaTarget ** 2 * dir / (turnFalloff * deltaTarget ** 2 + 1);

        const optimalTurnSpeed = 300;
        const vel = vecToDist(this.velocity);
        const falloff = 1 / (160000 * (vel / 2000))
        const speedMult = 1 / (falloff * (vel - optimalTurnSpeed) ** 2 + 1)
        this.rotAcceleration += speedMult * turn * this.turnForce;
    }


    public hitDistance: number = 10;
    

    checkCollision() {
        const searchType = (this.owner == "Player") ? 'AntiAir' : 'Player';
        const enemies = GameObject.searchByIdentifier(searchType) as AntiAir[];
        enemies.forEach((enemy) => {
            const distance = distBetVecs(enemy.position, this.position);
            if (distance < this.hitDistance) {
                this.hit(enemy);
            }
            /*const enemyPoly = polyOffset(enemy.shape, enemy.position);
            if (insidePoly(this.position, enemyPoly)) {
                this.lostTarget = true;
                enemy.damage(20);
                this.die();
            }*/
        })
    }


    hit(enemy: AntiAir){
        this.lostTarget = true;
        enemy.damage(20);
        this.die();
    }


    die(fromHit: boolean = true) {
        this.isGarbage = true;
        Missile.hit.setPlaybackRate(2);
        Missile.hit.play();
        this.audio.stop();
        let factor = (fromHit) ? -0.5 : 1;
        for (let i = 0; i < 20; i++) {
            new Spark(this.position,
                scaleVec2(
                    this.velocity,
                    factor
                )
            )
        }
    }


    draw(ctx: OffscreenCanvasRenderingContext2D): void {
        //const drawPosition = GameObject.gTCanPos(this.position);
        const line = GameObject.gTCanPosPoly([
            addVec2(
                rotateVec2({ x: 0, y: -4 }, this.rotation),
                this.position
            ),
            this.position
        ]);
        pLineV(ctx, line[0], line[1], this.color);
        if (this.guideFuel > 0 && !this.lostTarget) {
            //pLineV(ctx, GameObject.gTCanPos(this.leadStore), GameObject.gTCanPos(this.target.position), `#ffaa0022`);
            //pLineV(ctx, line[0], GameObject.gTCanPos(this.leadStore), `#ffaa0022`);
            //pLineV(ctx, line[0], GameObject.gTCanPos(this.leadStore), `#ffaa0022`,);
            //pLineCircle(ctx, 4, GameObject.gTCanPos(this.leadStore), `#ffaa0022`,)

            pLineV(ctx, line[0], GameObject.gTCanPos(this.target.position), this.lineColor);
            //pTextBasic(ctx, line[0].x, line[0].y - 4, `V:${Math.round(vecToDist(this.velocity))}`, `#ffaa00`);
        }
        //pLineV(ctx, line[0], addVec2(line[0], rotateVec2({x: 0, y: 10}, this.rotation)), `#ffffffaa`);
    }

}


export class MissileMissile extends Missile {
    public color: string = "#ff00ff";
    public lineColor: string = "#ff00ff44";
    public hitDistance: number = 2000; 
    public thrustForce: number = 800;
    public fuel: number = 20000;
    public guideFuel: number = 20000;
    public lifeTime: number = 20000;
    public maxAngle: number = Math.PI * 2;
    public turnForce: number = 128;
    public doLead: boolean = false;
    hit(enemy: AntiAir): void {
        this.lostTarget = true;
        const angle = angleBetVecs(enemy.position, this.position) + Math.PI / 2;
        new Missile(this.position, {x: 0, y: 0}, angle, 'AntiAir', 1000);
        this.die();
    }
}
