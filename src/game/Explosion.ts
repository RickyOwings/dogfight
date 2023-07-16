import GameObject from "./GameObject";
import Spark from "./Sparks";
import { addVec2, polyOffset, polyScale, Vec2 } from "./Vec2";
import { pPoly, pPolyFill, pPolyFillStip, pTextBasic } from "./pixelRendering";

class Explosion extends GameObject {
    
    static color: string = "#ffaa00";
    static shape: Vec2[] = [
        {x: -5, y: 10},
        {x:  0, y:  6},
        {x:  5, y:  9},
        {x:  3, y:  3},
        {x:  7, y: -3},
        {x:  1, y:  0},
        {x:  0, y: -8},
        {x: -3, y:  0},
        {x:-10, y:  0},
        {x: -4, y:  4},
    ]

    private position: Vec2;

    constructor(pos: Vec2){
        super();
        this.setZIndex(100);
        for (let i = 0; i < 50; i++){
            new Spark(pos, {x: 0, y: 0});
        }
        this.position = pos;
    }

    private static time: number = 100;
    private lifeTime: number = Explosion.time;
    private scale: number = 1;

    update(progress: number): void {
        if (this.lifeTime < 0) this.isGarbage = true;
        this.scale += progress / Explosion.time;
        this.lifeTime -= progress; 
    }


    draw(ctx: OffscreenCanvasRenderingContext2D): void {
        const scaled = polyScale(Explosion.shape, this.scale);
        const inner = polyScale(scaled, 0.5);
        const localShape = polyOffset(scaled, this.position);
        const localShapeInner = polyOffset(inner, this.position);
        const canvasShape = GameObject.gTCanPosPoly(localShape);
        const canvasShapeInner = GameObject.gTCanPosPoly(localShapeInner);
        pPolyFillStip(ctx, canvasShape, Explosion.color);
        pPolyFill(ctx, canvasShapeInner, '#ffccdd');
        pPoly(ctx, canvasShape, Explosion.color);

        pTextBasic()
    }
}

export default Explosion;
