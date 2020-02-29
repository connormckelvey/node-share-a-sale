export const formatDate = (d: Date): string => {
  const parts = d.toISOString().split('T')[0].split('-')
  const year = parts.shift()
  if (year) {
    parts.push(year)
  }
  return parts.join('/')
}