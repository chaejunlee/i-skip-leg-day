import { WorkoutForm } from "@/app/_components/workout-form";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export default async function Workout({
  params,
}: {
  params: { dateId: string };
}) {
  if (!Number(params.dateId)) {
    redirect("/");
  }

  const session = await getServerAuthSession();

  if (!session || !session.user) {
    redirect("/");
  }

  const dayObject = await api.workout.getDayObject.query({
    dateId: Number(params.dateId),
  });

  if (!dayObject) {
    redirect("/");
  }

  return (
    <div className="flex flex-grow flex-col px-4 py-2">
      <WorkoutForm dayObject={dayObject} />
    </div>
  );
}
