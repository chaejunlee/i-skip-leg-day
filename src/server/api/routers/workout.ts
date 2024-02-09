import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { type DB } from "@/server/db";
import { days, workouts } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const workoutInputSchema = z.object({
  date: z.date(),
  trainId: z.number(),
  exerciseId: z.number(),
  rpe: z.number(),
  weight: z.number(),
});

type WorkoutInputSchema = z.infer<typeof workoutInputSchema>;

export const workoutRouter = createTRPCRouter({
  getWorkoutOptions: publicProcedure.query(async ({ ctx }) => {
    const splits = await ctx.db.query.splits.findMany();
    const bodies = await ctx.db.query.bodies.findMany();
    const exercises = await ctx.db.query.exercises.findMany();
    const trains = await ctx.db.query.trains.findMany();
    return {
      splits,
      bodies,
      trains,
      exercises,
    };
  }),
  setWorkout: protectedProcedure
    .input(workoutInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const dateId = await getDateId(ctx.db, ctx.session.user.id, input);

        await ctx.db.insert(workouts).values({
          dateId,
          trainId: input.trainId,
          exerciseId: input.exerciseId,
          rpe: input.rpe,
          weight: input.weight,
          description: "",
        });
      } catch (error) {
        console.error(error);
        return {
          success: false,
          message: "Error saving workout",
        };
      }
      return { success: true, message: "Workout saved" };
    }),
});

async function getDateId(
  db: DB,
  userId: string,
  input: WorkoutInputSchema,
): Promise<number> {
  const dates = await db
    .select()
    .from(days)
    .where(and(eq(days.userId, userId), eq(days.date, input.date)));
  if (dates.length === 0 || dates[0]?.id === undefined) {
    const date = await db.insert(days).values({
      userId: userId,
      date: input.date,
    });
    return date.insertId as unknown as number;
  }
  return dates[0].id;
}
