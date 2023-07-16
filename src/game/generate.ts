import Player from "./Player" 
import AntiAir from "./AntiAir"
import { BackgroundElement } from "./BackgroundElements";
import Explosion from "./Explosion";

export default ()=>{
    new AntiAir(0, 600);
    new AntiAir(0, -600);
    new AntiAir(500, 1000);
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
