const RATES: Record<string, number> = {
  USD: 1,
  COP: 4000,
  EUR: 0.92,
  MXN: 17,
  BRL: 5,
  GBP: 0.79,
  JPY: 150,
};

export function convert(amount: number, from: string, to: string): number {
  const f = RATES[from] || 1;
  const t = RATES[to] || 1;
  return (amount / f) * t;
}

export function formatMoney(amount: number | null, currency: string, originalCurrency?: string): string {
  if (amount == null) return 'N/A';
  const cur = (typeof window !== 'undefined' && localStorage.getItem('nex_currency')) || 'COP';
  const target = currency ? cur : cur;
  const converted = originalCurrency && originalCurrency !== target ? convert(amount, originalCurrency, target) : amount;
  const rounded = target === 'JPY' ? Math.round(converted) : Math.round(converted * 100) / 100;
  return `${rounded.toLocaleString()} ${target}`;
}

export function getSelectedCurrency(): string {
  return (typeof window !== 'undefined' && localStorage.getItem('nex_currency')) || 'COP';
}

export function isConverted(originalCurrency: string): boolean {
  const sel = getSelectedCurrency();
  return !!originalCurrency && originalCurrency !== sel;
}