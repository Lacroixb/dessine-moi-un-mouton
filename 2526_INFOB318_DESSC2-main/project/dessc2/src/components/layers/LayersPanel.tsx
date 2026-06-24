import React from "react";
import { Button } from "../ui/Button";
import { LayerItem } from "./LayerItem";
import type { Layer } from "../../types/drawing";

/**
 * Props for the LayersPanel component.
 */
interface LayersPanelProps {
  layers: Layer[];
  activeLayerId: string;
  onAddLayer: () => void;
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onMoveLayer: (id: string, direction: "up" | "down") => void;
  onDeleteLayer: (id: string) => void;
  onRenameLayer: (id: string, name: string) => void;
}

/**
 * Component displaying a list of drawing layers with controls for adding, selecting, and managing layers.
 */
export default function LayersPanel({
  layers,
  activeLayerId,
  onAddLayer,
  onSelectLayer,
  onToggleVisibility,
  onMoveLayer,
  onDeleteLayer,
  onRenameLayer,
}: LayersPanelProps) {
  return (
    <div style={{ 
      padding: '16px', 
      backgroundColor: 'white', 
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      boxSizing: 'border-box',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600',
          color: '#1f2937',
          margin: 0
        }}>
          Layers
        </h3>
        <Button
          variant="primary"
          onClick={onAddLayer}
          aria-label="Add new layer"
        >
          + Add Layer
        </Button>
      </div>

      <ul style={{ 
        listStyle: 'none', 
        padding: 0, 
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        overflowY: 'auto',
        overflowX: 'hidden',
        flex: 1
      }}>
        {layers.map((layer, index) => (
          <LayerItem
            key={layer.id}
            layer={layer}
            isActive={layer.id === activeLayerId}
            isFirst={index === 0}
            isLast={index === layers.length - 1}
            onSelect={() => onSelectLayer(layer.id)}
            onToggleVisibility={() => onToggleVisibility(layer.id)}
            onMoveUp={() => onMoveLayer(layer.id, "up")}
            onMoveDown={() => onMoveLayer(layer.id, "down")}
            onDelete={() => onDeleteLayer(layer.id)}
            onRename={(name) => onRenameLayer(layer.id, name)}
          />
        ))}
      </ul>

      {layers.length === 0 && (
        <p style={{ 
          textAlign: 'center', 
          color: '#6b7280', 
          padding: '16px 0',
          margin: 0
        }}>
        </p>
      )}
    </div>
  );
}
