import Player from "../GameObject/Player.js";
import {AntiAir, MissileLauncher, MissileLauncherLauncher, MissileYeeter} from "../GameObject/AntiAir.js";
import {BackgroundElement} from "../GameObject/BackgroundElements.js";
import mapSize from "./mapSize.js";
export default () => {
  new AntiAir(0, 3e3);
  new AntiAir(0, -3e3);
  new MissileLauncher(3e3, 3e3);
  new MissileYeeter(-12e3, 3e3);
  new Player(0, 0);
  new BackgroundElement({x: 0, y: 0}, [
    {x: -mapSize.width / 2, y: -mapSize.height / 2},
    {x: mapSize.width / 2, y: -mapSize.height / 2},
    {x: mapSize.width / 2, y: mapSize.height / 2},
    {x: -mapSize.width / 2, y: mapSize.height / 2}
  ]);
  new MissileLauncherLauncher(12e3, -3e3);
};
