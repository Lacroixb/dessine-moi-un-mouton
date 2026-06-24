import React, { useRef, useState, useEffect } from "react";
import type Konva from "konva";
import CanvasStage from "./components/canvas/CanvasStage";
import BrushControls from "./components/controls/BrushControls";
import ShapeControls from "./components/controls/ShapeControls";
import Toolbar from "./components/controls/Toolbar";
import LayersPanel from "./components/layers/LayersPanel";
import { useLayers } from "./hooks/useLayers";
import { useCollaboration } from "./hooks/useCollaboration";
import { useRecorder } from "./hooks/useRecorder";
import { BRUSH_CONFIG, CANVAS_CONFIG, TOOL_TYPES, type ToolType } from "./constants/tools";

/**
 * Hook personnalisé pour suivre la largeur de la fenêtre.
 * @returns La largeur actuelle de la fenêtre en pixels.
 */
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

const SIDEBAR_W = 260;
const LAYERS_W  = 280;

/**
 * Main application component for the collaborative drawing app.
 * Manages the overall layout, state, and integration of all drawing features.
 */
export default function App() {
  const stageRef  = useRef<Konva.Stage>(null);
  const mainRef   = useRef<HTMLDivElement>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const windowWidth = useWindowWidth();

  const isWide   = windowWidth >= 1100;
  const isMedium = windowWidth >= 700 && windowWidth < 1100;
  const isNarrow = windowWidth < 700;

  const [tool, setTool]               = useState<ToolType>(TOOL_TYPES.BRUSH as ToolType);
  const [brushColor, setBrushColor]   = useState<string>(BRUSH_CONFIG.COLOR.DEFAULT);
  const [brushSize, setBrushSize]     = useState<number>(BRUSH_CONFIG.SIZE.DEFAULT);
  const [brushOpacity, setBrushOpacity] = useState<number>(BRUSH_CONFIG.OPACITY.DEFAULT);
  const [targetDurationS, setTargetDurationS] = useState<number>(10);

  const { isRecording, isExporting, startRecording, stopAndDownload } =
    useRecorder(stageRef, targetDurationS);

  const { layers, dispatch, undo, remotePreviews, publishPreview } = useCollaboration();

  const { activeLayerId, setActiveLayerId, addLayer, deleteLayer, moveLayer, toggleLayerVisibility, renameLayer } =
    useLayers(layers, dispatch, undo);
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    const compute = () => {
      const w = el.clientWidth  - 24;
      const h = el.clientHeight - 24;
      if (w <= 0 || h <= 0) return;
      const scale = Math.min(w / CANVAS_CONFIG.WIDTH, h / CANVAS_CONFIG.HEIGHT, 1);
      setCanvasScale(Math.max(scale, 0.1));
    };

    const ro = new ResizeObserver(compute);
    ro.observe(el);
    compute();
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [isWide, isMedium]);

  const toolbarProps = {
    undo, stageRef, tool, setTool,
    isRecording, isExporting,
    onStartRecording: startRecording,
    onStopAndDownload: stopAndDownload,
    targetDurationS,
    onDurationChange: setTargetDurationS,
  };

  const brushProps = { brushColor, brushSize, brushOpacity, setBrushColor, setBrushSize, setBrushOpacity };

  const canvasEl = (
    <main ref={mainRef} style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'white',
      borderRadius: 8,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      minWidth: 0,
      minHeight: 0,
      flex: 1,
      outline: isRecording ? '3px solid #ef4444' : 'none',
    }}>
      <CanvasStage
        stageRef={stageRef}
        {...brushProps}
        layers={layers}
        dispatch={dispatch}
        publishPreview={publishPreview}
        remotePreviews={remotePreviews}
        activeLayerId={activeLayerId}
        tool={tool}
        scale={canvasScale}
      />
    </main>
  );

  const layersEl = (
    <aside style={{
      width: isWide ? LAYERS_W : isNarrow ? '100%' : LAYERS_W,
      flexShrink: 0,
      overflow: 'auto',
    }}>
      <LayersPanel
        layers={layers}
        activeLayerId={activeLayerId}
        onAddLayer={addLayer}
        onSelectLayer={setActiveLayerId}
        onToggleVisibility={toggleLayerVisibility}
        onMoveLayer={moveLayer}
        onDeleteLayer={deleteLayer}
        onRenameLayer={renameLayer}
      />
    </aside>
  );

  const statusText = isExporting ? "⏳ Export…" : isRecording ? "⏺ Rec" : `${Math.round(canvasScale * 100)}%`;

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#f3f4f6',
      padding: 10,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      overflow: 'hidden',
    }}>

      {}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>Drawing App</h1>
        <span style={{ fontSize: 12, color: '#6b7280' }}>{statusText}</span>
      </header>

      {}
      {isWide && (
        <div style={{ flex: 1, display: 'flex', gap: 10, minHeight: 0 }}>
          <aside style={{ width: SIDEBAR_W, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto' }}>
            <Toolbar {...toolbarProps} />
            <ShapeControls tool={tool} setTool={setTool} />
            <BrushControls {...brushProps} />
          </aside>
          {canvasEl}
          {layersEl}
        </div>
      )}

      {}
      {isMedium && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
          {}
          <div style={{
            display: 'flex',
            gap: 8,
            flexShrink: 0,
            overflowX: 'auto',
            alignItems: 'stretch',
            paddingBottom: 2,
          }}>
            <Toolbar {...toolbarProps} compact />
            <ShapeControls tool={tool} setTool={setTool} compact />
            <BrushControls {...brushProps} compact />
          </div>
          {}
          <div style={{ flex: 1, display: 'flex', gap: 8, minHeight: 0 }}>
            {canvasEl}
            {layersEl}
          </div>
        </div>
      )}

      {}
      {isNarrow && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
          {}
          <div style={{
            display: 'flex',
            gap: 8,
            flexShrink: 0,
            overflowX: 'auto',
            alignItems: 'stretch',
            paddingBottom: 2,
          }}>
            <Toolbar {...toolbarProps} compact />
            <ShapeControls tool={tool} setTool={setTool} compact />
            <BrushControls {...brushProps} compact />
          </div>
          {}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {canvasEl}
          </div>
          {}
          <div style={{ flexShrink: 0, maxHeight: '30vh', overflowY: 'auto' }}>
            {layersEl}
          </div>
        </div>
      )}

    </div>
  );
}