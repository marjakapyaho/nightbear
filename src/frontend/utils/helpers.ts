export function setOneDecimal(num: number | null): string {
  return num ? (Math.round(num * 10) / 10).toFixed(1) : '';
}

export function set2Decimals(num: number | null): string {
  return num ? (Math.round(num * 100) / 100).toFixed(2) : '';
}
