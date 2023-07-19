import { Vec2 } from "../Utility/Vec2";
import resolution from "../OnetimeOrShared/resolution";

/*
    A game object is simply an object that has three main functions. It has an update function that takes
    a progress in ms, a draw function which takes in a 2d drawing context, and pushes itself to an array so
    that all game objects can be iterated upon...
*/
class GameObject {
    static instances: GameObject[] = [];

    static cameraX: number = 0;
    static cameraY: number = 0;
    static cameraZoom: number = 0.5;

    static setCameraPosition(x: number, y: number){
        GameObject.cameraX = x;
        GameObject.cameraY = y;
    }

    static setCameraZoom(zoom: number){
        GameObject.cameraZoom = zoom;
    }

    static gTCanPos(position: Vec2): Vec2{
        return {
            x: (position.x - GameObject.cameraX) * GameObject.cameraZoom + resolution.width / 2,
            y: (position.y - GameObject.cameraY) * GameObject.cameraZoom + resolution.height / 2
        }
    }
    static gTCanPosPoly(points: Vec2[]): Vec2[]{
        let newArr: Vec2[] = [];
        points.forEach((point: Vec2)=>{
            newArr.push(GameObject.gTCanPos(point));
        });
        return newArr;
    }

    private zIndex: number = 0;

    public setZIndex(zIndex: number){
        this.zIndex = zIndex;
        GameObject.instances.sort((a, b)=>{
            if (a.zIndex > b.zIndex) return 1;
            return -1;
        })
    }

    public isGarbage: boolean;

    public identifier: string = 'generic';

    public static searchByIdentifier(...args: string[]): GameObject[]{
        return GameObject.instances.filter(object => args.includes(object.identifier));
    }

    constructor(){
        this.isGarbage = false;
        GameObject.instances.push(this); 
        this.setZIndex(0);
    }


    update(progress: number) : void {}

    draw(ctx: OffscreenCanvasRenderingContext2D){}

}

export default GameObject;
