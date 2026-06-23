ALTER TABLE "participants" ADD COLUMN "last_heartbeat_at" timestamp;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "connection_drops" integer DEFAULT 0;