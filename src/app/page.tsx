import Link from "next/link";
import { getServerAuthSession } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { db } from "@/server/db";
import {
  bodies,
  days,
  exercises,
  splits,
  trains,
  workouts,
} from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { intlFormat } from "date-fns";

export default async function Home() {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    return <JoinNow />;
  }

  const list = await db
    .select()
    .from(workouts)
    .innerJoin(days, eq(days.id, workouts.dateId))
    .innerJoin(exercises, eq(workouts.exerciseId, exercises.id))
    .innerJoin(bodies, eq(exercises.bodyId, bodies.id))
    .innerJoin(splits, eq(days.splitId, splits.id))
    .innerJoin(trains, eq(splits.id, trains.splitId))
    .where(eq(days.userId, session.user.id))
    .orderBy(desc(days.date));

  const daysMap = list.reduce(
    (acc, day) => {
      if (!day.day.date) return acc;
      const date = intlFormat(day.day.date, {
        year: "numeric",
        month: "short",
        day: "numeric",
        weekday: "short",
      });
      if (!acc[date] || typeof acc[date] === "undefined") {
        acc[date] = [day];
      } else {
        acc[date]?.push(day);
      }
      return acc;
    },
    {} as Record<string, typeof list>,
  );

  return (
    <main className="container flex min-h-screen flex-col">
      <h1 className="py-4 text-2xl">Workout Log</h1>
      <div className="flex flex-col gap-6">
        {Object.entries(daysMap).map(
          ([date, workouts]: [string, typeof list]) => {
            const dateId = workouts[0]?.day.id;
            if (!dateId) return null;
            return (
              <Link href={`workout/${String(dateId)}/sets/`}>
                <Card className="transition-colors hover:bg-muted">
                  <CardHeader>
                    <div>
                      <Badge>{workouts[0]?.split.name}</Badge>
                    </div>
                    <CardTitle>{date}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            );
          },
        )}
      </div>
      <div className="flex-grow pt-4">
        <NewWorkoutSession />
      </div>
    </main>
  );
}

function NewWorkoutSession() {
  return (
    <Button asChild variant="outline">
      <Link
        href="/workout"
        className="block w-full rounded border py-2 text-center"
      >
        New Workout
      </Link>
    </Button>
  );
}

function JoinNow() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mx-auto text-center text-2xl font-semibold">
        Join iSkipLegDay™️ Today!
      </h1>
      <p className="mx-auto pt-4">A REAL MAN don't need a LEG 🦵 DAY.</p>
      <p className="mx-auto">What are you doing over there?</p>
      <div className="pt-6">
        <Button asChild variant="outline">
          <Link href="/api/auth/signin" className="bg-red-500 text-white">
            Join now
          </Link>
        </Button>
      </div>
    </main>
  );
}
