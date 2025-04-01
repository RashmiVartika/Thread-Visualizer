import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define types for thread states and roles
export type ThreadState = "NEW" | "RUNNABLE" | "BLOCKED" | "WAITING" | "TERMINATED";
export type ThreadRole = "PRODUCER" | "CONSUMER" | undefined;

export type ThreadData = {
  id: string;
  name: string;
  state: ThreadState;
  progress: number;
  role?: ThreadRole;
};

// Schema for threading concepts
export const concepts = pgTable("concepts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  code: text("code").notNull(),
  threadConfig: jsonb("thread_config").$type<{
    minThreads: number;
    maxThreads: number;
    defaultThreads: number;
  }>().notNull()
});

export const insertConceptSchema = createInsertSchema(concepts);

export type InsertConcept = z.infer<typeof insertConceptSchema>;
export type Concept = typeof concepts.$inferSelect;