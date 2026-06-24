/**
 * Available drawing tool types as string constants.
 */
export const TOOL_TYPES = {
  BRUSH: "brush",
  ERASER: "eraser",
  RECTANGLE: "rectangle",
  SQUARE: "square",
  CIRCLE: "circle",
  ELLIPSE: "ellipse",
  LINE: "line",
} as const;

/**
 * Union type of all available tool types.
 */
export type ToolType = (typeof TOOL_TYPES)[keyof typeof TOOL_TYPES];

/**
 * Configuration constants for brush tool settings.
 */
export const BRUSH_CONFIG = {
  SIZE: {
    MIN: 1,
    MAX: 60,
    DEFAULT: 5,
  },
  OPACITY: {
    MIN: 0.05,
    MAX: 1,
    STEP: 0.05,
    DEFAULT: 1,
  },
  COLOR: {
    DEFAULT: "#000000",
  },
} as const;

/**
 * Configuration constants for canvas dimensions and appearance.
 */
export const CANVAS_CONFIG = {
  WIDTH: 1200,
  HEIGHT: 750,
  BACKGROUND: "#ffffff",
} as const;

/**
 * Array of tool configurations for UI display, including labels and icons.
 */
export const TOOL_CONFIGS = [
  { id: TOOL_TYPES.BRUSH, label: "Brush", icon: "✏️" },
  { id: TOOL_TYPES.ERASER, label: "Eraser", icon: "🧼" },
  { id: TOOL_TYPES.RECTANGLE, label: "Rectangle", icon: "▭" },
  { id: TOOL_TYPES.SQUARE, label: "Square", icon: "▢" },
  { id: TOOL_TYPES.CIRCLE, label: "Circle", icon: "◯" },
  { id: TOOL_TYPES.ELLIPSE, label: "Ellipse", icon: "⬭" },
  { id: TOOL_TYPES.LINE, label: "Line", icon: "─" },
] as const;
