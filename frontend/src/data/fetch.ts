import { API_KEY_HEADER } from '@nightbear/shared'

const API_ROOT = window.location.host.startsWith('localhost')
  ? 'http://localhost:4000' // this is where we can reach API in local dev
  : '//api' // ...and here when actually deployed somewhere

export const callFetch = async <T>(route: string, method = 'GET', bodyObj?: T) => {
  return fetch(`${API_ROOT}${route}`, {
    method,
    headers: {
      [API_KEY_HEADER]: 'DEV_API_KEY', // TODO: MAKE DYNAMIC
      'Content-Type': bodyObj ? 'application/json' : 'text/plain',
    },
    body: JSON.stringify(bodyObj),
  }).then((res: Response) => {
    if (!res.ok) {
      return Promise.reject(res.json())
    }
    return res.json()
  })
}
