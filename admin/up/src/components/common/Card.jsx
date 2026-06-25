const Card = ({
  children,
  className = '',
  padding = 'md',
  hoverable = false,
  bordered = true,
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={`rounded-2xl bg-white shadow-sm ${
        bordered ? 'border border-slate-200' : ''
      } ${paddingClasses[padding]} ${
        hoverable ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-lg' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

export default Card