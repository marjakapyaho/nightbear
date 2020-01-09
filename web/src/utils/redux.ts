type valueof<T> = T[keyof T];
type ActionCreatorMap = { [key: string]: (...args: any[]) => object };
type ActionCreatorMapWithType<T extends { [key: string]: (...args: any) => any }> = {
  [K in keyof T]: ActionCreatorWithType<T[K], K>
};
type ActionCreatorWithType<A, T> = A extends (...args: any) => infer R
  ? (...args: Parameters<A>) => Readonly<R & { type: T }>
  : never;

// The union of all possible return types from the given action creator map
export type ActionUnionFrom<T extends ActionCreatorMap> = valueof<{ [P in keyof T]: ReturnType<T[P]> }>; // returns the union of all possible return types from the given action creator map

// Updates the given map of action creators so that their return value (i.e. the action object)
// contains a "type" key with the type of each action, as determined by their key in the given map.
export function actionsWithType<T extends ActionCreatorMap>(map: T): ActionCreatorMapWithType<T> {
  return Object.keys(map)
    .map(type => ({
      [type]: (...args: any[]) => ({ type, ...map[type].apply(null, args) }),
    }))
    .reduce((memo, next) => ({ ...memo, ...next }), {} as any);
}
