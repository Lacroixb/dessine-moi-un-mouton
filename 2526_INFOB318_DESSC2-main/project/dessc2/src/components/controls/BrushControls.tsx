import React from "react";
import { ColorPicker } from "../ui/ColorPicker";
import { Slider } from "../ui/Slider";
import { BRUSH_CONFIG } from "../../constants/tools";

/**
 * Props for the BrushControls component.
 */
interface BrushControlsProps {
  brushColor: string;
  brushSize: number;
  brushOpacity: number;
  setBrushColor: (v: string) => void;
  setBrushSize: (v: number) => void;
  setBrushOpacity: (v: number) => void;
  compact?: boolean;
}

/**
 * Component for controlling brush settings including color, size, and opacity.
 */
export default function BrushControls({
  brushColor, brushSize, brushOpacity,
  setBrushColor, setBrushSize, setBrushOpacity,
  compact = false,
}: BrushControlsProps) {
  const p = compact ? 8 : 16;

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
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: '#1f2937', marginTop: 0 }}>
          Brush
        </h3>
      )}
      <div style={{
        display: 'flex',
        flexDirection: compact ? 'row' : 'column',
        gap: compact ? 12 : 16,
        alignItems: compact ? 'center' : 'stretch',
        flexWrap: compact ? 'wrap' : 'nowrap',
      }}>
        <ColorPicker label={compact ? '' : 'Color'} value={brushColor} onChange={setBrushColor} />

        <div style={{ flex: compact ? '1 1 120px' : undefined, minWidth: compact ? 100 : undefined }}>
          <Slider
            label="Size"
            value={brushSize}
            onChange={setBrushSize}
            min={BRUSH_CONFIG.SIZE.MIN}
            max={BRUSH_CONFIG.SIZE.MAX}
            displayValue
          />
        </div>

        <div style={{ flex: compact ? '1 1 120px' : undefined, minWidth: compact ? 100 : undefined }}>
          <Slider
            label="Opacity"
            value={brushOpacity}
            onChange={setBrushOpacity}
            min={BRUSH_CONFIG.OPACITY.MIN}
            max={BRUSH_CONFIG.OPACITY.MAX}
            step={BRUSH_CONFIG.OPACITY.STEP}
            displayValue
          />
        </div>
      </div>
    </div>
  );
}