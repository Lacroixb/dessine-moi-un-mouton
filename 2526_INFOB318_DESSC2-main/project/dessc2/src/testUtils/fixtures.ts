import type { Layer, BrushStroke, EraserStroke, RectangleStroke, CircleStroke, EllipseStroke, LineStroke } from "../types/drawing";
export const brushStroke: BrushStroke = {
  id: "stroke-brush-1",
  type: "brush",
  color: "#ff0000",
  size: 5,
  opacity: 1,
  points: [10, 20, 30, 40],
};

export const brushStroke2: BrushStroke = {
  id: "stroke-brush-2",
  type: "brush",
  color: "#0000ff",
  size: 3,
  opacity: 0.8,
  points: [50, 60],
};

export const eraserStroke: EraserStroke = {
  id: "stroke-eraser-1",
  type: "eraser",
  color: "rgba(0,0,0,1)",
  size: 10,
  opacity: 1,
  points: [5, 5, 15, 15],
};

export const rectangleStroke: RectangleStroke = {
  id: "stroke-rect-1",
  type: "rectangle",
  color: "#0000ff",
  size: 2,
  opacity: 0.8,
  x: 10,
  y: 10,
  width: 100,
  height: 50,
  startX: 10,
  startY: 10,
};

export const circleStroke: CircleStroke = {
  id: "stroke-circle-1",
  type: "circle",
  color: "#00ff00",
  size: 2,
  opacity: 1,
  x: 50,
  y: 50,
  radius: 30,
  startX: 20,
  startY: 20,
};

export const ellipseStroke: EllipseStroke = {
  id: "stroke-ellipse-1",
  type: "ellipse",
  color: "#ff00ff",
  size: 2,
  opacity: 1,
  x: 60,
  y: 40,
  width: 40,
  height: 20,
  startX: 20,
  startY: 20,
};

export const lineStroke: LineStroke = {
  id: "stroke-line-1",
  type: "line",
  color: "#000000",
  size: 3,
  opacity: 1,
  points: [0, 0, 100, 100],
  startX: 0,
  startY: 0,
};

export const emptyLayer: Layer = {
  id: "layer-1",
  name: "Layer 1",
  visible: true,
  strokes: [],
};

export const layerWithStrokes: Layer = {
  id: "layer-1",
  name: "Layer 1",
  visible: true,
  strokes: [brushStroke, rectangleStroke],
};

export const hiddenLayer: Layer = {
  id: "layer-3",
  name: "Layer 3",
  visible: false,
  strokes: [circleStroke],
};

export const secondLayer: Layer = {
  id: "layer-2",
  name: "Layer 2",
  visible: true,
  strokes: [],
};

export const thirdLayer: Layer = {
  id: "layer-3",
  name: "Layer 3",
  visible: true,
  strokes: [],
};

export const twoLayers: Layer[] = [
  { ...emptyLayer },
  { ...secondLayer },
];

export const threeLayers: Layer[] = [
  { ...emptyLayer },
  { ...secondLayer },
  { ...thirdLayer },
];
