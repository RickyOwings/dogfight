import { pTextBasic } from "./pixelRendering"
import resolution from "./resolution"

export default (ctx: OffscreenCanvasRenderingContext2D)=>{
    pTextBasic(ctx, resolution.width / 2 - 50, resolution.height / 2, "PRESS ANY KEY TO START", "#ffffff")    
}
