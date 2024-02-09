import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { days, workouts } from "@/server/db/schema";
import { intlFormat } from "date-fns";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function DailyWorkout({
  params,
}: {
  params: { userId: string; dateId: number };
}) {
  const session = await getServerAuthSession();

  if (!session || !session.user || session.user.id !== params.userId) {
    redirect("/");
  }

  const dailyWorkoutQuery = await db
    .select()
    .from(workouts)
    .innerJoin(days, eq(days.id, workouts.dateId))
    .where(eq(workouts.dateId, params.dateId));

  if (!dailyWorkoutQuery) {
    redirect("/");
  }

  const dailyWorkout = dailyWorkoutQuery[0]!;
  const dateString = dailyWorkout.day.date?.toISOString();
  if (!dateString) {
    redirect("/");
  }

  const formattedDate = intlFormat(dateString, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container flex flex-grow flex-col">
      <h1 className="mt-6 text-2xl font-bold">{formattedDate}</h1>
    </div>
  );
}
