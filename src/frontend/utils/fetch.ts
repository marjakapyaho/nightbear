const API_ROOT = '';

export const callFetch = async <T>(route: string, method = 'GET', bodyObj?: T) => {
  return fetch(`${API_ROOT}/api/v1/${route}`, {
    method,
    body: JSON.stringify(bodyObj),
  }).then((res: Response) => {
    if (!res.ok) {
      return Promise.reject(res.json());
    }
    return res.json();
  });
};
