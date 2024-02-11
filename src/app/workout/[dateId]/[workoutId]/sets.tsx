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
import AddSet from "./add-set";

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
  const {
    variables,
    mutate,
    isLoading: isMutationLoading,
  } = api.workout.setSet.useMutation();

  if (isSetsLoading || !sets) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="flex-grow pb-6">
        <Table>
          <TableCaption>{format(date, "PPP")}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Weights</TableHead>
              <TableHead>Reps</TableHead>
              <TableHead className="w-4 text-center">Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sets?.map((set, index) => (
              <TableRow key={set.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{set.weights}</TableCell>
                <TableCell>{set.reps}</TableCell>
                <TableCell className="text-center">
                  <Button variant="outline" size="icon">
                    <PencilIcon size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {isMutationLoading && (
              <TableRow>
                <TableCell>{sets.length + 1}</TableCell>
                <TableCell>{variables?.weights}</TableCell>
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
        <AddSet workoutId={workoutId} mutate={mutate} />
      </div>
    </>
  );
}
