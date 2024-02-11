import { WorkoutForm } from "@/app/_components/workout-form";
import H1 from "@/components/typography/H1";
import { Badge } from "@/components/ui/badge";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { format } from "date-fns";
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
    <div className="flex flex-grow flex-col gap-6 pt-5">
      <div>
        <div className="pb-1">
          <Badge>{dayObject.split.name}</Badge>
        </div>
        <H1>{format(new Date(), "yyyy-MM-dd")}</H1>
      </div>
      <WorkoutForm dayObject={dayObject} />
    </div>
  );
}
