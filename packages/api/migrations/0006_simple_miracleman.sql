DROP TABLE IF EXISTS "issue_project" CASCADE;--> statement-breakpoint
ALTER TABLE "issue" ADD COLUMN IF NOT EXISTS "project_id" text;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'issue_project_id_project_id_fk') THEN
    ALTER TABLE "issue" ADD CONSTRAINT "issue_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "issue_projectId_idx" ON "issue" USING btree ("project_id");