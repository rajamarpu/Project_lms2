const Spinner = ({ size = 'md', fullScreen = false, text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-12 w-12 border-4',
  }

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-slate-300 border-t-teal-600`}
      />
      {text && <p className="text-sm font-medium text-slate-600">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-999 flex items-center justify-center bg-white/70 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return <div className="flex items-center justify-center py-10">{content}</div>
}

export default Spinner