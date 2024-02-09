"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export const workoutInputFormSchema = z.object({
  bodyId: z.number().optional(),
  exerciseId: z.number().optional(),
  rpe: z.string(),
  weight: z.string(),
});
export type WorkoutInputFormSchema = z.infer<typeof workoutInputFormSchema>;

export function WorkoutForm({
  dayObject,
}: {
  dayObject: {
    day: {
      date: Date | null;
      id: number;
      userId: string | null;
      splitId: number | null;
    };
    split: {
      id: number;
      name: string;
      programId: number | null;
    };
  };
}) {
  const form = useForm<WorkoutInputFormSchema>({
    defaultValues: workoutInputFormSchema.parse({
      date: new Date(),
      weight: "0",
      rpe: "8",
    }),
    resolver: zodResolver(workoutInputFormSchema),
  });

  const { data, isLoading, error } = api.workout.getWorkoutOptions.useQuery();
  const { mutate, isLoading: isMutationLoading } =
    api.workout.setWorkout.useMutation();

  const router = useRouter();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error ?? !data) {
    return <div>Error loading workout options</div>;
  }

  const splitId = dayObject.day.splitId;
  const bodies = data.bodies;
  const exercises = data.exercises;

  function onSubmit(data: WorkoutInputFormSchema) {
    if (!data.bodyId || typeof data.bodyId === "undefined") {
      form.setError("bodyId", {
        message: "Please select a body part",
      });
      form.setFocus("bodyId");
      return toast("Please select a body");
    }
    if (!data.exerciseId || typeof data.exerciseId === "undefined") {
      form.setError("exerciseId", {
        message: "Please select an exercise",
      });
      form.setFocus("exerciseId");
      return toast("Please select an exercise");
    }

    mutate(
      {
        dateId: dayObject.day.id,
        exerciseId: data.exerciseId,
        rpe: Number(data.rpe),
        weight: Number(data.weight),
      },
      {
        onSuccess: () => {
          form.reset();
          toast("Workout saved");
          router.push(`/workout/${dayObject.day.id}/sets`);
        },
        onError: (error) => {
          toast(error.message);
        },
      },
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          onSubmit(data);
        })}
        className="mt-6 flex flex-grow flex-col gap-6"
      >
        <div>
          <h2 className="text-2xl font-semibold">
            {format(new Date(), "yyyy-MM-dd")}
          </h2>
          <Badge>{dayObject.split.name}</Badge>
        </div>
        <FormField
          control={form.control}
          name="bodyId"
          render={({ field }) => {
            const matchingExercise = exercises.filter(
              (exercise) => exercise.splitId === splitId,
            );

            const filteredBodies = splitId
              ? bodies.filter((body) => {
                  return matchingExercise.some(
                    (exercise) => exercise.bodyId === body.id,
                  );
                })
              : bodies;

            const body = bodies.find((body) => body.id === field.value)?.name;

            return (
              <FormItem className="flex flex-col">
                <FormLabel>Body</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {body ? body : "Select body part"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search body part..." />
                      <CommandEmpty>No body part found.</CommandEmpty>
                      <CommandGroup>
                        {filteredBodies.map((body) => (
                          <CommandItem
                            key={body.id}
                            value={body.name}
                            onSelect={() => {
                              form.setValue("bodyId", body.id);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                body.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {body.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="exerciseId"
          render={({ field }) => {
            const bodyId = form.watch("bodyId");

            const filteredExercises = exercises.filter((exercise) => {
              return exercise.bodyId === bodyId && exercise.splitId === splitId;
            });

            const exercise = exercises.find(
              (exercise) => exercise.id === field.value,
            )?.name;

            return (
              <FormItem className="flex flex-col">
                <FormLabel>Exercise</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {exercise ? exercise : "Select exercise"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search exercise..." />
                      <CommandEmpty>No exercise found.</CommandEmpty>
                      <CommandGroup>
                        {filteredExercises.map((exercise) => (
                          <CommandItem
                            key={exercise.id}
                            value={exercise.name}
                            onSelect={() => {
                              form.setValue("exerciseId", exercise.id);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                exercise.id === field.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {exercise.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="rpe"
          render={({ field }) => {
            return (
              <FormItem className="flex flex-col">
                <FormLabel>RPE</FormLabel>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => {
                    field.onChange(String(parseInt(e.target.value)));
                  }}
                />
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <Button type="submit">
          {isMutationLoading ? "Loading..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}
