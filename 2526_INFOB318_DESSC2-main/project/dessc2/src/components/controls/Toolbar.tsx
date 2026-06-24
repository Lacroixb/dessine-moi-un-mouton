import React from "react";
import { Button } from "../ui/Button";
import { TOOL_TYPES, type ToolType } from "../../constants/tools";

/**
 * Props for the Toolbar component.
 */
interface ToolbarProps {
  undo: () => void;
  stageRef: React.RefObject<any>;
  tool: ToolType;
  setTool: (tool: ToolType) => void;
  isRecording: boolean;
  isExporting: boolean;
  onStartRecording: () => void;
  onStopAndDownload: () => void;
  targetDurationS: number;
  onDurationChange: (v: number) => void;
  compact?: boolean;
}

const MAX_DURATION = 120;

/**
 * Component providing action buttons for undo, export, eraser tool, and timelapse recording controls.
 */
export default function Toolbar({
  undo, stageRef, tool, setTool,
  isRecording, isExporting, onStartRecording, onStopAndDownload,
  targetDurationS, onDurationChange,
  compact = false,
}: ToolbarProps) {
  /**
   * Exporte le canvas actuel en tant qu'image PNG.
   */
  function exportAsPNG() {
    const uri = stageRef.current?.toDataURL();
    if (!uri) return;
    const link = document.createElement("a");
    link.href = uri;
    link.download = `drawing-${Date.now()}.png`;
    link.click();
  }

  const p = compact ? 8 : 16;
  const gap = compact ? 6 : 8;
  const titleSize = compact ? 13 : 18;

  return (
    <div style={{
      padding: p,
      backgroundColor: 'white',
      borderRadius: 8,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb',
      boxSizing: 'border-box',
    }}>
      {!compact && (
        <h3 style={{ fontSize: titleSize, fontWeight: 600, marginBottom: 12, color: '#1f2937', marginTop: 0 }}>
          Actions
        </h3>
      )}

      <div style={{ display: 'flex', flexDirection: compact ? 'row' : 'column', gap, flexWrap: 'wrap', alignItems: compact ? 'center' : 'stretch' }}>
        <Button variant="ghost" onClick={undo} aria-label="Undo">↶ Undo</Button>
        <Button variant="ghost" onClick={exportAsPNG} aria-label="Export PNG">💾 PNG</Button>

        <div style={{ width: compact ? 1 : '100%', height: compact ? 20 : 1, backgroundColor: '#e5e7eb', margin: compact ? '0 2px' : '4px 0', flexShrink: 0 }} />

        <Button
          variant={tool === TOOL_TYPES.ERASER ? "primary" : "ghost"}
          onClick={() => setTool(TOOL_TYPES.ERASER as ToolType)}
          isActive={tool === TOOL_TYPES.ERASER}
        >
          🧼 {!compact && 'Eraser'}
        </Button>

        <div style={{ width: compact ? 1 : '100%', height: compact ? 20 : 1, backgroundColor: '#e5e7eb', margin: compact ? '0 2px' : '4px 0', flexShrink: 0 }} />
        {isExporting ? (
          <Button variant="ghost" disabled>⏳ Export…</Button>
        ) : isRecording ? (
          <Button variant="danger" onClick={onStopAndDownload}>⏹ Stop</Button>
        ) : (
          <Button variant="ghost" onClick={onStartRecording}>⏺ Rec</Button>
        )}

        {!isRecording && !isExporting && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {!compact && <span style={{ fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>Durée (s)</span>}
            <input
              type="number"
              value={targetDurationS}
              min={1}
              max={MAX_DURATION}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!isNaN(v) && v > 0) onDurationChange(Math.min(v, MAX_DURATION));
              }}
              style={{ width: 48, padding: '4px 6px', border: '1px solid #d1d5db', borderRadius: 4, fontSize: 13 }}
            />
            {!compact && <span style={{ fontSize: 12, color: '#9ca3af' }}>s</span>}
          </div>
        )}
      </div>
    </div>
  );
}