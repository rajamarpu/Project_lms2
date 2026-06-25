const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  leftIcon = null,
  rightIcon = null,
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        className={`flex items-center gap-2 rounded-xl border bg-white px-3 transition-all duration-200 ${
          error
            ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-200'
            : 'border-slate-200 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100'
        } ${disabled ? 'cursor-not-allowed bg-slate-100' : ''}`}
      >
        {leftIcon && <span className="text-slate-400">{leftIcon}</span>}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`input border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 ${inputClassName}`}
        />

        {rightIcon && <span className="text-slate-400">{rightIcon}</span>}
      </div>

      {error ? (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-sm text-slate-500">{helperText}</p>
      ) : null}
    </div>
  )
}

export default Input