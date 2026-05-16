CREATE TYPE "public"."upload_status" AS ENUM('pending', 'ready');--> statement-breakpoint
CREATE TABLE "uploads" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(64) NOT NULL,
	"object_key" varchar(512) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"content_type" varchar(127) NOT NULL,
	"size_bytes" bigint NOT NULL,
	"status" "upload_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"email" varchar(255),
	"name" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "uploads_user_id_idx" ON "uploads" USING btree ("user_id");