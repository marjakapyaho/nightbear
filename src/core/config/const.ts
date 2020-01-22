import { HOUR_IN_MS } from 'core/calculations/calculations';

export const PIXELS_PER_HOUR = 100; // when not scaling a timeline dynamically, use this standard width per unit of time, for consistency across the app
export const PIXELS_PER_MS = PIXELS_PER_HOUR / HOUR_IN_MS; // this is the less intuitive, but more useful version of the above
