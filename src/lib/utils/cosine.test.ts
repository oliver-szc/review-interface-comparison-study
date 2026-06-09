/**
 * Unit tests for cosine similarity function.
 * Uses hardcoded test vectors with known similarity values
 * to validate mathematical correctness without external dependencies.
 *
 * Run: npx tsx src/lib/utils/cosine.test.ts
 */
import { cosineSimilarity } from './cosine';

let passed = 0;
let failed = 0;

function assertEqual(testName: string, actual: number, expected: number, tolerance = 1e-6) {
  if (Math.abs(actual - expected) <= tolerance) {
    console.log(`  ✅ ${testName}: ${actual.toFixed(6)} ≈ ${expected}`);
    passed++;
  } else {
    console.error(`  ❌ ${testName}: expected ${expected}, got ${actual}`);
    failed++;
  }
}

function assertThrows(testName: string, fn: () => void) {
  try {
    fn();
    console.error(`  ❌ ${testName}: expected error, but no error was thrown`);
    failed++;
  } catch {
    console.log(`  ✅ ${testName}: correctly threw error`);
    passed++;
  }
}

console.log('\n===== Cosine Similarity Tests =====\n');

// Test 1: Identical vectors → similarity = 1.0
console.log('Test 1: Identical vectors');
assertEqual('identical', cosineSimilarity([1, 2, 3], [1, 2, 3]), 1.0);

// Test 2: Orthogonal vectors → similarity = 0.0
console.log('Test 2: Orthogonal vectors');
assertEqual('orthogonal', cosineSimilarity([1, 0, 0], [0, 1, 0]), 0.0);

// Test 3: Opposite vectors → similarity = -1.0
console.log('Test 3: Opposite vectors');
assertEqual('opposite', cosineSimilarity([1, 2, 3], [-1, -2, -3]), -1.0);

// Test 4: Known angle — 45 degrees (cos(45°) ≈ 0.707107)
console.log('Test 4: Known angle (45°)');
assertEqual('45-deg', cosineSimilarity([1, 0], [1, 1]), Math.cos(Math.PI / 4));

// Test 5: Scaled identical vector → still 1.0 (cosine is scale-invariant)
console.log('Test 5: Scale invariance');
assertEqual('scaled', cosineSimilarity([1, 2, 3], [10, 20, 30]), 1.0);

// Test 6: High-dimensional realistic test (1536-dim mock)
console.log('Test 6: High-dimensional self-similarity');
const highDim = Array.from({ length: 1536 }, (_, i) => Math.sin(i * 0.01));
assertEqual('high-dim self', cosineSimilarity(highDim, highDim), 1.0);

// Test 7: Zero vector → returns 0 (guard)
console.log('Test 7: Zero vector guard');
assertEqual('zero-vector', cosineSimilarity([0, 0, 0], [1, 2, 3]), 0.0);

// Test 8: Length mismatch → throws error
console.log('Test 8: Length mismatch');
assertThrows('length-mismatch', () => cosineSimilarity([1, 2], [1, 2, 3]));

// Test 9: Empty vectors → throws error
console.log('Test 9: Empty vectors');
assertThrows('empty-vectors', () => cosineSimilarity([], []));

console.log(`\n===== Results: ${passed} passed, ${failed} failed =====\n`);
process.exit(failed > 0 ? 1 : 0);
