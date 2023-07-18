export function addVec2(v1, v2) {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y
  };
}
export function subVec2(v1, v2) {
  return {
    x: v1.x - v2.x,
    y: v1.y - v2.y
  };
}
export function scaleVec2(v, factor) {
  return {
    x: v.x * factor,
    y: v.y * factor
  };
}
export function sqrtVec2(v) {
  return {
    x: Math.sqrt(v.x),
    y: Math.sqrt(v.y)
  };
}
export function rotateVec2(v, angle) {
  return {
    x: v.x * Math.cos(angle) - v.y * Math.sin(angle),
    y: v.y * Math.cos(angle) + v.x * Math.sin(angle)
  };
}
export function vecToDist(v) {
  return Math.sqrt(v.x ** 2 + v.y ** 2);
}
export function distBetVecs(v1, v2) {
  const delta = subVec2(v2, v1);
  return vecToDist(delta);
}
export function angleBetVecs(v1, v2) {
  return Math.atan2(v2.y - v1.y, v2.x - v1.x);
}
export function polyOffset(points, offset) {
  let newArr = [];
  points.forEach((point) => {
    newArr.push({
      x: point.x + offset.x,
      y: point.y + offset.y
    });
  });
  return newArr;
}
export function polyRotate(points, angle) {
  let newArr = [];
  points.forEach((point) => {
    newArr.push({
      x: point.x * Math.cos(angle) - point.y * Math.sin(angle),
      y: point.y * Math.cos(angle) + point.x * Math.sin(angle)
    });
  });
  return newArr;
}
export function polyScale(points, scale) {
  let newArr = [];
  points.forEach((point) => {
    newArr.push(scaleVec2(point, scale));
  });
  return newArr;
}
