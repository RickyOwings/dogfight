import GameObject from "./GameObject";
import { addVec2, polyOffset, Vec2 } from "../Utility/Vec2";
import { pPoly, pPolyFill, pPolyFillStip } from "../Utility/pixelRendering";

export class BackgroundElement extends GameObject {
    
    static color: string = "#0a0a0a";

    private position: Vec2;
    private shape: Vec2[];

    constructor(pos: Vec2, shape: Vec2[]){
        super();
        this.setZIndex(-50);
        this.position = pos;
        this.shape = shape;
    }

    draw(ctx: OffscreenCanvasRenderingContext2D): void {
        const localShape = polyOffset(this.shape, this.position);
        const canvasShape = GameObject.gTCanPosPoly(localShape);
        pPolyFill(ctx, canvasShape, BackgroundElement.color);
    }
}

