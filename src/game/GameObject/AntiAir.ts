import Bullet from "./Bullet";
import Explosion from "./Explosion";
import GameAudio from "../Utility/GameAudio";
import GameObject from "./GameObject";
import { Missile, MissileMissile } from "./Missile";
import Player from "./Player";
import { addVec2, angleBetVecs, distBetVecs, polyOffset, scaleVec2, sqrtVec2, Vec2 } from "../Utility/Vec2";
import { pDotCircle, pLine, pLineCircle, pLineV, pPoly, pPolyFill, pPolyFillStip, pTextBasic } from "../Utility/pixelRendering";
import resolution from "../OnetimeOrShared/resolution";
import mapSize from "../OnetimeOrShared/mapSize";

interface BaseAntiAirParams {
    position: Vec2,
    identifier: string,
    color?: string,
    rangeColor?: string,
    shape?: Vec2[],
    health?: number,
    range?: number,
    burstTime?: number,
    ROF?: number,
    restTime?: number,
    dieFunction?: () => void,
    fireFunction?: (position: Vec2, angle: number) => void,
    targetIdentifier?: string
    projectileVelocity?: number
}


interface Target {
    position: Vec2,
    velocity: Vec2,
    acceleration: Vec2,
    accelerationStore: Vec2,
    getAcceleration: () => Vec2,
}

// extensible anti air class
export class BaseAntiAir extends GameObject {
    public color: string;
    public rangeColor: string;
    public health: number;
    public damaged: boolean = false;
    public shape: Vec2[];
    public ROF: number;
    public burstTime: number;
    public restTime: number;
    public range: number;
    public burstTimer: number;
    public fireTimer: number;
    public resting: boolean = false;
    public dieFunction: () => void;
    public fireFunction: (position: Vec2, angle: number) => void;
    public targetIdentifier: string;
    public projectileVelocity: number;

    // function which damages self by amount
    public damage(amount: number) {
        this.health -= amount;
        this.damaged = true; // this get reset at the end of update
    }

    constructor({
        position,
        identifier,
        color = "#ff0000",
        rangeColor = "#ff000044",
        shape = [
            { x: -5, y: -5 },
            { x: 5, y: -5 },
            { x: 5, y: 5 },
            { x: -5, y: 5 }
        ],
        health = 20,
        range = 1000,
        burstTime = 500,
        ROF = 30,
        restTime = 3000,
        dieFunction = () => { },
        fireFunction = (position, angle: number) => { console.log(`Fired from ${position} at an angle of ${angle}`) },
        targetIdentifier = "Player",
        projectileVelocity = Bullet.lauchVel
    }: BaseAntiAirParams) {
        super();

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


    update(progress: number): void {
        this.burst(progress);
        if (this.health <= 0) {
            this.die();
        };
    }


    die() {
        if (this.isGarbage) return;
        this.isGarbage = true
        setTimeout(this.dieFunction, 4000)
        new Explosion(this.position)
    }


    burst(progress: number): void {
        if (this.burstTime > 0) this.burstTimer -= progress;
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


    fire(progress: number): void {
        this.fireTimer -= progress;
        if (this.fireTimer <= 0) {
            this.fireTimer = this.ROF;
            const targets = GameObject.searchByIdentifier(this.targetIdentifier) as Target[];
            for (let i = 0; i < targets.length; i++) {
                const worked: boolean = this.tryFire(targets[i]);
                if (worked) return;
            }
        }
    }

    public targetPosStore: Vec2;
    tryFire(target: Target): boolean {
        const distance = distBetVecs(target.position, this.position);
        if (distance > this.range) return false;
        this.targetPosStore = target.position;
        const lead = this.obtainLead(target, distance);
        this.fireProjectile(lead);
        return true;
    }

    public leadStore: Vec2;
    obtainLead(target: Target, distance: number): number {
        const timeS = distance / this.projectileVelocity;
        let leadPos = addVec2(
            target.position,
            scaleVec2(target.velocity, timeS)
        );
        leadPos = addVec2(
            leadPos,
            scaleVec2(target.accelerationStore, timeS ** 2 / 2)
        )
        this.leadStore = leadPos;
        return angleBetVecs(this.position, leadPos);
    }


    fireProjectile(angle: number) {
        const adustedAngle = angle - Math.PI / 2;
        this.fireFunction(this.position, adustedAngle);
    }


    draw(ctx: OffscreenCanvasRenderingContext2D): void {
        const localShape = polyOffset(this.shape, this.position);
        const canvasShape = GameObject.gTCanPosPoly(localShape);
        pPolyFillStip(ctx, canvasShape, this.color);
        const lineColor = (this.damaged) ? "#ffffff" : this.color;
        pPoly(ctx, canvasShape, lineColor);
        const canPos = GameObject.gTCanPos(this.position);
        const offset = GameObject.cameraZoom * 16 + 4
        pTextBasic(ctx, canPos.x - 5, canPos.y - offset, `${this.health}`, lineColor);
        pLineCircle(ctx, this.range * GameObject.cameraZoom, canPos, this.rangeColor, 32);
        this.drawOffscreenMarkers(ctx);
        this.damaged = false;
    }

    drawOffscreenMarkers(ctx: OffscreenCanvasRenderingContext2D) {

        const canPos = GameObject.gTCanPos(this.position);
        const lineColor = (this.damaged) ? "#ffffff" : this.color;
        const markerWidth = 10;

        // topLeft
        if (canPos.x < 0 && canPos.y < 0) {
            pPoly(ctx, [{ x: 0, y: 0 }, { x: markerWidth, y: markerWidth }], lineColor);
        }
        // topRight
        if (canPos.x > resolution.width && canPos.y < 0) {
            pPoly(ctx, [{ x: resolution.width, y: 0 }, { x: resolution.width - markerWidth, y: markerWidth }], lineColor);
        }

        // bottomLeft
        if (canPos.x < 0 && canPos.y > resolution.height) {
            pPoly(ctx, [{ x: 0, y: resolution.height }, { x: markerWidth, y: resolution.height - markerWidth }], lineColor);
        }

        // bottomRight
        if (canPos.x > resolution.width && canPos.y > resolution.height) {
            pPoly(ctx, [{ x: resolution.width, y: resolution.height }, { x: resolution.width - markerWidth, y: resolution.height - markerWidth }], lineColor);
        }

        if (canPos.x < 0) {
            pPoly(ctx, [{ x: 0, y: canPos.y }, { x: markerWidth, y: canPos.y }], lineColor);
        }

        if (canPos.x > resolution.width) {
            pPoly(ctx, [{ x: resolution.width, y: canPos.y }, { x: resolution.width - markerWidth, y: canPos.y }], lineColor);
        }

        if (canPos.y < 0) {
            pPoly(ctx, [{ x: canPos.x, y: 0 }, { x: canPos.x, y: markerWidth }], lineColor);
        }

        if (canPos.y > resolution.height) {
            pPoly(ctx, [{ x: canPos.x, y: resolution.height }, { x: canPos.x, y: resolution.height - markerWidth }], lineColor);
        }
    }

}

export class AntiAir extends BaseAntiAir {
    static shootSound: GameAudio = new GameAudio('./assets/sounds/shoot.ogg');
    constructor(x: number, y: number) {
        AntiAir.shootSound.setPlaybackRate(0.5);
        super({
            position: { x: x, y: y },
            identifier: "AntiAir",
            color: "#ff0000",
            rangeColor: "#ff000044",
            dieFunction: () => {
                let x1 = Math.random() * mapSize.width - mapSize.width / 2;
                let y1 = Math.random() * mapSize.height - mapSize.height / 2;
                let x2 = Math.random() * mapSize.width - mapSize.width / 2;
                let y2 = Math.random() * mapSize.height - mapSize.height / 2;
                new AntiAir(x1, y1);
                new AntiAir(x2, y2);
            },
            fireFunction: (position: Vec2, angle: number) => {
                new Bullet(position, { x: 0, y: 0 }, angle, "AntiAir");
                AntiAir.shootSound.play();
            },
            projectileVelocity: Bullet.lauchVel
        });
    }
    draw(ctx: OffscreenCanvasRenderingContext2D) {
        super.draw(ctx);
        if (this.leadStore && this.targetPosStore && !this.resting) {
            pLineV(ctx, GameObject.gTCanPos(this.position), GameObject.gTCanPos(this.leadStore), this.rangeColor);
            pLineCircle(ctx, 2, GameObject.gTCanPos(this.leadStore), this.rangeColor, 4);
        }
    }

}

export class MissileLauncher extends BaseAntiAir {
    static shootSound: GameAudio = new GameAudio('./assets/sounds/missileLaunch.ogg');
    constructor(x: number, y: number) {
        AntiAir.shootSound.setPlaybackRate(0.5);
        super({
            position: { x: x, y: y },
            identifier: "AntiAir",
            color: "#ffaa00",
            rangeColor: "#ffaa0044",
            range: 2000,
            ROF: 8000,
            restTime: 0,
            dieFunction: () => {
                let x1 = Math.random() * mapSize.width - mapSize.width / 2;
                let y1 = Math.random() * mapSize.height - mapSize.height / 2;
                let x2 = Math.random() * mapSize.width - mapSize.width / 2;
                let y2 = Math.random() * mapSize.height - mapSize.height / 2;
                new MissileLauncher(x1, y1);
                new MissileLauncher(x2, y2);
            },
            fireFunction: (position: Vec2, angle: number) => {
                new Missile(position, { x: 0, y: 0 }, angle, "AntiAir");
                MissileLauncher.shootSound.play();
            },
            projectileVelocity: Bullet.lauchVel
        });
    }
}


export class MissileYeeter extends BaseAntiAir {
    static shootSound: GameAudio = new GameAudio('./assets/sounds/missileLaunch.ogg');
    constructor(x: number, y: number) {
        AntiAir.shootSound.setPlaybackRate(0.5);
        super({
            position: { x: x, y: y },
            identifier: "AntiAir",
            color: "#ffff00",
            rangeColor: "#ffff0044",
            range: 8000,
            ROF: 16000,
            restTime: 0,
            dieFunction: () => {
                let x1 = Math.random() * mapSize.width - mapSize.width / 2;
                let y1 = Math.random() * mapSize.height - mapSize.height / 2;
                let x2 = Math.random() * mapSize.width - mapSize.width / 2;
                let y2 = Math.random() * mapSize.height - mapSize.height / 2;
                new MissileYeeter(x1, y1);
                new MissileYeeter(x2, y2);
            },
            fireFunction: (position: Vec2, angle: number) => {
                new Missile(position, { x: 0, y: 0 }, angle, "AntiAir", 1000);
                new Missile(position, { x: 0, y: 0 }, angle + Math.PI / 8, "AntiAir", 1000);
                new Missile(position, { x: 0, y: 0 }, angle - Math.PI / 8, "AntiAir", 1000);
                MissileLauncher.shootSound.play();
            },
            projectileVelocity: 1000000
        });
    }
}

export class MissileLauncherLauncher extends BaseAntiAir {
    static shootSound: GameAudio = new GameAudio('./assets/sounds/missileLaunch.ogg');
    constructor(x: number, y: number) {
        AntiAir.shootSound.setPlaybackRate(0.5);
        super({
            position: { x: x, y: y },
            identifier: "AntiAir",
            color: "#ff00ff",
            rangeColor: "#ff00ff44",
            range: 16000,
            ROF: 32000,
            restTime: 0,
            dieFunction: () => {
                let x1 = Math.random() * mapSize.width - mapSize.width / 2;
                let y1 = Math.random() * mapSize.height - mapSize.height / 2;
                let x2 = Math.random() * mapSize.width - mapSize.width / 2;
                let y2 = Math.random() * mapSize.height - mapSize.height / 2;
                new MissileLauncherLauncher(x1, y1);
                new MissileLauncherLauncher(x2, y2);
            },
            fireFunction: (position: Vec2, angle: number) => {
                new MissileMissile(position, { x: 0, y: 0 }, angle, "AntiAir", 100);
                MissileLauncher.shootSound.play();
            },
            projectileVelocity: 1000000
        });
    }
}
