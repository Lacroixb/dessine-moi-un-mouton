import type { ToolType } from "../constants/tools";

/**
 * Type alias for stroke types, equivalent to ToolType.
 */
export type StrokeType = ToolType;

/**
 * Base interface for all stroke types, containing common properties.
 */
interface BaseStroke {
  id: string;
  color: string;
  size: number;
  opacity: number;
}

/**
 * Interface for brush stroke data.
 */
export interface BrushStroke extends BaseStroke {
  type: "brush";
  points: number[];
}

/**
 * Interface for eraser stroke data.
 */
export interface EraserStroke extends BaseStroke {
  type: "eraser";
  points: number[];
}

/**
 * Interface for rectangle and square stroke data.
 */
export interface RectangleStroke extends BaseStroke {
  type: "rectangle" | "square";
  x: number;
  y: number;
  width: number;
  height: number;
  startX: number;
  startY: number;
}

/**
 * Interface for circle stroke data.
 */
export interface CircleStroke extends BaseStroke {
  type: "circle";
  x: number;
  y: number;
  radius: number;
  startX: number;
  startY: number;
}

/**
 * Interface for ellipse stroke data.
 */
export interface EllipseStroke extends BaseStroke {
  type: "ellipse";
  x: number;
  y: number;
  width: number;
  height: number;
  startX: number;
  startY: number;
}

/**
 * Interface for line stroke data.
 */
export interface LineStroke extends BaseStroke {
  type: "line";
  points: number[];
  startX: number;
  startY: number;
}

/**
 * Union type representing all possible stroke types.
 */
export type Stroke =
  | BrushStroke
  | EraserStroke
  | RectangleStroke
  | CircleStroke
  | EllipseStroke
  | LineStroke;

/**
 * Interface representing a drawing layer.
 */
export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  strokes: Stroke[];
}

/**
 * Interface for 2D position coordinates.
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Interface for brush tool settings.
 */
export interface BrushSettings {
  color: string;
  size: number;
  opacity: number;
}

/**
 * Interface for the overall drawing application state.
 */
export interface DrawingState {
  layers: Layer[];
  activeLayerId: string;
  tool: StrokeType;
  brushSettings: BrushSettings;
}
