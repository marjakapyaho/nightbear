export type ObjMap<K extends string, V> = { [P in K]: V };

export function mapObject<K extends string, V1, V2>(
  object: ObjMap<K, V1>,
  mapper: (v: V1, k: K) => V2,
): ObjMap<K, V2> {
  return Object.keys(object)
    .map<[ K, V1 ]>((key: K) => [ key, object[key] ])
    .reduce((memo, next) => {
      const [ key, val ] = next;
      memo[key] = mapper(val, key);
      return memo;
    }, {} as ObjMap<K, V2>);
}
