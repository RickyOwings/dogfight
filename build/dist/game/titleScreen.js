import GameAudio from "./GameAudio.js";
import awaitUserInput from "./awaitUserInput.js";
import {pTextBasic} from "./pixelRendering.js";
import resolution from "./resolution.js";
import wait from "./wait.js";
function clearCanvas(ctx) {
  ctx.clearRect(0, 0, resolution.width, resolution.height);
}
export default async (ctx, resizeFunction) => {
  const menuSound = new GameAudio("./assets/sounds/menu.ogg");
  const gameStart = new GameAudio("./assets/sounds/gameStart.ogg");
  const waitInterval = 100;
  return new Promise(async (resolve) => {
    resolution.scaleFactor = 1;
    resizeFunction();
    await wait(waitInterval);
    pTextBasic(ctx, resolution.width / 2 - 50, resolution.height / 2, "WELCOME TO DOGFIGHT...", "#ffffff");
    pTextBasic(ctx, resolution.width / 2 - 50, resolution.height / 2 + 6, "PRESS ANY KEY TO CONTINUE", "#00ff00");
    await awaitUserInput();
    menuSound.play();
    await wait(waitInterval);
    clearCanvas(ctx);
    pTextBasic(ctx, resolution.width / 2 - 50, resolution.height / 2, "---CONTROLS---", "#ffffff");
    pTextBasic(ctx, resolution.width / 2 - 50, resolution.height / 2 + 6, "MOVE: W A S D", "#ffffff");
    pTextBasic(ctx, resolution.width / 2 - 50, resolution.height / 2 + 12, "SHOOT: J", "#ff0000");
    pTextBasic(ctx, resolution.width / 2 - 50, resolution.height / 2 + 18, "AIRBRAKE: K", "#ff00ff");
    pTextBasic(ctx, resolution.width / 2 - 50, resolution.height / 2 + 24, "ZOOM: + - 0 (THATS ZERO)", "#0000ff");
    pTextBasic(ctx, resolution.width / 2 - 50, resolution.height / 2 + 30, "FLARES: SPACEBAR", "#ffff00");
    await awaitUserInput();
    menuSound.play();
    await wait(waitInterval);
    clearCanvas(ctx);
    pTextBasic(ctx, resolution.width / 2 - 75, resolution.height / 2, "VOLUME IN UPPER RIGHT CORNER", "#ffffff");
    await awaitUserInput();
    menuSound.play();
    await wait(waitInterval);
    clearCanvas(ctx);
    pTextBasic(ctx, resolution.width / 2 - 75, resolution.height / 2, "PRESSING D ROTATES CLOCKWISE", "#ffff00");
    pTextBasic(ctx, resolution.width / 2 - 75, resolution.height / 2 + 6, "PRESSING A ROTATES COUNTER-CLOCKWISE", "#ffaa00");
    pTextBasic(ctx, resolution.width / 2 - 75, resolution.height / 2 + 12, "GOING FASTER MAKES IT HARDER TO TURN...", "#00ffff");
    pTextBasic(ctx, resolution.width / 2 - 75, resolution.height / 2 + 18, "KILLING AA IS THE GOAL... FOR NOW...", "#ff0000");
    await awaitUserInput();
    menuSound.play();
    await wait(waitInterval);
    clearCanvas(ctx);
    pTextBasic(ctx, resolution.width / 2 - 50, resolution.height / 2, "GO KILL SOME...", "#ff0000");
    pTextBasic(ctx, resolution.width / 2 - 50, resolution.height / 2 + 6, "YOU DO RESPAWN BTW", "#444444");
    await awaitUserInput();
    gameStart.play();
    const dur = gameStart.getDuration() * 1e3;
    const fillCount = 100;
    let i = 0;
    const fill = async () => {
      if (i >= 100)
        return;
      ctx.fillStyle = `rgba(255,255,255,${4 / fillCount})`;
      ctx.fillRect(0, 0, resolution.width, resolution.height);
      i++;
      await wait(dur / fillCount);
      fill();
    };
    fill();
    await wait(dur);
    resolve(0);
    resolution.scaleFactor = 3;
    resizeFunction();
  });
};
