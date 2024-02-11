import H1 from "@/components/typography/H1";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { bodies, days, exercises, workouts } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ExerciseGraph } from "./exercise-graph";
import { Sets } from "./sets";
import { Badge } from "@/components/ui/badge";

export default async function WorkoutPage({
  params,
}: {
  params: {
    dateId: string;
    workoutId: string;
  };
}) {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    redirect("/");
  }

  const workoutDetail = await getWorkoutDetail(params.workoutId);

  if (!workoutDetail) {
    redirect("/");
  }

  return (
    <div className="flex min-h-full flex-grow flex-col gap-6 pt-5">
      <div>
        <div className="flex gap-2 pb-1">
          <Badge variant="secondary">{workoutDetail.body.name}</Badge>
          <Badge variant="secondary">RPE {workoutDetail.workout.rpe}</Badge>
        </div>
        <H1>{workoutDetail.exercise.name}</H1>
      </div>
      <ExerciseGraph workoutId={Number(params.workoutId)} />
      <Sets
        workoutId={Number(params.workoutId)}
        body={workoutDetail.exercise.name}
        date={workoutDetail.day.date!}
      />
    </div>
  );
}

async function getWorkoutDetail(workoutId: string) {
  const query = await db
    .select()
    .from(workouts)
    .innerJoin(exercises, eq(workouts.exerciseId, exercises.id))
    .innerJoin(bodies, eq(exercises.bodyId, bodies.id))
    .innerJoin(days, eq(workouts.dateId, days.id))
    .where(eq(workouts.id, Number(workoutId)));

  if (query.length === 0) {
    return null;
  }

  return query[0];
}
