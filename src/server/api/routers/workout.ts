import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { days, sets, splits, workouts } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
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
    return {
      bodies,
      exercises,
    };
  }),
  getSplits: publicProcedure.query(async ({ ctx }) => {
    const splits = await ctx.db.query.splits.findMany();
    return splits;
  }),
  getDays: protectedProcedure.query(async ({ ctx }) => {
    const daysQuery = await ctx.db
      .select()
      .from(days)
      .where(eq(days.userId, ctx.session.user.id));

    if (!daysQuery) {
      return null;
    }

    return daysQuery;
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
        throw Error("Error saving workout");
      }
      return { success: true, message: "Workout saved" };
    }),
  getSets: protectedProcedure
    .input(
      z.object({
        workoutId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const setsQuery = await ctx.db
        .select()
        .from(sets)
        .where(eq(sets.workoutId, input.workoutId));

      if (!setsQuery) {
        return null;
      }

      return setsQuery;
    }),
  setSet: protectedProcedure
    .input(
      z.object({
        workoutId: z.number(),
        reps: z.number(),
        weights: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.insert(sets).values({
          workoutId: input.workoutId,
          reps: input.reps,
          weights: input.weights,
        });
        return { success: true, message: "Set saved" };
      } catch (error) {
        console.error(error);
        throw Error("Error saving set");
      }
    }),
  setDay: protectedProcedure
    .input(
      z.object({
        splitId: z.number(),
        date: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const query = await ctx.db.insert(days).values({
          splitId: input.splitId,
          date: input.date,
          userId: ctx.session.user.id,
        });
        revalidatePath("/");
        return { success: true, message: "Day saved", dateId: query.insertId };
      } catch (error) {
        console.error(error);
        throw Error("Error saving day");
      }
    }),
});
