// Format a number as currency (INR by default)
export function formatCurrency(amount, currency = 'INR') {
  if (typeof amount !== 'number') return amount;
  return amount.toLocaleString('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  });
}

// Format a date as YYYY-MM-DD or a readable string
export function formatDate(date, opts = { year: 'numeric', month: 'short', day: 'numeric' }) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d)) return date;
  return d.toLocaleDateString('en-IN', opts);
} 