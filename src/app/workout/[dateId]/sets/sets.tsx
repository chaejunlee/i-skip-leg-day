"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export default function Sets({ workoutId }: { workoutId: number }) {
  const { data: sets, isLoading } = api.workout.getSets.useQuery({
    workoutId,
  });

  if (isLoading) {
    return (
      <div className="flex gap-4">
        <Skeleton className="center grid h-24 w-24 items-center gap-1 rounded-lg border p-2" />
      </div>
    );
  }

  if (!sets || sets.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-4">
      {sets.map((set) => (
        <Set key={set.id} set={set} />
      ))}
    </div>
  );
}

export function Set({
  set,
}: {
  set:
    | {
        workoutId: number | null;
        weights: number;
        reps: number;
      }
    | undefined;
}) {
  if (!set) {
    return null;
  }
  return (
    <div className="center grid h-24 w-24 items-center gap-1 rounded-lg border bg-gray-100 p-2">
      <div className="space-x-1 text-center">
        <span className="text-xl font-semibold">{set.weights}</span>
        <span className="text-sm">kg</span>
      </div>
      <div className="space-x-1 text-center">
        <span className="text-xl font-semibold">{set.reps}</span>
        <span className="text-sm">reps</span>
      </div>
    </div>
  );
}
