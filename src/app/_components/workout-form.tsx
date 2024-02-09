"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { z } from "zod";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export const workoutInputFormSchema = z.object({
  date: z.date(),
  splitId: z.number().optional(),
  bodyId: z.number().optional(),
  exerciseId: z.number().optional(),
  rpe: z.number(),
  weight: z.number(),
});
export type WorkoutInputFormSchema = z.infer<typeof workoutInputFormSchema>;

export function WorkoutForm() {
  const form = useForm<WorkoutInputFormSchema>({
    defaultValues: workoutInputFormSchema.parse({
      date: new Date(),
      weight: 0,
      rpe: 8,
    }),
    resolver: zodResolver(workoutInputFormSchema),
  });

  const { data, isLoading, error } = api.workout.getWorkoutOptions.useQuery();
  const {
    mutate,
    isLoading: isMutationLoading,
    error: isMutationError,
  } = api.workout.setWorkout.useMutation();

  const [weightMetric, setWeightMetric] = useState<"kg" | "lb">("lb");

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error ?? !data) {
    return <div>Error loading workout options</div>;
  }

  const splits = data.splits;
  const bodies = data.bodies;
  const trains = data.trains;
  const exercises = data.exercises;

  function onSubmit(data: WorkoutInputFormSchema) {
    if (!data.splitId || typeof data.splitId === "undefined") {
      form.setError("splitId", {
        message: "Please select a split",
      });
      form.setFocus("splitId");
      return toast("Please select a split");
    }
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

    const trainId = trains.find((train) => train.splitId === data.splitId)?.id;

    if (!trainId) {
      form.setError("splitId", {
        message: "No train found for this split",
      });
      form.setFocus("splitId");
      return toast("No train found for this split");
    }

    mutate(
      {
        date: data.date,
        trainId,
        exerciseId: data.exerciseId,
        rpe: data.rpe,
        weight: data.weight,
      },
      {
        onSuccess: () => {
          form.reset();
          toast("Workout saved");
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
        className="flex flex-grow flex-col gap-6"
      >
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="splitId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel htmlFor="workout-split">Split</FormLabel>
              <Select
                onValueChange={(e) => {
                  field.onChange(splits.find((split) => split.name === e)?.id);
                }}
              >
                <FormControl>
                  <SelectTrigger className="px-4">
                    <SelectValue placeholder="Select today's split" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {splits.map((split) => (
                    <SelectItem
                      className="w-full"
                      key={split.id}
                      value={split.name}
                    >
                      {split.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bodyId"
          render={({ field }) => {
            const splitId = form.watch("splitId");

            const matchingTrains = trains.filter(
              (train) => train.splitId === splitId,
            );

            const filteredBodies = splitId
              ? bodies.filter((body) => {
                  return matchingTrains.some(
                    (train) => train.bodyId === body.id,
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
              return exercise.bodyId === bodyId;
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
          name="weight"
          render={({ field }) => {
            return (
              <FormItem className="flex flex-col">
                <FormLabel>Weight</FormLabel>
                <div className="flex gap-4">
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => {
                      field.onChange(parseFloat(e.target.value));
                    }}
                    onBlur={(e) => {
                      if (e.target.value === "") {
                        field.onChange(Number(0));
                      } else {
                        field.onChange(parseFloat(e.target.value).toFixed(2));
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    type="button"
                    className="ml-auto w-14"
                    onClick={() => {
                      setWeightMetric((prev) => {
                        if (prev === "kg") {
                          if (field.value)
                            field.onChange(
                              parseFloat((field.value * 2.20462).toFixed(2)),
                            );
                          return "lb";
                        }
                        if (field.value)
                          field.onChange(
                            parseFloat((field.value / 2.20462).toFixed(2)),
                          );
                        return "kg";
                      });
                    }}
                  >
                    {weightMetric}
                  </Button>
                </div>
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
                    field.onChange(parseInt(e.target.value));
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
