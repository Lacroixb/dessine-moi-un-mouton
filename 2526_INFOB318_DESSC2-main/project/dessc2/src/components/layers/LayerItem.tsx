import React, { useState } from "react";
import type { Layer } from "../../types/drawing";

/**
 * Props for the LayerItem component.
 */
interface LayerItemProps {
  layer: Layer;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
}

/**
 * Component representing a single layer in the layers list with controls for selection, visibility, movement, deletion, and renaming.
 */
export function LayerItem({
  layer,
  isActive,
  isFirst,
  isLast,
  onSelect,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onDelete,
  onRename,
}: LayerItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(layer.name);

  /**
   * Démarre le mode de renommage du calque.
   */
  function handleRenameStart() {
    setIsRenaming(true);
    setRenameValue(layer.name);
  }

  /**
   * Valide et applique le nouveau nom du calque.
   */
  function handleRenameCommit() {
    if (renameValue.trim()) {
      onRename(renameValue.trim());
    }
    setIsRenaming(false);
  }

  /**
   * Annule le renommage et revient au nom original.
   */
  function handleRenameCancel() {
    setRenameValue(layer.name);
    setIsRenaming(false);
  }

  const liStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    borderRadius: '8px',
    border: isActive ? '2px solid #3b82f6' : '2px solid #e5e7eb',
    backgroundColor: isActive ? '#eff6ff' : 'white',
    transition: 'all 0.2s',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '4px 8px',
    fontSize: '12px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: '#f3f4f6',
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    opacity: 0.3,
    cursor: 'not-allowed',
  };

  return (
    <li style={liStyle}>
      <input
        type="radio"
        checked={isActive}
        onChange={onSelect}
        style={{ cursor: 'pointer' }}
        aria-label={`Select ${layer.name}`}
      />

      {isRenaming ? (
        <input
          type="text"
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={handleRenameCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRenameCommit();
            if (e.key === "Escape") handleRenameCancel();
          }}
          style={{
            flex: 1,
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
          }}
          autoFocus
          aria-label="Rename layer"
        />
      ) : (
        <span
          onDoubleClick={handleRenameStart}
          style={{
            flex: 1,
            cursor: 'pointer',
            userSelect: 'none',
          }}
          title="Double-click to rename"
        >
          {layer.name}
        </span>
      )}

      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          onClick={onToggleVisibility}
          style={buttonStyle}
          aria-label={layer.visible ? "Hide layer" : "Show layer"}
        >
          {layer.visible ? "👁️" : "👁️‍🗨️"}
        </button>

        <button
          onClick={onMoveUp}
          disabled={isFirst}
          style={isFirst ? disabledButtonStyle : buttonStyle}
          aria-label="Move layer up"
        >
          ↑
        </button>

        <button
          onClick={onMoveDown}
          disabled={isLast}
          style={isLast ? disabledButtonStyle : buttonStyle}
          aria-label="Move layer down"
        >
          ↓
        </button>

        <button
          onClick={onDelete}
          style={{
            ...buttonStyle,
            backgroundColor: '#fee2e2',
            color: '#dc2626',
          }}
          aria-label="Delete layer"
        >
          🗑️
        </button>
      </div>
    </li>
  );
}
