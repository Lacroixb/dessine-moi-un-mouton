import React from "react";

/**
 * Props for the Button component.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "danger" | "ghost";
  isActive?: boolean;
  children: React.ReactNode;
}

/**
 * A styled button component with multiple variants and active state support.
 */
export function Button({
  variant = "default",
  isActive = false,
  children,
  style,
  ...props
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    fontWeight: isActive ? 'bold' : 'normal',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: isActive ? '#3b82f6' : '#e5e7eb',
      color: isActive ? 'white' : '#374151',
    },
    primary: {
      backgroundColor: '#3b82f6',
      color: 'white',
    },
    danger: {
      backgroundColor: '#ef4444',
      color: 'white',
    },
    ghost: {
      backgroundColor: isActive ? '#dbeafe' : 'transparent',
      color: '#374151',
    },
  };

  return (
    <button
      style={{ ...baseStyles, ...variantStyles[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
