export const callFetch = async <T>(route: string, method = 'GET', bodyObj?: T) => {
  return fetch(`${import.meta.env.VITE_API_ROOT}${route}`, {
    method,
    headers: bodyObj ? { 'Content-Type': 'application/json' } : undefined,
    body: JSON.stringify(bodyObj),
  }).then((res: Response) => {
    if (!res.ok) {
      return Promise.reject(res.json());
    }
    return res.json();
  });
};
