import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { days, splits } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { JoinNow } from "../page";
import NewDayForm from "./new-day-form";

export const workoutInputFormSchema = z.object({
  date: z.date(),
  splitId: z.number(),
});
export type WorkoutInputFormSchema = z.infer<typeof workoutInputFormSchema>;

export default async function NewDayDialog() {
  return <NewDayForm />;
}
