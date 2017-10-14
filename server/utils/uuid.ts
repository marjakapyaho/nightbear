// Generates an RFC 4122 Version 4 compliant UUID
// @see http://stackoverflow.com/a/2117523
export function getUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0; // tslint:disable-line:no-bitwise
    const v = c === 'x' ? r : (r & 0x3 | 0x8); // tslint:disable-line:no-bitwise
    return v.toString(16);
  });
}
