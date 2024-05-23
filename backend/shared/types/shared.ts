import { z } from 'zod';

/* eslint-disable @typescript-eslint/no-redeclare */

export const IdReturnType = z.object({
  id: z.string(),
});
export type IdReturnType = z.infer<typeof IdReturnType>;

export const TimestampReturnType = z.object({
  timestamp: z.string(),
});
export type TimestampReturnType = z.infer<typeof TimestampReturnType>;
