CREATE TABLE "health_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ok" boolean NOT NULL
);
