import H1 from "@/components/typography/H1";
import H3 from "@/components/typography/H3";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { bodies, days, exercises, splits, workouts } from "@/server/db/schema";
import { intlFormat } from "date-fns";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import SetSlider from "./set-slider";
import Sets from "./sets";

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
    <div className="mt-6 flex flex-grow flex-col gap-6">
      <div>
        <Badge className="mb-1">{dateDetail.split}</Badge>
        <H1>{dateDetail.date}</H1>
      </div>
      <div className="flex flex-col gap-6">
        {dailyWorkoutDetail.map(({ workout, exercise, body }) => (
          <Card key={workout.id}>
            <CardHeader>
              <div>
                <Badge variant="outline">{body.name}</Badge>
              </div>
              <H3>{exercise.name}</H3>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <SetSlider workoutId={workout.id}>
                  <Sets workoutId={workout.id} />
                </SetSlider>
              </div>
            </CardContent>
          </Card>
        ))}
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
