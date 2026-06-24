import React from "react";

/**
 * Props for the Slider component.
 */
interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  id?: string;
  displayValue?: boolean;
}

/**
 * A slider component with a range input, label, and optional value display.
 */
export function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  id,
  displayValue = true,
}: SliderProps) {
  const sliderId = id || `slider-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label 
          htmlFor={sliderId} 
          style={{ 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#374151' 
          }}
        >
          {label}
        </label>
        {displayValue && (
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            {typeof value === "number" ? value.toFixed(step < 1 ? 2 : 0) : value}
          </span>
        )}
      </div>
      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        style={{ 
          width: '100%', 
          height: '8px', 
          borderRadius: '4px',
          cursor: 'pointer',
          boxSizing: 'border-box'
        }}
      />
    </div>
  );
}
