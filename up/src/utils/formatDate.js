export const formatDate = (date, format = 'medium') => {
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }

  if (format === 'short') {
    options.month = 'numeric'
    options.day = 'numeric'
    delete options.hour
    delete options.minute
  }

  return new Intl.DateTimeFormat('en-IN', options).format(new Date(date))
}