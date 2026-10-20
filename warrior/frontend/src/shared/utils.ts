export type ClassValue = string | false | null | undefined;

/** Small class joiner. Arrays and falsy values are skipped. */
export function cx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}