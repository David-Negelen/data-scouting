// Uses window.print() + print.css to produce a clean PDF.
// The caller wraps the target area with id="print-area", then calls this.
export const printReport = () => {
  window.print()
}

export const downloadJSON = (data, filename = 'scout-backup.json') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
