import LinkCard from "@/app/_components/link-card";
import H1 from "@/components/typography/H1";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { bodies, days, exercises, splits, workouts } from "@/server/db/schema";
import { intlFormat } from "date-fns";
import { eq } from "drizzle-orm";
import Link from "next/link";
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

  const dailyWorkoutDetail = await getWorkoutDetail(params.dateId);

  if (!dailyWorkoutDetail) {
    redirect("/");
  }

  const dateDetail = await getDateDetail(params.dateId);

  if (!dateDetail) {
    redirect("/");
  }

  return (
    <div className="flex min-h-full flex-grow flex-col gap-6 pt-5">
      <div>
        <Badge className="mb-1">{dateDetail.split}</Badge>
        <H1>{dateDetail.date}</H1>
      </div>
      <div className="flex grow flex-col gap-6 pb-6">
        {dailyWorkoutDetail.map(({ workout, exercise, body }) => (
          <LinkCard key={workout.id} href={``}>
            <CardHeader>
              <div className="pb-1">
                <Badge variant="secondary">{body.name}</Badge>
              </div>
              <CardTitle>{exercise.name}</CardTitle>
            </CardHeader>
          </LinkCard>
        ))}
      </div>
      <div className="sticky bottom-6 w-full">
        <Button className="w-full" asChild>
          <Link href={`/workout/${params.dateId}/sets`}>Add Exercise</Link>
        </Button>
      </div>
    </div>
  );
}

async function getDateDetail(dateId: number): Promise<{
  date: string;
  split: string;
} | null> {
  const dailyWorkoutQuery = await db
    .select({ date: days.date, splitName: splits.name })
    .from(days)
    .innerJoin(splits, eq(splits.id, days.splitId))
    .where(eq(days.id, dateId));
  if (
    !dailyWorkoutQuery ??
    !dailyWorkoutQuery[0] ??
    !dailyWorkoutQuery[0].date
  ) {
    return null;
  }
  const date = new Date(dailyWorkoutQuery[0].date);
  return {
    date: intlFormat(date, {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
    }),
    split: dailyWorkoutQuery[0].splitName,
  };
}

async function getWorkoutDetail(dateId: number) {
  return await db
    .select()
    .from(workouts)
    .innerJoin(exercises, eq(workouts.exerciseId, exercises.id))
    .innerJoin(bodies, eq(exercises.bodyId, bodies.id))
    .where(eq(workouts.dateId, dateId));
}
