import { db, sql } from './client';
import { products, reviews, participants, trackingEvents, sequencePool, blockSubmissions, taskAnswers, chatbotLogs } from './schema';
import { getProductById, getReviewsByProduct } from './queries';
import { eq } from 'drizzle-orm';

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

// Test 4: Insert and validate participant record
async function testParticipant() {
  console.log('\n===== Test 4: Participant Insert =====');
  const [participant] = await db.insert(participants).values({
    externalId: 'test_user_123',
    currentPage: 'landing',
    currentBlockIndex: 0,
  }).returning();
  const stored = await db.query.participants.findFirst({ where: eq(participants.id, participant.id) });
  if (!stored) throw new Error('Participant not found');
  console.log('Participant:', stored);
}

// Test 5: Insert tracking event for participant
async function testTrackingEvent() {
  console.log('\n===== Test 5: Tracking Event Insert =====');
  const [participant] = await db.insert(participants).values({
    externalId: 'test_tracking_' + Date.now(),
    currentPage: 'landing',
  }).returning();
  await db.insert(trackingEvents).values({
    participantId: participant.id,
    conditionType: 'BASELINE',
    eventType: 'SESSION_START',
    eventData: { test: true },
  });
  const events = await db.select().from(trackingEvents).where(eq(trackingEvents.participantId, participant.id));
  console.log('Tracking events:', events.length);
}

// Test 6: Insert sequence pool row
async function testSequencePool() {
  console.log('\n===== Test 6: Sequence Pool Insert =====');
  await db.insert(sequencePool).values({
    sequenceId: 1,
    assistanceOrder: 'B,D,C',
    productOrder: 'E,K,S',
  }).onConflictDoNothing();
  const row = await db.select().from(sequencePool).where(eq(sequencePool.sequenceId, 1));
  console.log('Sequence row:', row[0]);
}

// Test 7: Insert block submission with task answers
async function testBlockSubmissionAndAnswers() {
  console.log('\n===== Test 7: Block Submission + Task Answers =====');
  const [participant] = await db.insert(participants).values({
    externalId: 'test_block_' + Date.now(),
    currentPage: 'condition_1_task',
    currentBlockIndex: 1,
  }).returning();
  const [block] = await db.insert(blockSubmissions).values({
    participantId: participant.id,
    blockIndex: 1,
    conditionType: 'BASELINE',
    productId: 'EARBUDS',
    timeOnTaskMs: 1234,
    tlx_mental_demand: 3,
    tlx_temporal_demand: 4,
    tlx_effort: 3,
    tlx_frustration: 2,
    pu1: 4,
    pu3: 4,
    pu4: 5,
  }).returning();
  await db.insert(taskAnswers).values([
    { blockSubmissionId: block.id, claimOrder: 1, claimId: 'earbuds_claim_1', userResponse: 1, groundTruth: 1, accuracy: 1 },
    { blockSubmissionId: block.id, claimOrder: 2, claimId: 'earbuds_claim_2', userResponse: 2, groundTruth: 2, accuracy: 1 },
    { blockSubmissionId: block.id, claimOrder: 3, claimId: 'earbuds_claim_3', userResponse: 3, groundTruth: 3, accuracy: 1 },
  ]);
  const answers = await db.select().from(taskAnswers).where(eq(taskAnswers.blockSubmissionId, block.id));
  console.log('Task answers:', answers.length);
}

// Test 8: Insert chatbot log
async function testChatbotLog() {
  console.log('\n===== Test 8: Chatbot Log Insert =====');
  const [participant] = await db.insert(participants).values({
    externalId: 'test_chat_' + Date.now(),
    currentPage: 'condition_3_task',
    currentBlockIndex: 3,
  }).returning();
  const [block] = await db.insert(blockSubmissions).values({
    participantId: participant.id,
    blockIndex: 3,
    conditionType: 'CHATBOT',
    productId: 'SWEATSHIRT',
    timeOnTaskMs: 4321,
  }).returning();
  await db.insert(chatbotLogs).values({
    blockSubmissionId: block.id,
    transcript: [
      { timestamp: new Date().toISOString(), role: 'user', content: 'Test message' },
      { timestamp: new Date().toISOString(), role: 'assistant', content: 'Test response' },
    ],
  });
  const logs = await db.select().from(chatbotLogs).where(eq(chatbotLogs.blockSubmissionId, block.id));
  console.log('Chatbot logs:', logs.length);
}

// Test 9: Verify pgvector extension setup
async function testVerifySetup() {
  console.log('\n===== Test 9: Verify pgvector Extension =====');
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
  await testParticipant();
  await testTrackingEvent();
  await testSequencePool();
  await testBlockSubmissionAndAnswers();
  await testChatbotLog();
  await testVerifySetup();
  console.log('\n==================== ALL TESTS COMPLETE ====================\n');
  process.exit(0);
}

if (require.main === module) {
  runAllTests();
}
