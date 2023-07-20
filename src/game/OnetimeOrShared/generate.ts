import Player from "../GameObject/Player" 
import { AntiAir, MissileLauncher, MissileLauncherLauncher, MissileYeeter } from "../GameObject/AntiAir"
import { BackgroundElement } from "../GameObject/BackgroundElements";
import mapSize from "../OnetimeOrShared/mapSize";

export default ()=>{
    new AntiAir(0, 3000);
    new AntiAir(0, -3000);
    new MissileLauncher(3000, 3000);
    new MissileYeeter(-12000, 3000);
    new Player(0, 0);
    new BackgroundElement(
        {x: 0, y: 0},
        [
            {x: -mapSize.width/2, y: -mapSize.height/2},
            {x:  mapSize.width/2, y: -mapSize.height/2},
            {x:  mapSize.width/2, y:  mapSize.height/2},
            {x: -mapSize.width/2, y:  mapSize.height/2}
        ]
    )
    new MissileLauncherLauncher(12000, -3000)
}
