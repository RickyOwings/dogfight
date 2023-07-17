import Player from "./Player" 
import { AntiAir, MissileAAA } from "./AntiAir"
import { BackgroundElement } from "./BackgroundElements";
import Explosion from "./Explosion";

export default ()=>{
    new AntiAir(0, 3000);
    new AntiAir(0, -3000);
    new MissileAAA(3000, 3000);
    new Player(0, 0);
    new BackgroundElement(
        {x: 0, y: 0},
        [
            {x: -3000, y: -3000},
            {x:  3000, y: -3000},
            {x:  3000, y:  3000},
            {x: -3000, y:  3000}
        ]
    )
}
