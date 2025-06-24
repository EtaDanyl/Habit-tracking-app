export function getSurrounding7Days() {
  const days = []
  const today = new Date()

  for (let i = -5; i <= 5; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    days.push(date.toISOString().split('T')[0])
  }

  return days
}
