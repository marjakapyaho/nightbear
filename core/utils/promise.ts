// Convenience helper for creating a rejected Promise containing an Error
export function reject(message: string): Promise<any> {
  return Promise.reject(new Error(message));
}
