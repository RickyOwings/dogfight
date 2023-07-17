import { AntiAir } from "./AntiAir";
import GameAudio from "./GameAudio";
import GameObject from "./GameObject";
import Spark from "./Sparks";
import { scaleVec2, addVec2, rotateVec2, Vec2, subVec2, polyOffset } from "./Vec2";
import { insidePoly, pDot, pLineV } from "./pixelRendering";

class Bullet extends GameObject {
    public static lauchVel: number = 600;
    private static color: string = "#ffffff";
    private static dispersion: number = 0.02;
    private static hit: GameAudio = new GameAudio('./assets/sounds/hit.ogg')

    private position: Vec2;
    private velocity: Vec2;
    private owner: string;

    constructor(pos: Vec2, vel: Vec2, angle: number, owner: string) {
        super();
        this.position = pos;
        this.velocity = addVec2(vel, rotateVec2(
            { x: 0, y: Bullet.lauchVel }, angle + Math.random() * Bullet.dispersion - 0.5 * Bullet.dispersion
        ));
        this.owner = owner;
        this.setZIndex(254);
        this.identifier = "Bullet";
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
        pLineV(ctx, line[0], line[1], `rgba(255,255,255,${this.lifeTime / this.life})`);
    }

    private life: number = 1 * 1000 + (Math.random() * 2000);
    private lifeTime: number = this.life;

    update(progress: number): void {

        if (this.lifeTime < 0) this.isGarbage = true;

        const timeS = progress / 1000;

        /*this.velocity = subVec2(
            this.velocity,
            scaleVec2(this.velocity, timeS * 0.3)
        )*/

        // adjusting the position by the velocity
        this.position = addVec2(
            this.position,
            scaleVec2(this.velocity, timeS)
        );
        this.checkCollision();
        this.lifeTime -= progress;
    }


    checkCollision() {
        const searchType = (this.owner == "Player") ? 'AntiAir' : 'Player';

        const enemies = GameObject.searchByIdentifier(searchType) as AntiAir[];
        enemies.forEach((enemy) => {
            const enemyPoly = polyOffset(AntiAir.shape, enemy.position);
            if (insidePoly(this.position, enemyPoly)) {
                Bullet.hit.play();
                enemy.damage(1);
                this.isGarbage = true;
                new Spark(this.position,
                    scaleVec2(
                        this.velocity,
                        -0.5
                    )
                )
            }
        })
    }


}

export default Bullet;
