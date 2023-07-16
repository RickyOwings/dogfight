import Bullet from "./Bullet";
import Explosion from "./Explosion";
import GameAudio from "./GameAudio";
import GameObject from "./GameObject";
import Player from "./Player";
import { addVec2, angleBetVecs, distBetVecs, polyOffset, scaleVec2, Vec2 } from "./Vec2";
import { pPoly, pPolyFill, pPolyFillStip, pTextBasic } from "./pixelRendering";

class AntiAir extends GameObject {
    
    static color: string = "#ff0000";

    static shape: Vec2[] = [
        {x: -5, y: -5},
        {x:  5, y: -5},
        {x:  5, y:  5},
        {x: -5, y:  5}
    ]

    public position: Vec2;
    private health: number = 20;

    private damaged: boolean = false;
    public damage(amount: number){
        this.health -= amount;
        this.damaged = true;
    }

    constructor(x: number, y: number){
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
            this.isGarbage = true
            setTimeout(()=>{
                new AntiAir(6000 * Math.random() - 3000, 6000 * Math.random() - 3000)
                new AntiAir(6000 * Math.random() - 3000, 6000 * Math.random() - 3000)
            }, 4000)
            new Explosion(this.position)
        };
    }

    private static ROF = 30;
    private static burstTime = 1000;
    private static burstRest = 3000; 
    private static range = 500;
    private burstTimer = AntiAir.burstTime;
    private resting = false;
    private fireTime = AntiAir.ROF;

    shoot(progress: number): void {
        this.burstTimer -= progress;
        if (this.resting){
            if (this.burstTimer < 0) {
                this.resting = false
                this.burstTimer = AntiAir.burstTime;
            };
            return;
        }
        if (this.burstTimer < 0) {
            this.resting = true;
            this.burstTimer = AntiAir.burstRest;
            this.fireTime = AntiAir.ROF;
            return;
        }
        this.fireTime -= progress;
        if (this.fireTime > 0) return;
        this.fireTime = AntiAir.ROF;
        const players = GameObject.searchByIdentifier("Player") as Player[];
        players.forEach((player)=>{
            const distance = distBetVecs(player.position, this.position);
            if (distance > AntiAir.range) return; 
            const lead = this.obtainLead(player, progress, distance)
            this.fireBullet(lead);
        });
    }


    obtainLead(player: Player, progress: number, distance: number): number {
        const timeS = progress / 1000;
        const leadPos = addVec2(
            player.position,
            scaleVec2(player.velocity, distance * 8 /(progress * Bullet.lauchVel))
        );
        return angleBetVecs(this.position, leadPos);
    } 


    fireBullet(angle: number){
        new Bullet(
            this.position, 
            {x: 0, y: 0},
            angle - Math.PI / 2,
            "AntiAir"
        )
    }


    draw(ctx: OffscreenCanvasRenderingContext2D): void {
        const localShape = polyOffset(AntiAir.shape, this.position);
        const canvasShape = GameObject.gTCanPosPoly(localShape);
        pPolyFillStip(ctx, canvasShape, "#ff5555");
        const lineColor = (this.damaged) ? "#ffffff" : AntiAir.color;
        pPoly(ctx, canvasShape, lineColor);
        const canPos = GameObject.gTCanPos(this.position);
        const offset = GameObject.cameraZoom * 16 + 4
        pTextBasic(ctx, canPos.x - 5, canPos.y - offset, `${this.health}`, lineColor)
        this.damaged = false;
    }
}

export default AntiAir;
