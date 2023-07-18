import Bullet from "./Bullet";
import Explosion from "./Explosion";
import GameAudio from "./GameAudio";
import GameObject from "./GameObject";
import Missile from "./Missile";
import Player from "./Player";
import { addVec2, angleBetVecs, distBetVecs, polyOffset, scaleVec2, sqrtVec2, Vec2 } from "./Vec2";
import { pDotCircle, pLineCircle, pLineV, pPoly, pPolyFill, pPolyFillStip, pTextBasic } from "./pixelRendering";
import resolution from "./resolution";
import mapSize from "./mapSize";

export class AntiAir extends GameObject {
    static color: string = "#ff0000";
    color: string = AntiAir.color;
    static shootSound: GameAudio = new GameAudio('./assets/sounds/shoot.ogg');
    static shape: Vec2[] = [
        { x: -5, y: -5 },
        { x: 5, y: -5 },
        { x: 5, y: 5 },
        { x: -5, y: 5 }
    ]

    public position: Vec2;
    private health: number = 20;

    private damaged: boolean = false;
    public damage(amount: number) {
        this.health -= amount;
        this.damaged = true;
    }

    constructor(x: number, y: number) {
        AntiAir.shootSound.setPlaybackRate(0.5);
        super();
        this.position = {
            x: x,
            y: y
        }
        this.identifier = "AntiAir"
    }


    update(progress: number): void {
        this.shoot(progress);
        if (this.health <= 0) {
            this.die();
        };
    }

    die() {
        this.isGarbage = true
        setTimeout(() => {
            new AntiAir(mapSize.width * Math.random() - mapSize.width/2, mapSize.height * Math.random() - mapSize.height/2)
            new AntiAir(mapSize.width * Math.random() - mapSize.width/2, mapSize.height * Math.random() - mapSize.height/2)
        }, 4000)
        new Explosion(this.position)
    }

    private static ROF = 15;
    public ROF = AntiAir.ROF;
    private static burstTime = 500;
    private burstTime = AntiAir.burstTime;
    private static burstRest = 4000;
    private burstRest = AntiAir.burstRest;
    public range = 1000;
    private burstTimer = AntiAir.burstTime;
    private resting = false;
    public fireTime = this.ROF;

    shoot(progress: number): void {
        this.burstTimer -= progress;
        if (this.resting) {
            this.hasShot = false;
            if (this.burstTimer < 0) {
                this.resting = false
                this.burstTimer = this.burstTime;
            };
            return;
        }
        if (this.burstTimer < 0) {
            this.resting = true;
            this.burstTimer = this.burstRest;
            this.fireTime = this.ROF;
            return;
        }
        this.fireTime -= progress;
        if (this.fireTime > 0) return;
        this.fireTime = this.ROF;
        const players = GameObject.searchByIdentifier("Player") as Player[];
        players.forEach((player) => {this.fireFunction(player)});
    }


    fireFunction(player: Player) {
        const distance = distBetVecs(player.position, this.position);
        if (distance > this.range) return;
        const lead = this.obtainLead(player, distance)
        this.fireBullet(lead);
    }


    hasShot: boolean = false;
    playerPosStore: Vec2 = { x: 0, y: 0 };
    leadStore: Vec2 = { x: 0, y: 0 };
    projVel = Bullet.lauchVel
    obtainLead(player: Player, distance: number): number {
        this.playerPosStore = player.position;
        this.hasShot = true;
        const timeS = distance / this.projVel;
        let leadPos = addVec2(
            player.position,
            scaleVec2(player.velocity, timeS)
        );
        leadPos = addVec2(
            leadPos,
            scaleVec2(player.accelerationStore, timeS ** 2 / 2)
        )
        this.leadStore = leadPos;
        return angleBetVecs(this.position, leadPos);
    }


    fireBullet(angle: number) {
        new Bullet(
            this.position,
            { x: 0, y: 0 },
            angle - Math.PI / 2,
            "AntiAir"
        );
        AntiAir.shootSound.play();
    }


    draw(ctx: OffscreenCanvasRenderingContext2D): void {
        const localShape = polyOffset(AntiAir.shape, this.position);
        const canvasShape = GameObject.gTCanPosPoly(localShape);
        pPolyFillStip(ctx, canvasShape, this.color);
        const lineColor = (this.damaged) ? "#ffffff" : this.color;
        pPoly(ctx, canvasShape, lineColor);
        const canPos = GameObject.gTCanPos(this.position);
        const offset = GameObject.cameraZoom * 16 + 4
        pTextBasic(ctx, canPos.x - 5, canPos.y - offset, `${this.health}`, lineColor);
        this.damaged = false;
        pLineCircle(ctx, this.range * GameObject.cameraZoom, canPos, "#ff000044", 32);
        this.drawOffscreenMarkers(ctx);
        this.drawLeadMarkers(ctx);
    }

    drawLeadMarkers(ctx: OffscreenCanvasRenderingContext2D) {
        const canPos = GameObject.gTCanPos(this.position);
        if (this.resting) return;
        if (!this.hasShot) return;
        pLineV(ctx, canPos, GameObject.gTCanPos(this.playerPosStore), "#ff000044")
        pLineV(ctx, GameObject.gTCanPos(this.leadStore), GameObject.gTCanPos(this.playerPosStore), "#ff000044")
        pLineCircle(ctx, 2, GameObject.gTCanPos(this.leadStore), "#ff0000ff", 8);
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


export class MissileAAA extends AntiAir {
    color: string = "#ffaa00";
    static shootSound: GameAudio = new GameAudio('./assets/sounds/missileLaunch.ogg')
    constructor(x: number, y: number) {
        MissileAAA.shootSound.setPlaybackRate(2);
        super(x, y);
        this.ROF = 8000;
        this.range = 4000;
    }


    shoot(progress: number): void {
        this.fireTime -= progress;
        if (this.fireTime > 0) return;
        const players = GameObject.searchByIdentifier("Player") as Player[];
        players.forEach((player) => {this.fireFunction(player)});
    }



    fireFunction(player: Player): void {
        this.fireTime = this.ROF;
        const distance = distBetVecs(player.position, this.position);
        if (distance > this.range) return;
        const angle = angleBetVecs(this.position, player.position)
        this.fireMissile(angle, player);      
    }


    fireMissile(angle: number, player: Player): void {
        new Missile(this.position, { x: 0, y: 0 }, angle - Math.PI / 2, 'AntiAir', player)
        MissileAAA.shootSound.play();
    }


    projVel: number = Missile.lauchVel;


    die() {
        this.isGarbage = true
        setTimeout(() => {
            new MissileAAA(mapSize.width * Math.random() - mapSize.width/2, mapSize.height * Math.random() - mapSize.height/2)
            new MissileAAA(mapSize.width * Math.random() - mapSize.width/2, mapSize.height * Math.random() - mapSize.height/2)
        }, 4000)
        new Explosion(this.position)
    }
}
