export function DB_URL_SET(newDbUrl: string) {
  return {
    type: 'DB_URL_SET' as 'DB_URL_SET',
    newDbUrl,
  };
}

export type ConfigVarsAction = Readonly<ReturnType<typeof DB_URL_SET>>;
