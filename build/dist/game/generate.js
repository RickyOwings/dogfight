import Player from "./Player.js";
import {AntiAir, MissileAAA} from "./AntiAir.js";
import {BackgroundElement} from "./BackgroundElements.js";
import mapSize from "./mapSize.js";
export default () => {
  new AntiAir(0, 3e3);
  new AntiAir(0, -3e3);
  new MissileAAA(3e3, 3e3);
  new Player(0, 0);
  new BackgroundElement({x: 0, y: 0}, [
    {x: -mapSize.width / 2, y: -mapSize.height / 2},
    {x: mapSize.width / 2, y: -mapSize.height / 2},
    {x: mapSize.width / 2, y: mapSize.height / 2},
    {x: -mapSize.width / 2, y: mapSize.height / 2}
  ]);
};
