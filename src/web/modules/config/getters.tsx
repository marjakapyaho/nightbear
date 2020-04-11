import { ConfigState } from 'web/modules/config/state';

export function getNightbearApiUrl(state: ConfigState, apiMethod: string) {
  const base = state.nightbearApiUrl.replace(/\/*$/, ''); // ensure no trailing slash
  return `${base}/${apiMethod}`;
}
