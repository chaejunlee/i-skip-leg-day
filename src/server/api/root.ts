import { createTRPCRouter } from "@/server/api/trpc";
import { workoutRouter } from "./routers/workout";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  workout: workoutRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
