ALTER TABLE "task" RENAME TO "issue";--> statement-breakpoint
ALTER TABLE "task_label" RENAME TO "issue_label";--> statement-breakpoint
ALTER TABLE "issue_label" RENAME COLUMN "task_id" TO "issue_id";--> statement-breakpoint
ALTER TABLE "team" RENAME COLUMN "task_counter" TO "issue_counter";--> statement-breakpoint
ALTER TABLE "issue" DROP CONSTRAINT "task_status_id_status_id_fk";
--> statement-breakpoint
ALTER TABLE "issue" DROP CONSTRAINT "task_team_id_team_id_fk";
--> statement-breakpoint
ALTER TABLE "issue" DROP CONSTRAINT "task_project_id_project_id_fk";
--> statement-breakpoint
ALTER TABLE "issue" DROP CONSTRAINT "task_assignee_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "issue" DROP CONSTRAINT "task_creator_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "issue_label" DROP CONSTRAINT "task_label_task_id_task_id_fk";
--> statement-breakpoint
ALTER TABLE "issue_label" DROP CONSTRAINT "task_label_label_id_label_id_fk";
--> statement-breakpoint
DROP INDEX "task_teamId_idx";--> statement-breakpoint
DROP INDEX "task_projectId_idx";--> statement-breakpoint
DROP INDEX "task_assigneeId_idx";--> statement-breakpoint
DROP INDEX "task_statusId_idx";--> statement-breakpoint
DROP INDEX "task_deletedAt_idx";--> statement-breakpoint
DROP INDEX "task_team_number_uidx";--> statement-breakpoint
DROP INDEX "taskLabel_taskId_idx";--> statement-breakpoint
DROP INDEX "taskLabel_labelId_idx";--> statement-breakpoint
DROP INDEX "taskLabel_task_label_uidx";--> statement-breakpoint
ALTER TABLE "issue" ADD CONSTRAINT "issue_status_id_status_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."status"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue" ADD CONSTRAINT "issue_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue" ADD CONSTRAINT "issue_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue" ADD CONSTRAINT "issue_assignee_id_user_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue" ADD CONSTRAINT "issue_creator_id_user_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_label" ADD CONSTRAINT "issue_label_issue_id_issue_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issue"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_label" ADD CONSTRAINT "issue_label_label_id_label_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."label"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "issue_teamId_idx" ON "issue" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "issue_projectId_idx" ON "issue" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "issue_assigneeId_idx" ON "issue" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "issue_statusId_idx" ON "issue" USING btree ("status_id");--> statement-breakpoint
CREATE INDEX "issue_deletedAt_idx" ON "issue" USING btree ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "issue_team_number_uidx" ON "issue" USING btree ("team_id","number");--> statement-breakpoint
CREATE INDEX "issueLabel_issueId_idx" ON "issue_label" USING btree ("issue_id");--> statement-breakpoint
CREATE INDEX "issueLabel_labelId_idx" ON "issue_label" USING btree ("label_id");--> statement-breakpoint
CREATE UNIQUE INDEX "issueLabel_issue_label_uidx" ON "issue_label" USING btree ("issue_id","label_id");