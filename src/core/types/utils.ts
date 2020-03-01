export type TypeOfArray<T> = T extends Array<infer U> ? U : never;
