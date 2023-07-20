import resolution from "../OnetimeOrShared/resolution.js";
const _GameObject = class {
  constructor() {
    this.zIndex = 0;
    this.identifier = "generic";
    this.rotation = 0;
    this.isGarbage = false;
    _GameObject.instances.push(this);
    this.setZIndex(0);
  }
  static setCameraPosition(x, y) {
    _GameObject.cameraX = x;
    _GameObject.cameraY = y;
  }
  static setCameraZoom(zoom) {
    _GameObject.cameraZoom = zoom;
  }
  static gTCanPos(position) {
    return {
      x: (position.x - _GameObject.cameraX) * _GameObject.cameraZoom + resolution.width / 2,
      y: (position.y - _GameObject.cameraY) * _GameObject.cameraZoom + resolution.height / 2
    };
  }
  static gTCanPosPoly(points) {
    let newArr = [];
    points.forEach((point) => {
      newArr.push(_GameObject.gTCanPos(point));
    });
    return newArr;
  }
  setZIndex(zIndex) {
    this.zIndex = zIndex;
    _GameObject.instances.sort((a, b) => {
      if (a.zIndex > b.zIndex)
        return 1;
      return -1;
    });
  }
  static searchByIdentifier(...args) {
    return _GameObject.instances.filter((object) => args.includes(object.identifier));
  }
  getAcceleration() {
    return this.accelerationStore;
  }
  update(progress) {
  }
  draw(ctx) {
  }
};
let GameObject = _GameObject;
GameObject.instances = [];
GameObject.cameraX = 0;
GameObject.cameraY = 0;
GameObject.cameraZoom = 0.5;
export default GameObject;
