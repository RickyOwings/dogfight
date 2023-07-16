export interface Vec2 {
    x: number;
    y: number;
}


export function addVec2(v1: Vec2, v2: Vec2): Vec2{
    return {
        x: v1.x + v2.x,
        y: v1.y + v2.y
    }
}


export function subVec2(v1: Vec2, v2: Vec2): Vec2{
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y
    }
}


export function scaleVec2(v: Vec2, factor: number): Vec2{
    return {
        x: v.x * factor,
        y: v.y * factor 
    }
}


export function rotateVec2(v: Vec2, angle: number): Vec2{
    return {
        x: v.x * Math.cos(angle) - v.y * Math.sin(angle),
        y: v.y * Math.cos(angle) + v.x * Math.sin(angle)
    }
}


export function vecToDist(v: Vec2): number{
    return Math.sqrt(v.x ** 2 + v.y ** 2);
}


export function distBetVecs(v1: Vec2, v2: Vec2): number{
    const delta = subVec2(v2, v1);
    return vecToDist(delta);
}


export function angleBetVecs(v1: Vec2, v2: Vec2): number{
    return Math.atan2(v2.y - v1.y, v2.x - v1.x);
}


export function polyOffset(points: Vec2[], offset: Vec2){
    let newArr: Vec2[] = [];
    points.forEach((point)=>{
        newArr.push({
            x: point.x + offset.x,
            y: point.y + offset.y
        })
    })
    return newArr;
}

export function polyRotate(points: Vec2[], angle: number){
    let newArr: Vec2[] = [];
    points.forEach((point)=>{
        newArr.push({
            x: point.x * Math.cos(angle) - point.y * Math.sin(angle),
            y: point.y * Math.cos(angle) + point.x * Math.sin(angle)
        })
    })
    return newArr;
}


export function polyScale(points: Vec2[], scale: number){
    let newArr: Vec2[] = [];
    points.forEach((point)=>{
        newArr.push(scaleVec2(point, scale));
    })
    return newArr;
}
