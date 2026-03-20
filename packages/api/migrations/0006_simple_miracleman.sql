ALTER TABLE "issue_project" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "issue_project" CASCADE;--> statement-breakpoint
ALTER TABLE "issue" ADD COLUMN "project_id" text;--> statement-breakpoint
ALTER TABLE "issue" ADD CONSTRAINT "issue_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "issue_projectId_idx" ON "issue" USING btree ("project_id");