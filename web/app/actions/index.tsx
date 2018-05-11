export type Action = Readonly<
  | { type: '@@INIT' } // note: the Redux API leaves this unspecified on purpose, but for exhaustiveness checks on type Action, let's include it
  // TODO
>;
