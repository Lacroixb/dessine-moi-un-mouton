import type { Layer, Stroke } from "./drawing";

/**
 * Union type representing all possible drawing events for state management and synchronization.
 */
export type DrawingEvent =
  | { type: "ADD_STROKE";         layerId: string; stroke: Stroke }
  | { type: "REMOVE_STROKE";      layerId: string; stroke: Stroke }
  | { type: "ADD_LAYER";          layer: Layer }
  | { type: "REMOVE_LAYER";       layer: Layer }
  | { type: "RENAME_LAYER";       layerId: string; oldName: string; newName: string }
  | { type: "MOVE_LAYER";         layerId: string; fromIndex: number; toIndex: number }
  | { type: "TOGGLE_VISIBILITY";  layerId: string };
