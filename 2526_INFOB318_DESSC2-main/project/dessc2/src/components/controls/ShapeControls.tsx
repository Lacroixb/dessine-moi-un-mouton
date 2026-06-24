import React from "react";
import { ToolButton } from "../ui/ToolButton";
import { TOOL_CONFIGS, TOOL_TYPES, type ToolType } from "../../constants/tools";

/**
 * Props for the ShapeControls component.
 */
interface ShapeControlsProps {
  tool: ToolType;
  setTool: (tool: ToolType) => void;
  compact?: boolean;
}

/**
 * Component for selecting drawing tools (shapes) with a grid of tool buttons.
 */
export default function ShapeControls({ tool, setTool, compact = false }: ShapeControlsProps) {
  const shapeTools = TOOL_CONFIGS.filter(
    (t: typeof TOOL_CONFIGS[number]) => t.id !== TOOL_TYPES.ERASER
  );

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
          Tools
        </h3>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: compact ? 'repeat(3, 36px)' : '1fr 1fr',
        gap: compact ? 4 : 8,
      }}>
        {shapeTools.map((toolConfig: typeof TOOL_CONFIGS[number]) => (
          compact ? (
            <button
              key={toolConfig.id}
              onClick={() => setTool(toolConfig.id as ToolType)}
              title={toolConfig.label}
              aria-pressed={tool === toolConfig.id}
              style={{
                padding: '6px',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: tool === toolConfig.id ? '#3b82f6' : '#f3f4f6',
                color: tool === toolConfig.id ? 'white' : '#374151',
                fontSize: 16,
                lineHeight: 1,
              }}
            >
              {toolConfig.icon}
            </button>
          ) : (
            <ToolButton
              key={toolConfig.id}
              icon={toolConfig.icon}
              label={toolConfig.label}
              isActive={tool === toolConfig.id}
              onClick={() => setTool(toolConfig.id as ToolType)}
            />
          )
        ))}
      </div>
    </div>
  );
}