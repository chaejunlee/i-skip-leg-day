"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { PencilIcon } from "lucide-react";
import AddSet, { convertMetric } from "./add-set";
import { useState } from "react";
import { toast } from "sonner";

export function Sets({
  workoutId,
  date,
}: {
  workoutId: number;
  body: string;
  date: Date;
}) {
  const { data: sets, isLoading: isSetsLoading } = api.workout.getSets.useQuery(
    { workoutId },
  );
  const { data: latestSets, isLoading: isLatestLoading } =
    api.workout.getLastestSet.useQuery({ workoutId });
  const utils = api.useUtils();
  const {
    variables,
    mutate: mutateSet,
    isLoading: isMutationLoading,
  } = api.workout.setSet.useMutation({
    onSuccess: () => {
      toast.success("Workout saved");
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      utils.workout.getSets.invalidate({ workoutId }).catch(console.error);
    },
  });

  const [metric, setMetric] = useState<"lb" | "kg">("lb");

  if (isSetsLoading || !sets) {
    return <div>Loading...</div>;
  }

  const lastSet = sets.at(-1) ?? latestSets;
  const isLastSetAvailable = !!lastSet;

  return (
    <>
      <div className="flex-grow pb-6">
        <Table>
          <TableCaption>{format(date, "PPP")}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-8 p-0"
                  onClick={() => {
                    setMetric(metric === "lb" ? "kg" : "lb");
                  }}
                >
                  Weights
                </Button>
              </TableHead>
              <TableHead>Reps</TableHead>
              <TableHead className="w-4 text-center">Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sets?.map((set, index) => (
              <TableRow key={set.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {`${
                    set.metric === metric
                      ? set.weights
                      : convertMetric(set.weights.toString(), metric)
                  } ${metric}`}
                </TableCell>
                <TableCell>{set.reps}</TableCell>
                <TableCell className="text-center">
                  <Button variant="outline" size="icon">
                    <PencilIcon size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {isMutationLoading && (
              <TableRow className="opacity-30">
                <TableCell>{sets.length + 1}</TableCell>
                <TableCell>{`${
                  variables?.metric === metric
                    ? variables?.weights
                    : convertMetric(
                        variables?.weights?.toString() ?? "0",
                        metric,
                      )
                } ${metric}`}</TableCell>
                <TableCell>{variables?.reps}</TableCell>
                <TableCell className="text-center">
                  <Button variant="outline" size="icon">
                    <PencilIcon size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="sticky bottom-6 w-full">
        <Button
          className="w-full"
          disabled={!isLastSetAvailable}
          onClick={() => {
            if (isLastSetAvailable && lastSet) {
              mutateSet(lastSet);
            }
          }}
        >
          Duplicate last set
        </Button>
      </div>
    </>
  );
}
