import { Vec2 } from "./Vec2";
import resolution from "./resolution";

export function pDot(
    ctx: OffscreenCanvasRenderingContext2D,
    x: number, y: number,
    fillStyle: string | undefined = undefined
    ){
    if (x < 0 || y < 0 || x >= resolution.width || y >= resolution.height) return;
    if (fillStyle) ctx.fillStyle = fillStyle;
    ctx.fillRect(
        Math.floor(x), Math.floor(y), 
        1, 1
    );
}


export function pLine(
    ctx: OffscreenCanvasRenderingContext2D,
    x1: number, y1: number,
    x2: number, y2: number,
    fillStyle: string | undefined = undefined
){
    if (fillStyle) ctx.fillStyle = fillStyle;
    const dx = x2 - x1;
    const dy = y2 - y1;
    // figure out whether we are iterating on the x or y
    const angle = Math.atan(dx / dy);
    const iteratingX = (Math.abs(angle) > Math.PI / 4);
    if (iteratingX) {
        const dir = (x1 <= x2) ? 1 : -1;
        for(let x = x1, dist = 0; dist <= Math.abs(dx); x += dir, dist += 1){
            const y = (dy * dist * dir / dx) + y1;
            pDot(ctx, x, y);
        }
    } else {
        const dir = (y1 <= y2) ? 1 : -1;
        for(let y = y1, dist = 0; dist <= Math.abs(dy); y += dir, dist += 1){
            const x = (dx * dist * dir / dy) + x1;
            pDot(ctx, x, y);
        }
    }
}


export function pLineV(
    ctx: OffscreenCanvasRenderingContext2D,
    vec1: Vec2,
    vec2: Vec2,
    fillStyle: string | undefined = undefined
){
    pLine(
        ctx,
        vec1.x, vec1.y,
        vec2.x, vec2.y,
        fillStyle
    ); 
}


export function pPoly(
    ctx: OffscreenCanvasRenderingContext2D,
    points: Vec2[],
    fillStyle: string | undefined = undefined
){
    for (let i = 0; i < points.length; i++){
        const point1 = points[i];
        const point2 = (i == points.length - 1) ? points[0] : points[i + 1];
        pLineV(ctx, point1, point2, fillStyle);
    }
}


type Line = [Vec2, Vec2];

/*export function pPolyFill(
    ctx: OffscreenCanvasRenderingContext2D,
    points: Vec2[],
    fillStyle: string | undefined = undefined
){
    // max and min x y vals
    const xVals: number[] = Array.from(points, pt => pt.x);
    const yVals: number[] = Array.from(points, pt => pt.y);
    let xMax = Math.floor(Math.max(...xVals));
    let xMin = Math.floor(Math.min(...xVals));
    let yMax = Math.floor(Math.max(...yVals));
    let yMin = Math.floor(Math.min(...yVals));

    if (xMax < 0) return;
    if (yMax < 0) return;
    if (xMin > resolution.width) return;
    if (yMin > resolution.height) return;

    if (xMin < 0) xMin = 0;
    if (yMin < 0) yMin = 0;
    if (yMax > resolution.height) yMax = resolution.height; 
    if (xMax > resolution.width) xMax = resolution.width; 

    if (fillStyle) ctx.fillStyle = fillStyle;

    // array describing lines
    const lines: Line[] = [];
    for(let i = 0; i < points.length; i++){
        const l = (i == points.length - 1) ? 0 : i + 1;
        lines.push([points[i], points[l]]);
    }

    const drawsFNS: { () : Promise<void> }[] = [];
    
    for(let x = xMin; x <= xMax; x++){
        for(let y = yMin; y <= yMax; y++){
            let intersects = 0;
            lines.forEach((line)=>{
                const yLocMax = Math.max(line[0].y, line[1].y);
                const yLocMin = Math.min(line[0].y, line[1].y);
                if (yLocMin > y || yLocMax < y) return;

                const x1 = Math.floor(line[0].x);
                const x2 = Math.floor(line[1].x);
                const y1 = Math.floor(line[0].y);
                const y2 = Math.floor(line[1].y);

                const xInter = (x2 - x1) * (y - y1) / (y2 - y1);
                const xInterAdj = xInter + x1
                if (x > xInterAdj) {
                    intersects++;
                }
            });
            if ((intersects + 1) % 2 == 0) {
                pDot(ctx ,x, y);
            }
        }
    }
    console.log(xMin, yMin, xMax, yMax)
}*/


export function pPolyFillStip(
    ctx: OffscreenCanvasRenderingContext2D,
    points: Vec2[],
    fillStyle: string | undefined = undefined
){
    // max and min x y vals
    const xVals: number[] = Array.from(points, pt => pt.x);
    const yVals: number[] = Array.from(points, pt => pt.y);
    let xMax = Math.floor(Math.max(...xVals));
    let xMin = Math.floor(Math.min(...xVals));
    let yMax = Math.floor(Math.max(...yVals));
    let yMin = Math.floor(Math.min(...yVals));

    if (xMax < 0) return;
    if (yMax < 0) return;
    if (xMin > resolution.width) return;
    if (yMin > resolution.height) return;

    if (xMin < 0) xMin = 0;
    if (yMin < 0) yMin = 0;
    if (yMax > resolution.height) yMax = resolution.height; 
    if (xMax > resolution.width) xMax = resolution.width; 

    if (fillStyle) ctx.fillStyle = fillStyle;

    // array describing lines
    const lines: Line[] = [];
    for(let i = 0; i < points.length; i++){
        const l = (i == points.length - 1) ? 0 : i + 1;
        lines.push([points[i], points[l]]);
    }
    
    for(let x = xMin; x <= xMax; x++){
        for(let y = yMin; y <= yMax; y++){
            if ((Math.floor(x) + Math.floor(y)) % 2 == 0) continue;
            let intersects = 0;
            lines.forEach((line)=>{
                const yLocMax = Math.max(line[0].y, line[1].y);
                const yLocMin = Math.min(line[0].y, line[1].y);
                if (yLocMin > y || yLocMax < y) return;
                const xInter = (line[1].x - line[0].x) * (y - line[0].y) / (line[1].y - line[0].y);
                const xInterAdj = xInter + line[0].x
                if (x > xInterAdj) {
                    intersects++;
                }
            });
            if ((intersects + 1) % 2 == 0) pDot(ctx, x, y)
        }
    }
}


export function insidePoly(point: Vec2, poly: Vec2[]): boolean{
    const lines: Line[] = [];
    for(let i = 0; i < poly.length; i++){
        const l = (i == poly.length - 1) ? 0 : i + 1;
        lines.push([poly[i], poly[l]]);
    }

    let intersects = 0;
    lines.forEach((line) => {
        const yLocMax = Math.max(line[0].y, line[1].y);
        const yLocMin = Math.min(line[0].y, line[1].y);
        if (yLocMin > point.y || yLocMax < point.y) return false;

        const x1 = Math.floor(line[0].x);
        const x2 = Math.floor(line[1].x);
        const y1 = Math.floor(line[0].y);
        const y2 = Math.floor(line[1].y);

        const xInter = (x2 - x1) * (point.y - y1) / (y2 - y1);
        const xInterAdj = xInter + x1
        if (point.x > xInterAdj) {
            intersects++;
        }
    });
    if ((intersects + 1) % 2 == 0) {
        return true;
    }
    return false;

}


export function pPolyFill(
    ctx: OffscreenCanvasRenderingContext2D,
    points: Vec2[],
    fillStyle: string | undefined = undefined
){
    if (fillStyle) ctx.fillStyle = fillStyle;
    ctx.beginPath();
    for(let i = 0; i < points.length; i++){
        if (i == 0) {
            ctx.moveTo(Math.floor(points[i].x), Math.floor(points[i].y))
            continue;
        }
        ctx.lineTo(Math.floor(points[i].x), Math.floor(points[i].y))
    }
    ctx.lineTo(Math.floor(points[0].x), Math.floor(points[0].y))
    ctx.closePath();
    ctx.fill();
}



interface TextDict {
    [key: string]: number[][]
}

const textDict: TextDict = {
    '1':[
        [0,1,0],
        [1,1,0],
        [0,1,0],
        [0,1,0],
        [1,1,1]
    ],
    '2':[
        [0,1,0],
        [1,0,1],
        [0,0,1],
        [0,1,0],
        [1,1,1]
    ],
    '3':[
        [1,1,0],
        [0,0,1],
        [1,1,0],
        [0,0,1],
        [1,1,0]
    ],
    '4':[
        [1,0,1],
        [1,0,1],
        [1,1,1],
        [0,0,1],
        [0,0,1]
    ],
    '5':[
        [1,1,1],
        [1,0,0],
        [1,1,0],
        [0,0,1],
        [1,1,1]
    ],
    '6':[
        [0,1,1],
        [1,0,0],
        [1,1,0],
        [1,0,1],
        [1,1,1]
    ],
    '7':[
        [1,1,1],
        [0,0,1],
        [0,0,1],
        [0,0,1],
        [0,0,1]
    ],
    '8':[
        [1,1,1],
        [1,0,1],
        [0,1,0],
        [1,0,1],
        [1,1,1]
    ],
    '9':[
        [1,1,1],
        [1,0,1],
        [1,1,1],
        [0,0,1],
        [0,0,1]
    ],
    '0':[
        [1,1,1],
        [1,0,1],
        [1,0,1],
        [1,0,1],
        [1,1,1]
    ],
    'A':[
        [0,1,0],
        [1,0,1],
        [1,1,1],
        [1,0,1],
        [1,0,1]
    ],
    'B':[
        [1,1,0],
        [1,0,1],
        [1,1,0],
        [1,0,1],
        [1,1,0]
    ],
    'C':[
        [0,1,1],
        [1,0,0],
        [1,0,0],
        [1,0,0],
        [0,1,1]
    ],
    'D':[
        [1,1,0],
        [1,0,1],
        [1,0,1],
        [1,0,1],
        [1,1,0]
    ],
    'E':[
        [1,1,1],
        [1,0,0],
        [1,1,1],
        [1,0,0],
        [1,1,1]
    ],
    'F':[
        [1,1,1],
        [1,0,0],
        [1,1,1],
        [1,0,0],
        [1,0,0]
    ],
    'G':[
        [1,1,1],
        [1,0,0],
        [1,0,1],
        [1,0,1],
        [1,1,1]
    ],
    'H':[
        [1,0,1],
        [1,0,1],
        [1,1,1],
        [1,0,1],
        [1,0,1]
    ],
    'I':[
        [1,1,1],
        [0,1,0],
        [0,1,0],
        [0,1,0],
        [1,1,1]
    ],
    'J':[
        [0,0,1],
        [0,0,1],
        [0,0,1],
        [1,0,1],
        [0,1,0]
    ],
    'K':[
        [1,0,1],
        [1,0,1],
        [1,1,0],
        [1,0,1],
        [1,0,1]
    ],
    'L':[
        [1,0,0],
        [1,0,0],
        [1,0,0],
        [1,0,0],
        [1,1,1]
    ],
    'M':[
        [1,1,1],
        [1,1,1],
        [1,1,1],
        [1,0,1],
        [1,0,1]
    ],
    'N':[
        [1,1,1],
        [1,0,1],
        [1,0,1],
        [1,0,1],
        [1,0,1]
    ],
    'O':[
        [0,1,0],
        [1,0,1],
        [1,0,1],
        [1,0,1],
        [0,1,0]
    ],
    'P':[
        [1,1,1],
        [1,0,1],
        [1,1,1],
        [1,0,0],
        [1,0,0]
    ],
    'Q':[
        [1,1,1],
        [1,0,1],
        [1,0,1],
        [1,1,1],
        [0,0,1]
    ],
    'R':[
        [1,1,1],
        [1,0,1],
        [1,1,0],
        [1,0,1],
        [1,0,1]
    ],
    'S':[
        [1,1,1],
        [1,0,0],
        [1,1,1],
        [0,0,1],
        [1,1,1]
    ],
    'T':[
        [1,1,1],
        [0,1,0],
        [0,1,0],
        [0,1,0],
        [0,1,0]
    ],
    'U':[
        [1,0,1],
        [1,0,1],
        [1,0,1],
        [1,0,1],
        [1,1,1]
    ],
    'V':[
        [1,0,1],
        [1,0,1],
        [1,0,1],
        [0,1,0],
        [0,1,0]
    ],
    'W':[
        [1,0,1],
        [1,0,1],
        [1,1,1],
        [1,1,1],
        [1,0,1]
    ],
    'X':[
        [1,0,1],
        [1,0,1],
        [0,1,0],
        [1,0,1],
        [1,0,1]
    ],
    'Y':[
        [1,0,1],
        [1,0,1],
        [0,1,0],
        [0,1,0],
        [0,1,0]
    ],
    'Z':[
        [1,1,1],
        [0,0,1],
        [1,1,0],
        [1,0,0],
        [1,1,1]
    ],
    ':':[
        [0,0,0],
        [0,1,0],
        [0,0,0],
        [0,1,0],
        [0,0,0]
    ],
    '-':[
        [0,0,0],
        [0,0,0],
        [1,1,1],
        [0,0,0],
        [0,0,0]
    ],
    ' ':[
        [0,0,0],
        [0,0,0],
        [0,0,0],
        [0,0,0],
        [0,0,0]
    ],
    '.':[
        [0,0,0],
        [0,0,0],
        [0,0,0],
        [0,0,0],
        [0,1,0]
    ],
}

function drawCharacter(ctx: OffscreenCanvasRenderingContext2D, x: number, y: number, char: string, color: string){
    if (!Object.keys(textDict).includes(char)) return;
    const asArr: number[][] = textDict[char];

    ctx.fillStyle = color;

    for(let dy = 0; dy < asArr.length; dy++){
        for(let dx = 0; dx < asArr[dy].length; dx++){
            if (asArr[dy][dx]) pDot(ctx, x + dx, y + dy)
        }
    }
}

export function pTextBasic(ctx: OffscreenCanvasRenderingContext2D , x: number, y: number, text: string, color: string){
    if (text === undefined) return;
    let filteredString = '';
    for(let i = 0; i < text.length; i++){
        if (Object.keys(textDict).includes(text[i])) filteredString += text[i];
    }
    for(let i = 0; i < filteredString.length; i++){
        drawCharacter(ctx, x + i * 4, y, filteredString[i], color);
    }
}
