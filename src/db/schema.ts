import { pgTable, uuid, varchar, text, decimal, integer, timestamp, vector, boolean, json, index, uniqueIndex, pgEnum } from 'drizzle-orm/pg-core';

export const conditionTypeEnum = pgEnum('condition_type', ['BASELINE', 'DASHBOARD', 'CHATBOT']);
export const productIdEnum = pgEnum('product_id', ['EARBUDS', 'KETTLE', 'SWEATSHIRT']);

// Products table
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: productIdEnum('product_id_enum').unique(),
  domain: varchar('domain', { length: 50 }).notNull(), // e.g., 'Electronics'
  asin: varchar('asin', { length: 20 }).unique().notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }),
  priceSource: varchar('price_source', { length: 50 }),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }),
  reviewCount: integer('review_count').default(0),
  imageUrl: text('image_url'),
  bulletPointsSource: varchar('bullet_points_source', { length: 50 }),
  bulletPoints: json('bullet_points').$type<{ label: string; value: string }[]>(),
  aboutItemSource: varchar('about_item_source', { length: 50 }),
  aboutItem: json('about_item').$type<string[]>(),
  ratingDistribution: json('rating_distribution').$type<Record<number, number>>(),
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
  asin: varchar('asin', { length: 20 }),
  parentAsin: varchar('parent_asin', { length: 20 }),
  helpfulVote: integer('helpful_vote').default(0),
  userName: varchar('user_name', { length: 255 }),
  absaSentences: integer('absa_sentences'),
  absaAspects: json('absa_aspects').$type<ABSAQuadruple[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  // Changed from { key: index } to an array of indexes
  index('reviews_product_id_idx').on(table.productId),
  index('reviews_star_rating_idx').on(table.starRating),
]);

export const reviewEmbeddings = pgTable('review_embeddings', {
  id: uuid('id').defaultRandom().primaryKey(),
  reviewId: uuid('review_id').references(() => reviews.id, { onDelete: 'cascade' }).notNull().unique(),
  embedding: vector('embedding', { dimensions: 1536 }),
}, (table) => [
  index('review_embeddings_embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
]);

export type ABSAQuadruple = {
  quad_id: number;
  aspect_category: string;
  aspect_term: string | null;
  opinion_term: string;
  sentiment_polarity: 'positive' | 'negative' | 'neutral';
};

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type ReviewEmbedding = typeof reviewEmbeddings.$inferSelect;
export type NewReviewEmbedding = typeof reviewEmbeddings.$inferInsert;

// Participants table (source of truth for study state)
export const participants = pgTable('participants', {
  id: uuid('id').defaultRandom().primaryKey(),
  externalId: varchar('external_id', { length: 50 }),
  vpId: integer('vp_id'),
  currentPage: varchar('current_page', { length: 80 }),
  currentBlockIndex: integer('current_block_index').default(0),
  screenedOutReason: varchar('screened_out_reason', { length: 50 }),
  studyCompleted: boolean('study_completed').default(false),
  completionCode: varchar('completion_code', { length: 16 }),
  hasPostHocFlags: boolean('has_post_hoc_flags').default(false),
  timeTotalMs: integer('time_total_ms'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  demoAge: integer('demo_age'),
  demoGender: integer('demo_gender'),
  demoStudyStatus: integer('demo_studystatus'),
  demoField: integer('demo_field'),
  scrEnglish: integer('scr_english'),
  expReviews: integer('exp_reviews'),
  expChatbots: integer('exp_chatbots'),
  expDashboards: integer('exp_dashboards'),
  ati1: integer('ati_1'),
  ati2: integer('ati_2'),
  ati3: integer('ati_3'),
  ati4: integer('ati_4'),
  scrTutorial1: integer('scr_tutorial_1'),
  scrTutorial2: integer('scr_tutorial_2'),
  prefChatbot: integer('pref_chatbot'),
  prefDashboard: integer('pref_dashboard'),
  prefBaseline: integer('pref_baseline'),
  prefComment: text('pref_comment'),
}, (table) => ({
  vpIdUnique: uniqueIndex('participants_vp_id_uq').on(table.vpId),
  externalIdIdx: index('participants_external_id_idx').on(table.externalId),
}));

export type Participant = typeof participants.$inferSelect;
export type NewParticipant = typeof participants.$inferInsert;

// Counterbalancing pool for vpId allocation
export const sequencePool = pgTable('sequence_pool', {
  sequenceId: integer('sequence_id').primaryKey(),
  assistanceOrder: varchar('assistance_order', { length: 10 }).notNull(),
  productOrder: varchar('product_order', { length: 10 }).notNull(),
  isAvailable: boolean('is_available').default(true).notNull(),
  reservedByParticipantId: uuid('reserved_by_participant_id').references(() => participants.id),
  reservedAt: timestamp('reserved_at'),
}, (table) => ({
  availableIdx: index('sequence_pool_available_idx').on(table.isAvailable),
  reservedByIdx: index('sequence_pool_reserved_by_idx').on(table.reservedByParticipantId),
}));

export type SequencePoolRow = typeof sequencePool.$inferSelect;
export type NewSequencePoolRow = typeof sequencePool.$inferInsert;

// Block-level submissions
export const blockSubmissions = pgTable('block_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  participantId: uuid('participant_id').references(() => participants.id).notNull(),
  blockIndex: integer('block_index').notNull(),
  conditionType: conditionTypeEnum('condition_type').notNull(),
  productId: productIdEnum('product_id').notNull(),
  taskStartTime: timestamp('task_start_time'),
  taskEndTime: timestamp('task_end_time'),
  timeOnTaskMs: integer('time_on_task_ms'),
  tlx_mental_demand: integer('tlx_mental_demand'),
  tlx_physical_demand: integer('tlx_physical_demand'),
  tlx_temporal_demand: integer('tlx_temporal_demand'),
  tlx_performance: integer('tlx_performance'),
  tlx_effort: integer('tlx_effort'),
  tlx_frustration: integer('tlx_frustration'),
  pu1: integer('pu_1'),
  pu3: integer('pu_3'),
  pu4: integer('pu_4'),
  assistUse: integer('assist_use'),
  manipulationCheckFailed: boolean('manip_failed').default(false),
  scrAttention: integer('scr_attention'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  participantIdx: index('block_submissions_participant_idx').on(table.participantId),
  participantBlockUnique: uniqueIndex('block_submissions_participant_block_uq').on(table.participantId, table.blockIndex),
}));

export type BlockSubmission = typeof blockSubmissions.$inferSelect;
export type NewBlockSubmission = typeof blockSubmissions.$inferInsert;

// Claim-level task answers
export const taskAnswers = pgTable('task_answers', {
  id: uuid('id').defaultRandom().primaryKey(),
  blockSubmissionId: uuid('block_submission_id').references(() => blockSubmissions.id).notNull(),
  claimOrder: integer('claim_order').notNull(),
  claimId: varchar('claim_id', { length: 64 }).notNull(),
  userResponse: integer('user_response').notNull(),
  groundTruth: integer('ground_truth').notNull(),
  accuracy: integer('accuracy').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  blockSubmissionIdx: index('task_answers_block_submission_idx').on(table.blockSubmissionId),
  claimIdIdx: index('task_answers_claim_id_idx').on(table.claimId),
}));

export type TaskAnswer = typeof taskAnswers.$inferSelect;
export type NewTaskAnswer = typeof taskAnswers.$inferInsert;

// Ground-truth claim seeds
export const claimSeeds = pgTable('claim_seeds', {
  id: varchar('id', { length: 64 }).primaryKey(),
  productId: productIdEnum('product_id').notNull(),
  claimOrder: integer('claim_order').notNull(),
  claimText: text('claim_text').notNull(),
  correctOption: integer('correct_option').notNull(),
  sourceVersion: varchar('source_version', { length: 20 }).default('v1').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  productOrderUnique: uniqueIndex('claim_seeds_product_order_uq').on(table.productId, table.claimOrder),
}));

export type ClaimSeed = typeof claimSeeds.$inferSelect;
export type NewClaimSeed = typeof claimSeeds.$inferInsert;

// Chatbot logs (JSON transcript per block)
export const chatbotLogs = pgTable('chatbot_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  blockSubmissionId: uuid('block_submission_id').references(() => blockSubmissions.id).notNull(),
  transcript: json('transcript').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  blockSubmissionIdx: index('chatbot_logs_block_submission_idx').on(table.blockSubmissionId),
}));

export type ChatbotLog = typeof chatbotLogs.$inferSelect;
export type NewChatbotLog = typeof chatbotLogs.$inferInsert;

// Tracking events table to log user interactions during the study
export const trackingEvents = pgTable('tracking_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  participantId: uuid('participant_id').references(() => participants.id).notNull(),
  conditionType: conditionTypeEnum('condition_type'),
  eventType: varchar('event_type', { length: 50 }).notNull(), // 'FILTER_CHANGE', 'CHAT_MESSAGE_SENT', etc.
  eventData: json('event_data'), // Flexible JSON payload
  timestamp: timestamp('timestamp').defaultNow().notNull(),
}, (table) => ({
  participantIdIdx: index('tracking_participant_id_idx').on(table.participantId),
  timestampIdx: index('tracking_timestamp_idx').on(table.timestamp),
}));

export type TrackingEvent = typeof trackingEvents.$inferSelect;
export type NewTrackingEvent = typeof trackingEvents.$inferInsert;