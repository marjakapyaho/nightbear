export function setOneDecimal(num: number | null): string {
  return num ? (Math.round(num * 10) / 10).toFixed(1) : '';
}

export function setDecimals(num: number | null, decimals: number): string {
  return num ? num.toFixed(decimals) : '';
}
