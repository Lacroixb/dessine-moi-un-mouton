import React from "react";
import type Konva from "konva";
import { Stage, Layer } from "react-konva";
import { StrokeRenderer } from "./StrokeRenderer";
import { useDrawing } from "../../hooks/useDrawing";
import { CANVAS_CONFIG } from "../../constants/tools";
import type { Layer as LayerType, Stroke } from "../../types/drawing";
import type { DrawingEvent } from "../../types/events";
import type { RemotePreview } from "../../hooks/useCollaboration";

/**
 * Props for the CanvasStage component.
 */
interface CanvasStageProps {
  stageRef: React.RefObject<Konva.Stage>;
  brushColor: string;
  brushSize: number;
  brushOpacity: number;
  layers: LayerType[];
  dispatch: (event: DrawingEvent) => void;
  publishPreview: (stroke: Stroke | null, layerId: string) => void;
  remotePreviews: Map<string, RemotePreview>;
  activeLayerId: string;
  tool: string;
  scale?: number;
  onPreviewUpdate?: () => void;
}

/**
 * The main canvas component using Konva for rendering drawing layers and handling user interactions.
 */
export default function CanvasStage({
  stageRef,
  brushColor,
  brushSize,
  brushOpacity,
  layers,
  dispatch,
  publishPreview,
  remotePreviews,
  activeLayerId,
  tool,
  scale = 1,
  onPreviewUpdate,
}: CanvasStageProps) {
  const { previewStroke, handlePointerDown, handlePointerMove, handlePointerUp } = useDrawing({
    stageRef,
    layers,
    dispatch,
    publishPreview,
    activeLayerId,
    tool,
    brushColor,
    brushSize,
    brushOpacity,
    onPreviewUpdate,
  });

  return (
    <div style={{
      border: '2px solid #d1d5db',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      backgroundColor: 'white',
      cursor: 'crosshair',
      width: CANVAS_CONFIG.WIDTH * scale,
      height: CANVAS_CONFIG.HEIGHT * scale,
      flexShrink: 0,
    }}>
      {/* @ts-ignore */}
      <Stage
        width={CANVAS_CONFIG.WIDTH * scale}
        height={CANVAS_CONFIG.HEIGHT * scale}
        scaleX={scale}
        scaleY={scale}
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {layers.map((layer) => {
          const localPreview = previewStroke && activeLayerId === layer.id ? previewStroke : null;
          const layerRemotePreviews = Array.from(remotePreviews.values()).filter(
            (p) => p.layerId === layer.id
          );

          return (
            <Layer key={layer.id} visible={layer.visible}>
              {layer.strokes.map((stroke) => (
                <StrokeRenderer key={stroke.id} stroke={stroke} />
              ))}
              {localPreview && <StrokeRenderer stroke={localPreview} />}
              {layerRemotePreviews.map(({ stroke }) => (
                <StrokeRenderer key={stroke.id} stroke={stroke} />
              ))}
            </Layer>
          );
        })}
      </Stage>
    </div>
  );
}