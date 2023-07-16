import Bullet from './Bullet';
import GameObject from './GameObject';
import Input from './input';
import { pLineV, pPoly, pPolyFill, pPolyFillStip, pTextBasic } from './pixelRendering';
import { Vec2, polyOffset, polyRotate, addVec2, scaleVec2, rotateVec2, vecToDist, subVec2 } from './Vec2';
import GameAudio from './GameAudio';



class Player extends GameObject {

    static input: Input = new Input(['w', 'a', 's', 'd', '-', '=', '0', 'j', 'k']);

    static shootSound: GameAudio = new GameAudio('./assets/sounds/shoot.ogg');
    static moveSound: GameAudio = new GameAudio('./assets/sounds/move.ogg');
    static airbrakeSound: GameAudio = new GameAudio('./assets/sounds/airbrake.ogg');
    static windSound: GameAudio = new GameAudio('./assets/sounds/wind.ogg');

    static shape: Vec2[] = [
        { x: 0, y: 5 },
        { x: -3, y: -5 },
        { x: 3, y: -5 },
    ]

    static color: string = "#00ff00";

    private position: Vec2;
    private velocity: Vec2 = { x: 0, y: 0 };
    private acceleration: Vec2 = { x: 0, y: 0 };

    private accelerationStore: Vec2 = { x: 0, y: 0 };

    private rotation: number = 0;
    private rotVelocity: number = 0;
    private rotAcceleration: number = 0;

    constructor(x: number, y: number) {
        super();
        this.setZIndex(255);
        this.position = {
            x: x,
            y: y
        }
        this.identifier = "Player";
        Player.moveSound.loop();
        Player.moveSound.setVolume(0.05);
        Player.airbrakeSound.setVolume(0);
        Player.airbrakeSound.loop();
        Player.windSound.setVolume(0);
        Player.windSound.loop();
    }

    private static zoomState = 1;
    private progressStore: number = 11;
    update(progress: number) {
        this.setPlaybackRate();
        this.thrust();
        this.drag();
        this.turn();
        this.rotDrag();
        this.lift();
        this.accelerationStore = scaleVec2(this.acceleration, 1);
        this.phys(progress);
        this.shoot(progress);

        this.progressStore = progress;

        const out = (Player.input.isPressed('-')) ? 1 : 0;
        const zoom = (Player.input.isPressed('=')) ? 1 : 0;
        const reset = (Player.input.isPressed('0')) ? 1 : 0;

        if (out) Player.zoomState = 0.25;
        if (zoom) Player.zoomState = 3;
        if (reset) Player.zoomState = 1;

        GameObject.setCameraZoom(
              (1 - (7 * (vecToDist(this.velocity) / 7500 ))) * Player.zoomState
        )

        const zoomFactor = (Player.zoomState == 0.25) ? 0 : 0.25 / GameObject.cameraZoom;

        const cameraPos: Vec2 = addVec2(
            this.position,
            scaleVec2(this.velocity, zoomFactor)
        );

        GameObject.setCameraPosition(cameraPos.x, cameraPos.y)
    }


    setPlaybackRate(){
        let playbackRate = vecToDist(this.velocity) / 150;
        if (playbackRate < 0.25) playbackRate = 0.25;
        if (playbackRate > 4) playbackRate = 16;
        Player.moveSound.setPlaybackRate(playbackRate);
    }


    thrust() {
        const w = (Player.input.isPressed('w')) ? 1 : 0;
        const s = (Player.input.isPressed('s')) ? 1 : 0;
        const factor = 12.5 * (w - s) + 25;

        const force: Vec2 = { x: 0, y: factor };
        const forceRot = rotateVec2(force, this.rotation);
        this.acceleration = addVec2(
            this.acceleration,
            forceRot
        );
    }


    drag() {
        const chute = (Player.input.isPressed('k')) ? 1 : 0;
        if (chute) Player.airbrakeSound.setVolume(vecToDist(this.acceleration) / 60);
        else Player.airbrakeSound.setVolume(0);
        const drag = scaleVec2(this.velocity, -0.05 - 0.4 * chute);
        this.acceleration = addVec2(
            this.acceleration,
            drag
        );
    }


    private turnFacStore: number = 0;
    turn() {
        const a = (Player.input.isPressed('a')) ? 1 : 0;
        const d = (Player.input.isPressed('d')) ? 1 : 0;

        const optimalTurnSpeed = 75;
        const vel = vecToDist(this.velocity);
        const falloff = 1 / (250000 * (vel / 2000))
        const speedMult = 1 / (falloff * (vel - optimalTurnSpeed) ** 2 + 1)

        this.turnFacStore = speedMult;

        const turnFactor = (d - a) * 8;
        this.rotAcceleration += turnFactor * speedMult;
    }


    rotDrag() {
        this.rotAcceleration -= this.rotVelocity * 5;
    }


    private liftStore = 0;
    lift() {
        const liftForce: number = rotateVec2(this.velocity, -this.rotation).x * 4

        Player.windSound.setVolume(Math.abs(liftForce) / 200);

        this.liftStore = liftForce;

        const liftVector: Vec2 = { x: -liftForce, y: 0 };
        const liftRotated: Vec2 = rotateVec2(liftVector, this.rotation);
        this.acceleration = addVec2(
            this.acceleration,
            liftRotated
        );
    }


    phys(progress: number) {
        const timeS = progress / 1000;

        // rotational physics
        this.rotVelocity += this.rotAcceleration * timeS;
        this.rotation += this.rotVelocity * timeS;

        // adjusting the velocity by the acceleration
        this.velocity = addVec2(
            this.velocity,
            scaleVec2(this.acceleration, timeS)
        );

        // adjusting the position by the velocity
        this.position = addVec2(
            this.position,
            scaleVec2(this.velocity, timeS)
        );


        // accelerations to zero
        this.rotAcceleration = 0;
        this.acceleration = { x: 0, y: 0 };
    }


    private static ROF = 60;
    private fireTimer = Player.ROF;

    shoot(progress: number) {
        if (this.fireTimer > 0) {
            this.fireTimer -= progress;
            return;
        }


        if (Player.input.isPressed('j')) {
            this.fireTimer = Player.ROF;
            new Bullet(this.position, this.velocity, this.rotation, "Player")
            Player.shootSound.play();
            this.acceleration = subVec2(
                this.acceleration,
                scaleVec2(
                    this.velocity,
                    2
                )
            )

        }
    }


    draw(ctx: OffscreenCanvasRenderingContext2D) {
        // drawing the player
        const rotated = polyRotate(Player.shape, this.rotation);
        const translated = polyOffset(rotated, this.position);
        const toCanvas = GameObject.gTCanPosPoly(translated);

        pPolyFillStip(ctx, toCanvas, Player.color);
        pPoly(ctx, toCanvas, Player.color);

        const lift = [
            this.position,
            addVec2(
                this.position,
                rotateVec2(
                    { x: -this.liftStore * 0.1, y: 0 },
                    this.rotation
                )
            )
        ];
        const liftToCanvas = GameObject.gTCanPosPoly(lift);
        pLineV(ctx, liftToCanvas[0], liftToCanvas[1], "#00ffff11");

        const prograde = [
            this.position,
            addVec2(
                this.position,
                scaleVec2(this.velocity, 0.2)
            )
        ];

        const progradeToCanvas = GameObject.gTCanPosPoly(prograde);
        pLineV(ctx, progradeToCanvas[0], progradeToCanvas[1], "#ffff0011");

        const aim = [
            this.position,
            addVec2(
                this.position,
                rotateVec2(
                    { x: 0, y: 2000 },
                    this.rotation
                )
            )
        ];

        const aimToCanvas = GameObject.gTCanPosPoly(aim);
        pLineV(ctx, aimToCanvas[0], aimToCanvas[1], "#ffffff11")

        // textElements
        pTextBasic(ctx, 0, 0, `PLAYER STATS`, '#ffffff')
        pTextBasic(ctx, 0, 6, `ACCEL: ${Math.floor(vecToDist(this.accelerationStore))}`, '#ffff00')
        pTextBasic(ctx, 0, 12, `VEL: ${Math.floor(vecToDist(this.velocity))}`, '#0000ff')
        pTextBasic(ctx, 0, 18, `POS: X:${Math.floor(this.position.x)} Y:${Math.floor(this.position.y)}`, '#ff0000')
        pTextBasic(ctx, 0, 24, `TURN: ${Math.floor(this.turnFacStore * 100) / 100}`, '#ff00ff')
        pTextBasic(ctx, 0, 30, `FPS: ${Math.floor(1000 / this.progressStore)}`, '#00ff00')

    }
}

export default Player;
