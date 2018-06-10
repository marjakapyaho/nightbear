export function TODO() {
  return {
    type: 'TODO' as 'TODO',
  };
}

export type PouchDbAction = Readonly<ReturnType<typeof TODO>>;
