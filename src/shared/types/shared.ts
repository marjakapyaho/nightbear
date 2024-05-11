import { z } from 'zod';
import { Situation } from './analyser';

/* eslint-disable @typescript-eslint/no-redeclare */

export const IdReturnType = z.object({
  id: z.string(),
});
export type IdReturnType = z.infer<typeof IdReturnType>;
