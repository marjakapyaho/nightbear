export const isNumberValid = (val: number | string) => {
  return /^\d+([.,]\d+)?$/.test(`${val}`)
}

export const toValidNumber = (value: string, decimals = 1): number => {
  const valueAsNumberWithoutRounding = Number.parseFloat(value.replace(',', '.'))
  const valueAsNumberRounded = parseFloat(valueAsNumberWithoutRounding.toFixed(decimals))
  return Number.isNaN(valueAsNumberRounded) ? 0 : valueAsNumberRounded
}

export const replaceCommaWithDot = (value: string | number) => `${value}`.replace(',', '.')

export const numberToUINumber = (num: number, decimals = 1) =>
  replaceCommaWithDot(num.toFixed(decimals))
