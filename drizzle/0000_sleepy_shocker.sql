CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"title_fa" text NOT NULL,
	"title_en" text NOT NULL,
	"genre_fa" text NOT NULL,
	"genre_en" text NOT NULL,
	"blurb_fa" text NOT NULL,
	"blurb_en" text NOT NULL,
	"duration_min" integer NOT NULL,
	"rating" text NOT NULL,
	"color_from" text NOT NULL,
	"color_to" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"show_id" text NOT NULL,
	"seat" text NOT NULL,
	"status" text NOT NULL,
	"expires_at" timestamp with time zone,
	"user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shows" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"hall_fa" text NOT NULL,
	"hall_en" text NOT NULL,
	"price" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_show_id_shows_id_fk" FOREIGN KEY ("show_id") REFERENCES "public"."shows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shows" ADD CONSTRAINT "shows_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "reservations_show_seat_uq" ON "reservations" USING btree ("show_id","seat");--> statement-breakpoint
CREATE INDEX "shows_event_idx" ON "shows" USING btree ("event_id");