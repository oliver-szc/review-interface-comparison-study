CREATE TYPE "public"."condition_type" AS ENUM('BASELINE', 'DASHBOARD', 'CHATBOT');--> statement-breakpoint
CREATE TYPE "public"."product_id" AS ENUM('EARBUDS', 'KETTLE', 'SWEATSHIRT', 'TUTORIAL');--> statement-breakpoint
CREATE TABLE "block_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"block_index" integer NOT NULL,
	"condition_type" "condition_type" NOT NULL,
	"product_id" "product_id" NOT NULL,
	"task_start_time" timestamp,
	"task_end_time" timestamp,
	"time_on_task_ms" integer,
	"tlx_mental_demand" integer,
	"tlx_temporal_demand" integer,
	"tlx_effort" integer,
	"tlx_frustration" integer,
	"pu_1" integer,
	"pu_3" integer,
	"pu_4" integer,
	"assist_use" integer,
	"manip_failed" boolean DEFAULT false,
	"scr_attention" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chatbot_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_submission_id" uuid NOT NULL,
	"transcript" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claim_seeds" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"product_id" "product_id" NOT NULL,
	"claim_order" integer NOT NULL,
	"claim_text" text NOT NULL,
	"correct_option" integer NOT NULL,
	"source_version" varchar(20) DEFAULT 'v1' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" varchar(50),
	"vp_id" integer,
	"current_page" varchar(80),
	"current_block_index" integer DEFAULT 0,
	"screened_out_reason" varchar(50),
	"study_completed" boolean DEFAULT false,
	"completion_code" varchar(16),
	"has_post_hoc_flags" boolean DEFAULT false,
	"time_total_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"demo_age" integer,
	"demo_gender" integer,
	"demo_studystatus" integer,
	"demo_field" integer,
	"scr_english" integer,
	"exp_reviews" integer,
	"exp_chatbots" integer,
	"exp_dashboards" integer,
	"ati_1" integer,
	"ati_2" integer,
	"ati_3" integer,
	"ati_4" integer,
	"scr_tutorial_1" integer,
	"scr_tutorial_2" integer,
	"pref_chatbot" integer,
	"pref_dashboard" integer,
	"pref_baseline" integer,
	"pref_comment" text
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id_enum" "product_id",
	"domain" varchar(50) NOT NULL,
	"asin" varchar(20) NOT NULL,
	"title" varchar(500) NOT NULL,
	"price" numeric(10, 2),
	"price_source" varchar(50),
	"average_rating" numeric(3, 2),
	"review_count" integer DEFAULT 0,
	"image_url" text,
	"bullet_points_source" varchar(50),
	"bullet_points" json,
	"about_item_source" varchar(50),
	"about_item" json,
	"rating_distribution" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_product_id_enum_unique" UNIQUE("product_id_enum"),
	CONSTRAINT "products_asin_unique" UNIQUE("asin")
);
--> statement-breakpoint
CREATE TABLE "review_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" uuid NOT NULL,
	"embedding" vector(1536),
	CONSTRAINT "review_embeddings_review_id_unique" UNIQUE("review_id")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"review_text" text NOT NULL,
	"star_rating" integer NOT NULL,
	"review_title" varchar(200),
	"verified_purchase" boolean DEFAULT false,
	"review_date" timestamp,
	"asin" varchar(20),
	"parent_asin" varchar(20),
	"helpful_vote" integer DEFAULT 0,
	"user_name" varchar(255),
	"absa_sentences" integer,
	"absa_aspects" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sequence_pool" (
	"sequence_id" integer PRIMARY KEY NOT NULL,
	"assistance_order" varchar(10) NOT NULL,
	"product_order" varchar(10) NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"reserved_by_participant_id" uuid,
	"reserved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "task_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_submission_id" uuid NOT NULL,
	"claim_order" integer NOT NULL,
	"claim_id" varchar(64) NOT NULL,
	"user_response" integer NOT NULL,
	"ground_truth" integer NOT NULL,
	"accuracy" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_connection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tracking_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"condition_type" "condition_type",
	"event_type" varchar(50) NOT NULL,
	"event_data" json,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "block_submissions" ADD CONSTRAINT "block_submissions_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatbot_logs" ADD CONSTRAINT "chatbot_logs_block_submission_id_block_submissions_id_fk" FOREIGN KEY ("block_submission_id") REFERENCES "public"."block_submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_embeddings" ADD CONSTRAINT "review_embeddings_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sequence_pool" ADD CONSTRAINT "sequence_pool_reserved_by_participant_id_participants_id_fk" FOREIGN KEY ("reserved_by_participant_id") REFERENCES "public"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_answers" ADD CONSTRAINT "task_answers_block_submission_id_block_submissions_id_fk" FOREIGN KEY ("block_submission_id") REFERENCES "public"."block_submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracking_events" ADD CONSTRAINT "tracking_events_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "block_submissions_participant_idx" ON "block_submissions" USING btree ("participant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "block_submissions_participant_block_uq" ON "block_submissions" USING btree ("participant_id","block_index");--> statement-breakpoint
CREATE INDEX "chatbot_logs_block_submission_idx" ON "chatbot_logs" USING btree ("block_submission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "claim_seeds_product_order_uq" ON "claim_seeds" USING btree ("product_id","claim_order");--> statement-breakpoint
CREATE UNIQUE INDEX "participants_vp_id_uq" ON "participants" USING btree ("vp_id");--> statement-breakpoint
CREATE INDEX "participants_external_id_idx" ON "participants" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "review_embeddings_embedding_idx" ON "review_embeddings" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "reviews_product_id_idx" ON "reviews" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "reviews_star_rating_idx" ON "reviews" USING btree ("star_rating");--> statement-breakpoint
CREATE INDEX "sequence_pool_available_idx" ON "sequence_pool" USING btree ("is_available");--> statement-breakpoint
CREATE INDEX "sequence_pool_reserved_by_idx" ON "sequence_pool" USING btree ("reserved_by_participant_id");--> statement-breakpoint
CREATE INDEX "task_answers_block_submission_idx" ON "task_answers" USING btree ("block_submission_id");--> statement-breakpoint
CREATE INDEX "task_answers_claim_id_idx" ON "task_answers" USING btree ("claim_id");--> statement-breakpoint
CREATE INDEX "tracking_participant_id_idx" ON "tracking_events" USING btree ("participant_id");--> statement-breakpoint
CREATE INDEX "tracking_timestamp_idx" ON "tracking_events" USING btree ("timestamp");