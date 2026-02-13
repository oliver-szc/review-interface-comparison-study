import { db } from './client';
import { products, reviews, sessions, trackingEvents, taskSubmissions } from './schema';
import { getProductById, getReviewsByProduct } from './queries';
import { eq } from 'drizzle-orm';
import { sql } from './client';

// This file runs all database tests in sequence for easy execution and output comparison.
// To run all tests, execute: npx tsx --env-file=.env.local src/db/all-tests.ts

// Test 1: Select a product from the database
async function testSelectProduct() {
  console.log('\n===== Test 1: Select Product =====');
  const result = await db.select().from(products).limit(1);
  console.log('Product result:', result);
}

// Test 2: Get a product by ID (valid and invalid)
async function testGetProductById() {
  console.log('\n===== Test 2: Get Product By ID =====');
  const [product] = await db.insert(products).values({
    domain: 'Electronics',
    asin: 'ASIN_' + Date.now(),
    title: 'Test Product',
    price: '123.45',
  }).returning();
  const found = await getProductById(product.id);
  console.log('Should find product:', found ? '✅' : '❌');
  if (found) console.log(found);
  const notFound = await getProductById('00000000-0000-0000-0000-000000000000');
  console.log('Should return null for fake UUID:', notFound === null ? '✅' : '❌');
}

// Test 3: Get reviews by product with star filter and sorting
async function testGetReviewsByProduct() {
  console.log('\n===== Test 3: Get Reviews By Product =====');
  const [product] = await db.insert(products).values({
    domain: 'Electronics',
    asin: 'ASIN' + Date.now(),
    title: 'Test Product',
    price: '123.45',
  }).returning();
  await db.insert(reviews).values([
    { productId: product.id, reviewText: 'Great!', starRating: 5 },
    { productId: product.id, reviewText: 'Good', starRating: 4 },
    { productId: product.id, reviewText: 'Okay', starRating: 3 },
    { productId: product.id, reviewText: 'Bad', starRating: 2 },
    { productId: product.id, reviewText: 'Terrible', starRating: 1 },
  ]);
  const results = await getReviewsByProduct({
    productId: product.id,
    stars: [4, 5],
    sortBy: 'rating_high',
  });
  console.log('Filtered & sorted reviews:');
  results.forEach(r => console.log(`- ${r.starRating} stars: ${r.reviewText}`));
  const correct = results.length === 2 && results[0].starRating === 5 && results[1].starRating === 4;
  console.log('Test passed:', correct ? '✅' : '❌');
}

// Test 4: Insert and validate session with JSON fields
async function testSession() {
  console.log('\n===== Test 4: Session JSON Handling =====');
  const testData = {
    prolificId: 'test_user_123',
    conditionOrder: 'ABC',
    productMapping: { A: 'headphones', B: 'kettle', C: 'tshirt' },
    completedPhases: ['baseline', 'condition_A']
  };
  const inserted = await db.insert(sessions).values(testData).returning();
  const newId = inserted[0].id;
  const session = await db.query.sessions.findFirst({ where: eq(sessions.id, newId) });
  if (!session) throw new Error('Session not found');
  console.log('Session:', session);
  console.log(`- Condition Order: ${session.conditionOrder}`);
  console.log(`- Mapping A: ${session.productMapping?.A}`);
  console.log(`- Completed Phases: ${session.completedPhases?.join(', ')}`);
}

// Test 5: Insert task submission with checkbox array answer
async function testInsertTaskSubmissionCheckboxArray() {
  console.log('\n===== Test 5: Task Submission Checkbox Array =====');
  const [session] = await db.insert(sessions).values({
    conditionOrder: 'ABC',
    prolificId: 'test_task_submission_' + Date.now(),
  }).returning();
  const [product] = await db.insert(products).values({
    domain: 'Electronics',
    asin: 'ASIN' + Date.now(),
    title: 'Test Product',
    price: '99.99',
  }).returning();
  const answer = ['battery_life', 'sound_quality', 'comfort'];
  const [submission] = await db.insert(taskSubmissions).values({
    sessionId: session.id,
    condition: 'dashboard',
    productId: product.id,
    answer,
    completionTimeSeconds: 42,
  }).returning();
  console.log('Task submission:', submission);
}

// Test 6: Verify pgvector extension setup
async function testVerifySetup() {
  console.log('\n===== Test 6: Verify pgvector Extension =====');
  await sql`CREATE EXTENSION IF NOT EXISTS vector;`;
  const result = await sql`SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';`;
  if (result.rows.length > 0) {
    console.log(`pgvector (${result.rows[0].extversion}) is active!`);
  } else {
    console.log('Extension not found.');
  }
}

// Run all tests in sequence with clear output
async function runAllTests() {
  console.log('\n==================== RUNNING ALL DB TESTS ====================');
  await testSelectProduct();
  await testGetProductById();
  await testGetReviewsByProduct();
  await testSession();
  await testInsertTaskSubmissionCheckboxArray();
  await testVerifySetup();
  console.log('\n==================== ALL TESTS COMPLETE ====================\n');
  process.exit(0);
}

if (require.main === module) {
  runAllTests();
}
