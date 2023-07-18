import GameObject from "./GameObject.js";
import {polyOffset} from "./Vec2.js";
import {pPolyFill} from "./pixelRendering.js";
const _BackgroundElement = class extends GameObject {
  constructor(pos, shape) {
    super();
    this.setZIndex(-50);
    this.position = pos;
    this.shape = shape;
  }
  draw(ctx) {
    const localShape = polyOffset(this.shape, this.position);
    const canvasShape = GameObject.gTCanPosPoly(localShape);
    pPolyFill(ctx, canvasShape, _BackgroundElement.color);
  }
};
export let BackgroundElement = _BackgroundElement;
BackgroundElement.color = "#0a0a0a";
