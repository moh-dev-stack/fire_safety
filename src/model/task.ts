import { z } from "zod";

export const TASK_STATUSES = ["pending", "in_progress", "completed"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  completed: "Completed",
};

export const taskStatusSchema = z.enum(TASK_STATUSES);

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Deadline must be YYYY-MM-DD");

export const taskNoteSchema = z.object({
  at: z.string().min(1),
  author: z.string().trim().max(120).default(""),
  body: z.string().trim().min(1).max(4000),
});

export type TaskNote = z.infer<typeof taskNoteSchema>;

export const taskCreateSchema = z.object({
  task: z.string().trim().min(1, "Describe the task").max(2000),
  deadline: isoDate.nullable().optional(),
  allocation: z.string().trim().max(200).optional().default(""),
  status: taskStatusSchema.optional().default("pending"),
  notes: z.array(taskNoteSchema).max(500).optional().default([]),
});

export type TaskCreate = z.infer<typeof taskCreateSchema>;

export const taskUpdateSchema = z
  .object({
    task: z.string().trim().min(1).max(2000).optional(),
    deadline: isoDate.nullable().optional(),
    allocation: z.string().trim().max(200).optional(),
    status: taskStatusSchema.optional(),
    /** If present, appended to the existing notes log. */
    appendNote: z
      .object({
        author: z.string().trim().max(120).default(""),
        body: z.string().trim().min(1).max(4000),
      })
      .optional(),
  })
  .refine(
    (v) =>
      v.task !== undefined ||
      v.deadline !== undefined ||
      v.allocation !== undefined ||
      v.status !== undefined ||
      v.appendNote !== undefined,
    { message: "Nothing to update" },
  );

export type TaskUpdate = z.infer<typeof taskUpdateSchema>;

export type TaskRow = {
  id: number;
  created_at: string;
  updated_at: string;
  task: string;
  deadline: string | null;
  allocation: string;
  status: TaskStatus;
  notes: TaskNote[];
};
