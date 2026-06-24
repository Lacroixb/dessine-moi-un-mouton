import type { Position, Stroke } from "../types/drawing";
import { BRUSH_CONFIG } from "../constants/tools";

/**
 * Creates the initial partial stroke object based on the selected tool and starting position.
 * @param tool - The drawing tool type
 * @param pos - The starting position
 * @param color - The stroke color
 * @param size - The stroke size
 * @param opacity - The stroke opacity
 * @returns A partial stroke object with initial properties
 */
export function createInitialStroke(
  tool: string,
  pos: Position,
  color: string,
  size: number,
  opacity: number
): Partial<Stroke> {
  console.assert(typeof tool === "string" && tool.length > 0, "createInitialStroke: tool doit être une chaîne non vide");
  console.assert(Number.isFinite(pos.x) && Number.isFinite(pos.y), "createInitialStroke: position invalide", pos);
  console.assert(typeof color === "string" && color.length > 0, `createInitialStroke: color invalide — reçu: "${color}"`);
  console.assert(
    Number.isFinite(size) && size >= BRUSH_CONFIG.SIZE.MIN && size <= BRUSH_CONFIG.SIZE.MAX,
    `createInitialStroke: size hors limites [${BRUSH_CONFIG.SIZE.MIN}, ${BRUSH_CONFIG.SIZE.MAX}] — reçu: ${size}`
  );
  console.assert(
    Number.isFinite(opacity) && opacity >= BRUSH_CONFIG.OPACITY.MIN && opacity <= BRUSH_CONFIG.OPACITY.MAX,
    `createInitialStroke: opacity hors limites [${BRUSH_CONFIG.OPACITY.MIN}, ${BRUSH_CONFIG.OPACITY.MAX}] — reçu: ${opacity}`
  );

  const baseStroke = {
    id: crypto.randomUUID(),
    color: tool === "eraser" ? "rgba(0,0,0,1)" : color,
    size,
    opacity: tool === "eraser" ? 1 : opacity,
  };

  switch (tool) {
    case "brush":
    case "eraser":
      return { ...baseStroke, type: tool, points: [pos.x, pos.y] };

    case "rectangle":
    case "square":
    case "ellipse":
      return { ...baseStroke, type: tool, x: pos.x, y: pos.y, startX: pos.x, startY: pos.y, width: 0, height: 0 };

    case "circle":
      return { ...baseStroke, type: tool, x: pos.x, y: pos.y, startX: pos.x, startY: pos.y, radius: 0 };

    case "line":
      return { ...baseStroke, type: tool, points: [pos.x, pos.y], startX: pos.x, startY: pos.y };

    default:
      throw new Error(`Unknown tool type: ${tool}`);
  }
}

/**
 * Updates an existing stroke with a new position, modifying its geometry based on the stroke type.
 * @param stroke - The stroke to update
 * @param pos - The new position to incorporate
 * @returns The updated stroke object
 */
export function updateStrokeWithPosition(stroke: Stroke, pos: Position): Stroke {
  console.assert(stroke != null, "updateStrokeWithPosition: stroke est null ou undefined");
  console.assert(typeof stroke.type === "string", `updateStrokeWithPosition: stroke.type invalide — reçu: ${stroke.type}`);
  console.assert(Number.isFinite(pos.x) && Number.isFinite(pos.y), "updateStrokeWithPosition: position invalide", pos);

  switch (stroke.type) {
    case "brush":
    case "eraser":
      console.assert(
        Array.isArray(stroke.points) && stroke.points.length >= 2,
        `updateStrokeWithPosition (${stroke.type}): points doit contenir au moins 2 valeurs`, stroke.points
      );
      return { ...stroke, points: [...stroke.points, pos.x, pos.y] };

    case "rectangle":
      return updateRectangleStroke(stroke, pos);

    case "square":
      return updateSquareStroke(stroke, pos);

    case "circle":
      return updateCircleStroke(stroke, pos);

    case "ellipse":
      return updateEllipseStroke(stroke, pos);

    case "line":
      console.assert(
        Number.isFinite(stroke.startX) && Number.isFinite(stroke.startY),
        "updateStrokeWithPosition (line): startX/startY invalides", stroke
      );
      return { ...stroke, points: [stroke.startX, stroke.startY, pos.x, pos.y] };

    default:
      return stroke;
  }
}

/**
 * Updates a rectangle stroke with the new position.
 * @param stroke - The rectangle stroke to update
 * @param pos - The current mouse position
 * @returns The updated rectangle stroke
 */
function updateRectangleStroke(stroke: any, pos: Position) {
  console.assert(Number.isFinite(stroke.startX) && Number.isFinite(stroke.startY), "updateRectangleStroke: startX/startY invalides", stroke);
  const w = pos.x - stroke.startX;
  const h = pos.y - stroke.startY;
  return { ...stroke, x: stroke.startX, y: stroke.startY, width: w, height: h };
}

/**
 * Updates a square stroke with the new position, maintaining square proportions.
 * @param stroke - The square stroke to update
 * @param pos - The current mouse position
 * @returns The updated square stroke
 */
function updateSquareStroke(stroke: any, pos: Position) {
  console.assert(Number.isFinite(stroke.startX) && Number.isFinite(stroke.startY), "updateSquareStroke: startX/startY invalides", stroke);
  const w = pos.x - stroke.startX;
  const h = pos.y - stroke.startY;
  const side = Math.max(Math.abs(w), Math.abs(h));
  return { ...stroke, x: stroke.startX, y: stroke.startY, width: side * Math.sign(w), height: side * Math.sign(h) };
}

/**
 * Updates a circle stroke with the new position.
 * @param stroke - The circle stroke to update
 * @param pos - The current mouse position
 * @returns The updated circle stroke
 */
function updateCircleStroke(stroke: any, pos: Position) {
  console.assert(Number.isFinite(stroke.startX) && Number.isFinite(stroke.startY), "updateCircleStroke: startX/startY invalides", stroke);
  const w = pos.x - stroke.startX;
  const h = pos.y - stroke.startY;
  const radius = Math.sqrt(w * w + h * h) / 2;
  console.assert(radius >= 0, `updateCircleStroke: radius négatif calculé — w=${w}, h=${h}`);
  return { ...stroke, x: stroke.startX + w / 2, y: stroke.startY + h / 2, radius };
}

/**
 * Updates an ellipse stroke with the new position.
 * @param stroke - The ellipse stroke to update
 * @param pos - The current mouse position
 * @returns The updated ellipse stroke
 */
function updateEllipseStroke(stroke: any, pos: Position) {
  console.assert(Number.isFinite(stroke.startX) && Number.isFinite(stroke.startY), "updateEllipseStroke: startX/startY invalides", stroke);
  const w = pos.x - stroke.startX;
  const h = pos.y - stroke.startY;
  return { ...stroke, x: stroke.startX + w / 2, y: stroke.startY + h / 2, width: Math.abs(w) / 2, height: Math.abs(h) / 2 };
}
