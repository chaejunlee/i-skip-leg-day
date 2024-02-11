import { z } from "zod";

export const workoutInputFormSchema = z.object({
  date: z.date(),
  splitId: z.number(),
});
export type WorkoutInputFormSchema = z.infer<typeof workoutInputFormSchema>;
