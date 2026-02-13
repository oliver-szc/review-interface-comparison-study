import { pgTable, uuid, varchar, text, decimal, integer, timestamp, vector, boolean, json, index } from 'drizzle-orm/pg-core';

// Products table
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  domain: varchar('domain', { length: 50 }).notNull(), // e.g., 'Electronics'
  asin: varchar('asin', { length: 20 }).unique().notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }),
  reviewCount: integer('review_count').default(0),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export const testTable = pgTable('test_connection', {
  id: uuid('id').defaultRandom().primaryKey(),
  message: varchar('message', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type TestRecord = typeof testTable.$inferSelect;
export type NewTestRecord = typeof testTable.$inferInsert;

// Reviews table with pgvector embedding and ABSA aspects
export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  reviewText: text('review_text').notNull(),
  starRating: integer('star_rating').notNull(),
  reviewTitle: varchar('review_title', { length: 200 }),
  verifiedPurchase: boolean('verified_purchase').default(false),
  reviewDate: timestamp('review_date'),
  absaAspects: json('absa_aspects').$type<ABSAQuadruple[]>(),
  embedding: vector('embedding', { dimensions: 1536 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  // Changed from { key: index } to an array of indexes
  index('reviews_product_id_idx').on(table.productId),
  index('reviews_star_rating_idx').on(table.starRating),
  index('reviews_embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
]);


export type ABSAQuadruple = {
  aspect: string;
  opinion: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  category: string;
};

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

// Sessions table to track user progress through the study
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  prolificId: varchar('prolific_id', { length: 50 }),
  conditionOrder: varchar('condition_order', { length: 10 }).notNull(), // e.g., 'ABC'
  productMapping: json('product_mapping').$type<Record<string, string>>(), // {A: 'headphones', B: 'kettle', C: 'tshirt'}
  currentConditionIndex: integer('current_condition_index').default(0),
  completedPhases: json('completed_phases').$type<string[]>().default([]),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

// Tracking events table to log user interactions during the study
export const trackingEvents = pgTable('tracking_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').references(() => sessions.id).notNull(),
  condition: varchar('condition', { length: 50 }), // 'unassisted', 'dashboard', 'chatbot'
  eventType: varchar('event_type', { length: 50 }).notNull(), // 'FILTER_CHANGE', 'CHAT_MESSAGE_SENT', etc.
  eventData: json('event_data'), // Flexible JSON payload
  timestamp: timestamp('timestamp').defaultNow().notNull(),
}, (table) => ({
  sessionIdIdx: index('tracking_session_id_idx').on(table.sessionId),
  timestampIdx: index('tracking_timestamp_idx').on(table.timestamp),
}));

// Survey responses table to store demographic and feedback data
export type TrackingEvent = typeof trackingEvents.$inferSelect;
export type NewTrackingEvent = typeof trackingEvents.$inferInsert;

export const surveyResponses = pgTable('survey_responses', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').references(() => sessions.id).notNull(),
  surveyType: varchar('survey_type', { length: 50 }).notNull(), // 'demographics', 'post_condition', 'final'
  responses: json('responses').notNull(), // Zod-validated JSON
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
}, (table) => ({
  sessionIdIdx: index('survey_session_id_idx').on(table.sessionId),
}));

// Store user answers to surveys, linked to their session for later analysis
export type SurveyResponse = typeof surveyResponses.$inferSelect;
export type NewSurveyResponse = typeof surveyResponses.$inferInsert;

export const taskSubmissions = pgTable('task_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').references(() => sessions.id).notNull(),
  condition: varchar('condition', { length: 50 }).notNull(), // 'unassisted', 'dashboard', 'chatbot'
  productId: uuid('product_id').references(() => products.id).notNull(),
  answer: json('answer').notNull(), // Multi-choice or text
  completionTimeSeconds: integer('completion_time_seconds'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
}, (table) => ({
  sessionIdIdx: index('task_session_id_idx').on(table.sessionId),
}));

export type TaskSubmission = typeof taskSubmissions.$inferSelect;
export type NewTaskSubmission = typeof taskSubmissions.$inferInsert;