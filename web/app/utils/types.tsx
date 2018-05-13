export function assertExhausted(x: never): any {
  throw new Error(
    `Assumed all cases handled during compile-time, but found an exception during run-time: ${x}`,
  );
}
