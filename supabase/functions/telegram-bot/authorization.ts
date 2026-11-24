export function validSharedSecret(expected: string, supplied: unknown): boolean {
  return expected.length > 0 && typeof supplied === 'string' && supplied === expected;
}
