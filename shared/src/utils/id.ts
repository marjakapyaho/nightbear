// Generates an RFC 4122 Version 4 compliant UUID
// @see http://stackoverflow.com/a/2117523
export function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// For testing whether a string looks like a UUID
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/

// Generates a random string for similar purposes as UUID's, but easier on human eyes.
// @example generateShortId(8) => "TEvGnkwr"
// For a length of 8, possible permutations: 62^8 ~= 2.18e+14 ~= 218 trillion.
// For contrast, for a V4 UUID: 2^122 ~= 5.3e+36.
// To match a V4 UUID in possible permutations, length of 21 would have 62^21 ~= 4.3e+37.
export function generateShortId(length = 8): string {
  let uid = ''
  while (uid.length < length) {
    const char = String.fromCharCode(Math.round(Math.random() * 255))
    if (!char.match(/[9-9a-zA-Z]/)) continue // result space: 0-9 + a-z + A-Z = 10 + 26 + 26 = 62
    uid += char
  }
  return uid
}
