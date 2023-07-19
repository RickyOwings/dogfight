import GameObject from "./GameObject";
import { scaleVec2, addVec2, rotateVec2, Vec2, subVec2, polyOffset } from "../Utility/Vec2";
import { insidePoly, pDot, pLineV } from "../Utility/pixelRendering";

class Spark extends GameObject {
    private position: Vec2;
    private velocity: Vec2;
    private rand: number;

    constructor(pos: Vec2, vel: Vec2, rand: number = 5) {
        super();
        this.position = pos;
        const startRand = 60 * rand;
        this.velocity = addVec2(
            scaleVec2(vel, 0.5),
            {
                x: Math.random() * startRand - startRand / 2,
                y: Math.random() * startRand - startRand / 2,
            }
        )
        this.setZIndex(254);
        this.rand = rand;
    }


    draw(ctx: OffscreenCanvasRenderingContext2D): void {
        //const drawPosition = GameObject.gTCanPos(this.position);
        const line = GameObject.gTCanPosPoly([
            addVec2(
                scaleVec2(this.velocity, 0.01),
                this.position
            ),
            this.position
        ]);
        pLineV(ctx, line[0], line[1], `rgba(255, ${this.lifeTime * 205 / this.life + 50}, ${this.lifeTime * 400 / this.life - 200 } , ${this.lifeTime / this.life})`);
    }

    private life: number = 500 + Math.random() * 300;
    private lifeTime: number = this.life;

    update(progress: number): void {

        if (this.lifeTime < 0) this.isGarbage = true;

        const timeS = progress / 1000;
        const randomness = this.rand;

        this.velocity = addVec2(
            this.velocity,
            {
                x: Math.random() * progress * randomness - 0.5 * progress * randomness,
                y: Math.random() * progress * randomness - 0.5 * progress * randomness
            }
        )

        this.velocity = subVec2(
            this.velocity,
            scaleVec2(this.velocity, timeS)
        )

        // adjusting the position by the velocity
        this.position = addVec2(
            this.position,
            scaleVec2(this.velocity, timeS)
        );
        this.lifeTime -= progress;
    }
}

export default Spark;
