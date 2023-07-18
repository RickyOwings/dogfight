import GameAudio from "./GameAudio";
import GameObject from "./GameObject";
import Spark from "./Sparks";
import { scaleVec2, addVec2, rotateVec2, Vec2, subVec2, polyOffset } from "./Vec2";
import { insidePoly, pDot, pLineV } from "./pixelRendering";

class Flare extends GameObject {
    public position: Vec2;
    public velocity: Vec2;
    private sound: GameAudio = new GameAudio('./assets/sounds/flare.ogg')
    constructor(pos: Vec2, vel: Vec2) {
        super();
        this.identifier = 'Flare'
        this.position = pos;
        this.velocity = vel;
        this.setZIndex(254);
        this.sound.play();
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

    private life: number = 2000;
    private lifeTime: number = this.life;

    update(progress: number): void {

        new Spark(this.position, this.velocity, 0.5);
        if (this.lifeTime < 0) this.isGarbage = true;

        const timeS = progress / 1000;
        const randomness = 5;

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

export default Flare;
