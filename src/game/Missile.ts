import { AntiAir } from "./AntiAir";
import GameAudio from "./GameAudio";
import GameObject from "./GameObject";
import Player from "./Player";
import Spark from "./Sparks";
import { scaleVec2, addVec2, rotateVec2, Vec2, subVec2, polyOffset, angleBetVecs, distBetVecs, vecToDist } from "./Vec2";
import { insidePoly, pDot, pLineCircle, pLineV } from "./pixelRendering";

class Missile extends GameObject {
    public static lauchVel: number = 300;
    private static color: string = "#ffffff";
    private static dispersion: number = 0.02;
    private static hit: GameAudio = new GameAudio('./assets/sounds/explosion.ogg')

    private position: Vec2;
    private velocity: Vec2;
    private acceleration: Vec2 = { x: 0, y: 0 };
    private rotation: number = 0;
    private owner: string;
    private target: Player;
    private audio: GameAudio;

    constructor(pos: Vec2, vel: Vec2, angle: number, owner: string, target: Player) {
        super();
        this.position = pos;
        this.rotation = angle;
        this.velocity = addVec2(vel, rotateVec2(
            { x: 0, y: Missile.lauchVel }, angle + Math.random() * Missile.dispersion - 0.5 * Missile.dispersion
        ));
        this.owner = owner;
        this.setZIndex(254);
        this.identifier = "Missile";
        this.target = target;
        this.audio = new GameAudio('./assets/sounds/wind.ogg');
        this.audio.setPlaybackRate(4);
        this.audio.setVolume(0.1);
        this.audio.loop();
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
        pLineV(ctx, line[0], line[1], `#ffaa00`);
        if (this.guideFuel > 0) {
            pLineV(ctx, GameObject.gTCanPos(this.leadStore), GameObject.gTCanPos(this.target.position), `#ffaa0022`);
            pLineV(ctx, line[0], GameObject.gTCanPos(this.leadStore), `#ffaa0022`);
            pLineV(ctx, line[0], GameObject.gTCanPos(this.leadStore), `#ffaa0022`,);
            pLineCircle(ctx, 4, GameObject.gTCanPos(this.leadStore), `#ffaa0022`,)
        }
        //pLineV(ctx, line[0], addVec2(line[0], rotateVec2({x: 0, y: 10}, this.rotation)), `#ffffffaa`);
    }

    private fuel: number = 5000;
    private guideFuel: number = 10000;

    private life: number = 20000;
    private lifeTime: number = this.life;

    private leadStore: Vec2 = { x: 0, y: 0 }

    update(progress: number): void {
        this.fuel -= progress;
        this.guideFuel -= progress;
        if (this.fuel < 0) this.audio.stop();

        this.audio.setVolume(100 / (distBetVecs(this.position, this.target.position)))
        this.audio.setPlaybackRate(this.fuel * 4 / 5000);

        if (this.lifeTime < 0) this.die();
        const timeS = progress / 1000;
        if (this.guideFuel > 0) {
            const dv = subVec2(this.target.velocity, this.velocity);
            const dist = distBetVecs(this.position, this.target.position);
            const timeToTarget = dist / vecToDist(dv);

            const lead = addVec2(
                this.target.position,
                scaleVec2(this.target.velocity, timeToTarget)
            );
            this.rotation = angleBetVecs(this.position, lead) - Math.PI / 2
            this.leadStore = lead;
        }

        this.lift();

        if (this.fuel > 0) {
            new Spark(this.position, addVec2(this.velocity, rotateVec2({ x: 0, y: -4000 }, this.rotation)));
            this.acceleration =
                addVec2(
                    this.acceleration,
                    rotateVec2(
                        { x: 0, y: 30 },
                        this.rotation
                    )
                )
        }

        this.drag();

        this.velocity = addVec2(
            this.velocity,
            scaleVec2(this.acceleration, timeS)
        )

        this.position = addVec2(
            this.position,
            scaleVec2(this.velocity, timeS)
        );
        this.acceleration = { x: 0, y: 0 }
        this.checkCollision();
        this.lifeTime -= progress;
    }

    lift() {
        const liftForce: number = rotateVec2(this.velocity, -this.rotation).x * 8;

        console.log(liftForce)

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


    checkCollision() {
        const searchType = (this.owner == "Player") ? 'AntiAir' : 'Player';

        const enemies = GameObject.searchByIdentifier(searchType) as AntiAir[];
        enemies.forEach((enemy) => {
            const enemyPoly = polyOffset(AntiAir.shape, enemy.position);
            if (insidePoly(this.position, enemyPoly)) {
                Missile.hit.setPlaybackRate(2);
                Missile.hit.play();
                enemy.damage(20);
                this.die();
            }
        })
    }
    die() {
        this.isGarbage = true;
        this.audio.stop();
        for (let i = 0; i < 20; i++) {
            new Spark(this.position,
                scaleVec2(
                    this.velocity,
                    -0.5
                )
            )
        }
    }


}

export default Missile;
