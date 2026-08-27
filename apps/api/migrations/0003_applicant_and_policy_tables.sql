CREATE SEQUENCE "public"."policy_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 100000 CACHE 1;--> statement-breakpoint
CREATE TABLE "policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"policy_number" text DEFAULT 'POL-' || nextval('policy_number_seq') NOT NULL,
	"premium_amount" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'pending_review' NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "policies_application_id_unique" UNIQUE("application_id"),
	CONSTRAINT "policies_policy_number_unique" UNIQUE("policy_number")
);
--> statement-breakpoint
CREATE TABLE "policy_applicants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"address" text NOT NULL,
	"national_id" text NOT NULL,
	"phone" text NOT NULL,
	"drivers_count" integer NOT NULL,
	"family_status" text NOT NULL,
	CONSTRAINT "policy_applicants_application_id_unique" UNIQUE("application_id")
);
--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_applicants" ADD CONSTRAINT "policy_applicants_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;