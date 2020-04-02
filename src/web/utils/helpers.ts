export function set2Decimals(num: number | null): string {
  return num ? (Math.round(num * 10) / 10).toFixed(1) : '';
}