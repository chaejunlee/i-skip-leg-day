import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { days, splits, workouts } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const workoutInputSchema = z.object({
  dateId: z.number(),
  exerciseId: z.number(),
  rpe: z.number(),
  weight: z.number(),
});

export const workoutRouter = createTRPCRouter({
  getWorkoutOptions: publicProcedure.query(async ({ ctx }) => {
    const bodies = await ctx.db.query.bodies.findMany();
    const exercises = await ctx.db.query.exercises.findMany();
    const trains = await ctx.db.query.trains.findMany();
    return {
      bodies,
      trains,
      exercises,
    };
  }),
  getDayObject: protectedProcedure
    .input(
      z.object({
        dateId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const dayObjectQuery = await ctx.db
        .select()
        .from(days)
        .innerJoin(splits, eq(days.splitId, splits.id))
        .where(
          and(eq(days.userId, ctx.session.user.id), eq(days.id, input.dateId)),
        );

      const dayObject = dayObjectQuery[0];
      if (!dayObject) {
        return null;
      }
      return dayObject;
    }),
  setWorkout: protectedProcedure
    .input(workoutInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.insert(workouts).values({
          dateId: input.dateId,
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
