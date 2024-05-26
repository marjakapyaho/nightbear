export const getUserKeyFromUrlParams = () => {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  const user = urlParams.get('user')
  return `app:${user || 'unknown'}`
}
