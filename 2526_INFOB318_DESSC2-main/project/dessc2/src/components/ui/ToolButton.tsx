import React from "react";

/**
 * Props for the ToolButton component.
 */
interface ToolButtonProps {
  icon?: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * A button component for tool selection with optional icon and active state styling.
 */
export function ToolButton({
  icon,
  label,
  isActive,
  onClick,
  disabled = false,
}: ToolButtonProps) {
  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    borderRadius: '8px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    backgroundColor: isActive ? '#3b82f6' : '#f3f4f6',
    color: isActive ? 'white' : '#374151',
    fontWeight: isActive ? '600' : 'normal',
    opacity: disabled ? 0.5 : 1,
    boxShadow: isActive ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={buttonStyle}
      aria-pressed={isActive}
      aria-label={label}
    >
      {icon && <span style={{ fontSize: '18px' }}>{icon}</span>}
      <span style={{ fontSize: '14px' }}>{label}</span>
    </button>
  );
}
