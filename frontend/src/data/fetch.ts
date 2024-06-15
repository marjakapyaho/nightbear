import { API_KEY_HEADER } from '@nightbear/shared'

const API_ROOT = window.location.host.startsWith('localhost')
  ? 'http://localhost:4000' // this is where we can reach API in local dev
  : '/api' // ...and here when actually deployed somewhere

if (!window.localStorage[API_KEY_HEADER]) {
  window.localStorage[API_KEY_HEADER] = prompt('API said "Unauthorized", update API key:')
}

export const callFetch = async <T>(route: string, method = 'GET', bodyObj?: T) => {
  return fetch(`${API_ROOT}${route}`, {
    method,
    headers: {
      [API_KEY_HEADER]: String(window.localStorage[API_KEY_HEADER]),
      'Content-Type': bodyObj ? 'application/json' : 'text/plain',
    },
    body: JSON.stringify(bodyObj),
  }).then((res: Response) => {
    if (res.status === 401) {
      delete window.localStorage[API_KEY_HEADER]
    }
    if (!res.ok) {
      return Promise.reject(res.json())
    }
    return res.json()
  })
}
