import Explosion from "./Explosion";
import GameAudio from "./GameAudio";
import GameObject from "./GameObject";
import { addVec2, polyOffset, Vec2 } from "./Vec2";
import { pPoly, pPolyFill, pPolyFillStip, pTextBasic } from "./pixelRendering";

class AntiAir extends GameObject {
    
    static color: string = "#ff0000";

    static shape: Vec2[] = [
        {x: -5, y: -5},
        {x:  5, y: -5},
        {x:  5, y:  5},
        {x: -5, y:  5}
    ]
    private static explosion: GameAudio = new GameAudio('./assets/sounds/explosion.ogg')

    public position: Vec2;
    private health: number = 100;

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
            AntiAir.explosion.play();
            new Explosion(this.position)
        };
    }


    shoot(progress: number): void {

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
