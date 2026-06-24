import React from "react";

/**
 * Props for the ColorPicker component.
 */
interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  id?: string;
}

/**
 * A color picker component with a visual color input and hex value display.
 */
export function ColorPicker({ label, value, onChange, id }: ColorPickerProps) {
  const pickerId = id || `color-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label 
        htmlFor={pickerId} 
        style={{ 
          fontSize: '14px', 
          fontWeight: '500', 
          color: '#374151' 
        }}
      >
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          id={pickerId}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ 
            height: '40px', 
            width: '80px', 
            borderRadius: '4px',
            cursor: 'pointer',
            border: '1px solid #d1d5db'
          }}
        />
        <span style={{ 
          fontSize: '14px', 
          color: '#6b7280',
          fontFamily: 'monospace'
        }}>
          {value}
        </span>
      </div>
    </div>
  );
}
