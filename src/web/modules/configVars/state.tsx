export type ConfigVarsState = Readonly<{
  remoteDbUrl: string;
}>;

export const configVarsInitState: ConfigVarsState = {
  remoteDbUrl: '',
};
