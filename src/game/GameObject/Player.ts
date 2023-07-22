import Bullet from './Bullet';
import GameObject from './GameObject';
import Input from '../Utility/input';
import { pLineV, pPoly, pPolyFill, pPolyFillStip, pTextBasic } from '../Utility/pixelRendering';
import { Vec2, polyOffset, polyRotate, addVec2, scaleVec2, rotateVec2, vecToDist, subVec2, distBetVecs } from '../Utility/Vec2';
import GameAudio from '../Utility/GameAudio';
import Explosion from './Explosion';
import Flare from './Flare';
import resolution from '../OnetimeOrShared/resolution';



class Player extends GameObject {

    static input: Input = new Input(['w', 'a', 's', 'd', '-', '=', '0', 'j', 'k', ' ', 'i']);

    static shootSound: GameAudio = new GameAudio('./assets/sounds/shoot.ogg');
    static moveSound: GameAudio = new GameAudio('./assets/sounds/move.ogg');
    static airbrakeSound: GameAudio = new GameAudio('./assets/sounds/airbrake.ogg');
    static windSound: GameAudio = new GameAudio('./assets/sounds/wind.ogg');
    static damageSound: GameAudio = new GameAudio('./assets/sounds/playerDamage.ogg');
    static flaresLoaded: GameAudio = new GameAudio('./assets/sounds/flaresLoaded.ogg');
    static outOfFlares: GameAudio = new GameAudio('./assets/sounds/outOfFlares.ogg');

    public shape: Vec2[] = [
        { x: 0, y: 5 },
        { x: -3, y: -5 },
        { x: 3, y: -5 },
    ]

    static color: string = "#00ff00";

    public velocity: Vec2 = { x: 0, y: 300 };
    public acceleration: Vec2 = { x: 0, y: 0 };

    public accelerationStore: Vec2 = { x: 0, y: 0 };

    public rotation: number = 0;
    public rotVelocity: number = 0;
    public rotAcceleration: number = 0;

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

    private static zoomState = 0.1;
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
        this.flare(progress);
        this.shoot(progress);

        this.progressStore = progress;

        const out = (Player.input.isPressed('-')) ? 1 : 0;
        const zoom = (Player.input.isPressed('=')) ? 1 : 0;
        const reset = (Player.input.isPressed('0')) ? 1 : 0;

        if (out) Player.zoomState = 0.1;
        if (zoom) Player.zoomState = 1;
        if (reset) Player.zoomState = 0.25;

        GameObject.setCameraZoom(
              (1 - (7 * (vecToDist(this.velocity) / 7500 ))) * Player.zoomState
        )

        if (Player.input.isPressed('i')) GameObject.setCameraZoom(0.4);
        const zoomFactor = (Player.input.isPressed('i')) ? 1 : 0;

        const padding = 0.4;
        const bulletVel = addVec2(this.velocity, rotateVec2({x: 0, y: Bullet.lauchVel}, this.rotation))
        let bulletVelMag = scaleVec2(bulletVel, 4000 / vecToDist(bulletVel));
        if (bulletVelMag.x > resolution.width * padding / GameObject.cameraZoom) bulletVelMag.x = resolution.width * padding / GameObject.cameraZoom
        if (bulletVelMag.x < resolution.width * -padding / GameObject.cameraZoom) bulletVelMag.x = resolution.width * -padding / GameObject.cameraZoom
        if (bulletVelMag.y > resolution.height * padding / GameObject.cameraZoom) bulletVelMag.y = resolution.height * padding / GameObject.cameraZoom
        if (bulletVelMag.y < resolution.height * -padding / GameObject.cameraZoom) bulletVelMag.y = resolution.height * -padding / GameObject.cameraZoom



        let cameraPos: Vec2 = addVec2(
            this.position,
            scaleVec2(bulletVelMag, zoomFactor)
        );

        GameObject.setCameraPosition(cameraPos.x, cameraPos.y)
    }


    private health: number = 100;


    damage(amount: number){
        this.health-=amount;
        Player.damageSound.play();
        Player.damageSound.setPlaybackRate(this.health / 100);
        if (this.health <= 0) this.die();
    }


    die(){
        if (this.isGarbage) return;
        Player.moveSound.stop();        
        Player.airbrakeSound.stop();
        Player.windSound.stop();
        setTimeout(()=>{new Player(Math.random() * 6000 - 3000,Math.random() * 6000 - 3000)}, 5000)
        new Explosion(this.position)
        this.isGarbage = true;
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
        const maxThrust = 50;

        const factor = (maxThrust / 3) * (w - s) + (maxThrust * 2 / 3);

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

        const optimalTurnSpeed = 300;
        const vel = vecToDist(this.velocity);
        const falloff = 1 / (250000 * (vel / 2000))
        const speedMult = 1 / (falloff * (vel - optimalTurnSpeed) ** 2 + 1)

        this.turnFacStore = speedMult;

        const turnFactor = (d - a) * 4;
        this.rotAcceleration += turnFactor * speedMult;
    }


    rotDrag() {
        this.rotAcceleration -= this.rotVelocity * 5;
    }


    private liftStore = 0;

    lift() {
        const liftForce: number = rotateVec2(this.velocity, -this.rotation).x * 1

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


    private static ROF = 30;
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

            this.acceleration = addVec2(
                this.acceleration, 
                rotateVec2({x: 0, y: -50}, this.rotation)
            )


            /*this.acceleration = subVec2(
                this.acceleration,
                scaleVec2(
                    this.velocity,
                    2
                )
            )*/

        }
    }

    private static FlareROF = 100;
    private flareFireTimer = Player.FlareROF;
    private static initalFlareCount: number = 15;
    private flares: number = Player.initalFlareCount;
    private reloadingFlares: boolean = false;

    flare(progress: number) {
        if (this.flareFireTimer > 0) {
            this.flareFireTimer -= progress;
            return;
        }
        const xDisp = 1000;
        const yDisp = 400;
        if (this.flares <= 0 && !this.reloadingFlares){
            this.reloadingFlares = true;
            Player.outOfFlares.play();
            setTimeout(()=>{
                Player.flaresLoaded.play();
                this.flares = Player.initalFlareCount
                this.reloadingFlares = false;
            }, 10000);
        }

        if (this.reloadingFlares) return;

        if (Player.input.isPressed(' ')) {
            this.flares--;
            this.flareFireTimer = Player.FlareROF;
            new Flare(this.position, addVec2(
                this.velocity, 
                rotateVec2({
                    x: Math.random() * xDisp - xDisp / 2,
                    y: -yDisp
                }, this.rotation)
            ));
        }
    }


    draw(ctx: OffscreenCanvasRenderingContext2D) {
        // drawing the player
        const rotated = polyRotate(this.shape, this.rotation);
        const translated = polyOffset(rotated, this.position);
        const toCanvas = GameObject.gTCanPosPoly(translated);

        pPolyFillStip(ctx, toCanvas, Player.color);
        pPoly(ctx, toCanvas, Player.color);

        const lift = [
            this.position,
            addVec2(
                this.position,
                rotateVec2(
                    { x: -this.liftStore * 4, y: 0 },
                    this.rotation
                )
            )
        ];
        const liftToCanvas = GameObject.gTCanPosPoly(lift);
        pLineV(ctx, liftToCanvas[0], liftToCanvas[1], "#00ffff44");

        const prograde = [
            this.position,
            addVec2(
                this.position,
                scaleVec2(this.velocity, 4)
            )
        ];

        const progradeToCanvas = GameObject.gTCanPosPoly(prograde);
        pLineV(ctx, progradeToCanvas[0], progradeToCanvas[1], "#ffff0044");

        const aimDist: number = 4000;

            const bulletVel = rotateVec2({x: 0, y: Bullet.lauchVel}, this.rotation);
            const netVel = addVec2(this.velocity, bulletVel);
            const aimTime = aimDist / vecToDist(netVel)
            const aimOffset = addVec2(this.position, scaleVec2(netVel, aimTime));

        pLineV(ctx, GameObject.gTCanPos(this.position), GameObject.gTCanPos(aimOffset), "#ffffff44")

        // textElements
        /*pTextBasic(ctx, 0, 0, `PLAYER STATS`, '#ffffff')
        pTextBasic(ctx, 0, 6, `ACCEL: ${Math.floor(vecToDist(this.accelerationStore))}`, '#ffff00')
        pTextBasic(ctx, 0, 12, `VEL: ${Math.floor(vecToDist(this.velocity))}`, '#0000ff')
        pTextBasic(ctx, 0, 18, `POS: X:${Math.floor(this.position.x)} Y:${Math.floor(this.position.y)}`, '#ff0000')
        pTextBasic(ctx, 0, 24, `TURN: ${Math.floor(this.turnFacStore * 100) / 100}`, '#ff00ff')*/
        pTextBasic(ctx, 0, 0, `FPS: ${Math.floor(1000 / this.progressStore)}`, '#00ff00')

        const posOnCan = GameObject.gTCanPos(this.position);
        const offset = GameObject.cameraZoom * 32 + 4
        pTextBasic(ctx, posOnCan.x - 5, posOnCan.y - offset, `HP: ${this.health}`, "#00ff00")
        pTextBasic(ctx, posOnCan.x - 5, posOnCan.y - offset - 6, `VEL: ${Math.round(vecToDist(this.velocity))}`, "#0000ff")
        pTextBasic(ctx, posOnCan.x - 5, posOnCan.y - offset - 12, `FLRS: ${this.flares}`, "#ffff00")
    }
}

export default Player;
