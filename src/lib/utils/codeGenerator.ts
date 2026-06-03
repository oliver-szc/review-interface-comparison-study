export function generateCompletionCode(): string {
  // Generates a 6-character random alphanumeric string, uppercase
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}
