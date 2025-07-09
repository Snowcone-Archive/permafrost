/**
 * Converts the input to an array, if it isn't already an array
 * @param input A generic, or an array of said generic
 */
export function makeArrayIfNeeded<T>(input: T | T[]): T[] {
  if (!Array.isArray(input)) return [input];
  return input;
}
