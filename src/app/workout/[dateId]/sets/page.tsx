import H1 from "@/components/typography/H1";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { days, workouts } from "@/server/db/schema";
import { intlFormat } from "date-fns";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function DailyWorkout({
  params,
}: {
  params: { dateId: number };
}) {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
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
    month: "short",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="container mt-6 flex flex-grow flex-col">
      <H1>{formattedDate}</H1>
    </div>
  );
}
