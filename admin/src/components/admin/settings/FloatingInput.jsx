import React, { useState } from 'react';

const FloatingInput = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  disabled = false,
  icon: Icon,
}) => {
  const [focused, setFocused] = useState(false);
  const floated = focused || (value != null && String(value).length > 0);

  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 admin-text-muted pointer-events-none"
        />
      )}
      <input
        id={id}
        type={type}
        value={value}
        disabled={disabled}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`peer w-full rounded-2xl border pt-6 pb-3 text-base admin-text-primary transition-all duration-300 focus:outline-none ${
          Icon ? 'pl-11 pr-4' : 'px-4'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        style={{
          background: 'var(--admin-surface-raised)',
          borderColor: focused ? 'rgba(59,130,246,0.55)' : 'var(--admin-border)',
          boxShadow: focused ? '0 0 0 3px rgba(59,130,246,0.2), 0 8px 24px rgba(59,130,246,0.12)' : 'none',
        }}
      />
      <label
        htmlFor={id}
        className={`absolute transition-all duration-200 pointer-events-none admin-text-muted ${
          Icon ? 'left-11' : 'left-4'
        } ${floated ? 'top-2 text-[11px] font-semibold uppercase tracking-wide' : 'top-1/2 -translate-y-1/2 text-sm'}`}
        style={focused ? { color: '#3B82F6' } : undefined}
      >
        {label}
      </label>
    </div>
  );
};

export default FloatingInput;
