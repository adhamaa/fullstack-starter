CREATE TABLE "body_systems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "body_systems_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "clinical_conditions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "clinical_conditions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "remedy_conditions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"remedy_id" uuid NOT NULL,
	"condition_id" uuid NOT NULL,
	"indication_strength" varchar(50),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "remedy_conditions_remedy_id_condition_id_unique" UNIQUE("remedy_id","condition_id")
);
--> statement-breakpoint
CREATE TABLE "formula_remedies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"formula_id" uuid NOT NULL,
	"remedy_id" uuid NOT NULL,
	"proportion" varchar(50),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "formula_remedies_formula_id_remedy_id_unique" UNIQUE("formula_id","remedy_id")
);
--> statement-breakpoint
CREATE TABLE "formulas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"indication" text,
	"description" text,
	"body_system" varchar(100),
	"category" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "formulas_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "materia_medica_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"author" varchar(255),
	"publication_year" integer,
	"isbn" varchar(20),
	"edition" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "remedy_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"remedy_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	"page_number" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "potencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"scale" varchar(20) NOT NULL,
	"dilution_factor" integer,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "potencies_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "remedy_potencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"remedy_id" uuid NOT NULL,
	"potency_id" uuid NOT NULL,
	"recommended" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "remedy_potencies_remedy_id_potency_id_unique" UNIQUE("remedy_id","potency_id")
);
--> statement-breakpoint
CREATE TABLE "rate_banks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"source_ref" varchar(255),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "rate_banks_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "radionic_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bank_id" uuid NOT NULL,
	"value" varchar(64) NOT NULL,
	"rateable_type" varchar(20) NOT NULL,
	"rateable_id" uuid NOT NULL,
	"potency_variant" varchar(50),
	"category" varchar(100),
	"notes" text,
	"source_page" varchar(50),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "radionic_rates_bank_value_unique" UNIQUE("bank_id","value")
);
--> statement-breakpoint
CREATE TABLE "remedies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"common_name" varchar(255),
	"abbreviation" varchar(50),
	"source" varchar(255),
	"description" text,
	"characteristics" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "remedies_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "mental_symptoms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"remedy_id" uuid NOT NULL,
	"description" text NOT NULL,
	"intensity" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "modalities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"remedy_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "remedy_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"remedy_id" uuid NOT NULL,
	"related_remedy_id" uuid NOT NULL,
	"relationship_type" varchar(50) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "remedy_not_self" CHECK ("remedy_relationships"."remedy_id" != "remedy_relationships"."related_remedy_id")
);
--> statement-breakpoint
CREATE TABLE "remedy_symptoms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"remedy_id" uuid NOT NULL,
	"symptom_id" uuid NOT NULL,
	"grade" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "remedy_symptoms_remedy_id_symptom_id_unique" UNIQUE("remedy_id","symptom_id")
);
--> statement-breakpoint
CREATE TABLE "symptoms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"body_system_id" uuid,
	"description" text NOT NULL,
	"location" varchar(255),
	"modality" varchar(255),
	"severity" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "remedy_conditions" ADD CONSTRAINT "remedy_conditions_remedy_id_remedies_id_fk" FOREIGN KEY ("remedy_id") REFERENCES "public"."remedies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remedy_conditions" ADD CONSTRAINT "remedy_conditions_condition_id_clinical_conditions_id_fk" FOREIGN KEY ("condition_id") REFERENCES "public"."clinical_conditions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formula_remedies" ADD CONSTRAINT "formula_remedies_formula_id_formulas_id_fk" FOREIGN KEY ("formula_id") REFERENCES "public"."formulas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formula_remedies" ADD CONSTRAINT "formula_remedies_remedy_id_remedies_id_fk" FOREIGN KEY ("remedy_id") REFERENCES "public"."remedies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remedy_sources" ADD CONSTRAINT "remedy_sources_remedy_id_remedies_id_fk" FOREIGN KEY ("remedy_id") REFERENCES "public"."remedies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remedy_sources" ADD CONSTRAINT "remedy_sources_source_id_materia_medica_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."materia_medica_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remedy_potencies" ADD CONSTRAINT "remedy_potencies_remedy_id_remedies_id_fk" FOREIGN KEY ("remedy_id") REFERENCES "public"."remedies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remedy_potencies" ADD CONSTRAINT "remedy_potencies_potency_id_potencies_id_fk" FOREIGN KEY ("potency_id") REFERENCES "public"."potencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radionic_rates" ADD CONSTRAINT "radionic_rates_bank_id_rate_banks_id_fk" FOREIGN KEY ("bank_id") REFERENCES "public"."rate_banks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mental_symptoms" ADD CONSTRAINT "mental_symptoms_remedy_id_remedies_id_fk" FOREIGN KEY ("remedy_id") REFERENCES "public"."remedies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modalities" ADD CONSTRAINT "modalities_remedy_id_remedies_id_fk" FOREIGN KEY ("remedy_id") REFERENCES "public"."remedies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remedy_relationships" ADD CONSTRAINT "remedy_relationships_remedy_id_remedies_id_fk" FOREIGN KEY ("remedy_id") REFERENCES "public"."remedies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remedy_relationships" ADD CONSTRAINT "remedy_relationships_related_remedy_id_remedies_id_fk" FOREIGN KEY ("related_remedy_id") REFERENCES "public"."remedies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remedy_symptoms" ADD CONSTRAINT "remedy_symptoms_remedy_id_remedies_id_fk" FOREIGN KEY ("remedy_id") REFERENCES "public"."remedies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "remedy_symptoms" ADD CONSTRAINT "remedy_symptoms_symptom_id_symptoms_id_fk" FOREIGN KEY ("symptom_id") REFERENCES "public"."symptoms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "symptoms" ADD CONSTRAINT "symptoms_body_system_id_body_systems_id_fk" FOREIGN KEY ("body_system_id") REFERENCES "public"."body_systems"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "radionic_rates_rateable_idx" ON "radionic_rates" USING btree ("rateable_type","rateable_id");