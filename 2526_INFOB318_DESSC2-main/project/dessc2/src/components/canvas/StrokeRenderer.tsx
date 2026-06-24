import React from "react";
import { Line, Rect, Circle, Ellipse } from "react-konva";
import type { Stroke } from "../../types/drawing";

/**
 * Props for the StrokeRenderer component.
 */
interface StrokeRendererProps {
  stroke: Stroke;
}

/**
 * Memoized component that renders different Konva shapes based on the stroke type.
 */
export const StrokeRenderer = React.memo(({ stroke }: StrokeRendererProps) => {
  const isEraser = stroke.type === "eraser";

  switch (stroke.type) {
    case "brush":
    case "eraser":
      return (
        <Line
          key={stroke.id}
          points={stroke.points}
          stroke={stroke.color}
          strokeWidth={stroke.size}
          opacity={isEraser ? 1 : stroke.opacity}
          globalCompositeOperation={
            isEraser ? "destination-out" : "source-over"
          }
          lineCap="round"
          lineJoin="round"
          listening={false}
        />
      );

    case "rectangle":
    case "square":
      return (
        <Rect
          key={stroke.id}
          x={stroke.x}
          y={stroke.y}
          width={stroke.width}
          height={stroke.height}
          stroke={stroke.color}
          strokeWidth={stroke.size}
          opacity={stroke.opacity}
          listening={false}
        />
      );

    case "circle":
      return (
        <Circle
          key={stroke.id}
          x={stroke.x}
          y={stroke.y}
          radius={stroke.radius}
          stroke={stroke.color}
          strokeWidth={stroke.size}
          opacity={stroke.opacity}
          listening={false}
        />
      );

    case "ellipse":
      return (
        <Ellipse
          key={stroke.id}
          x={stroke.x}
          y={stroke.y}
          radiusX={stroke.width / 2}
          radiusY={stroke.height / 2}
          stroke={stroke.color}
          strokeWidth={stroke.size}
          opacity={stroke.opacity}
          listening={false}
        />
      );

    case "line":
      return (
        <Line
          key={stroke.id}
          points={stroke.points}
          stroke={stroke.color}
          strokeWidth={stroke.size}
          opacity={stroke.opacity}
          listening={false}
        />
      );

    default:
      return null;
  }
});

StrokeRenderer.displayName = "StrokeRenderer";
