"use client";

import H1 from "@/components/typography/H1";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const workoutInputFormSchema = z.object({
  date: z.date(),
  splitId: z.number(),
});
export type WorkoutInputFormSchema = z.infer<typeof workoutInputFormSchema>;

export default function NewDayForm() {
  const form = useForm<WorkoutInputFormSchema>({
    defaultValues: workoutInputFormSchema.parse({
      date: new Date(),
      splitId: 0,
    }),
    resolver: zodResolver(workoutInputFormSchema),
  });

  const router = useRouter();

  const { data: days } = api.workout.getDays.useQuery();
  const { data: splits } = api.workout.getSplits.useQuery();
  const { mutate, isLoading: isMutationLoading } =
    api.workout.setDay.useMutation();

  function onSubmit(data: WorkoutInputFormSchema) {
    if (!data.date || typeof data.date === "undefined") {
      form.setError("date", {
        message: "Please select a date",
      });
      form.setFocus("date");
      return toast.warning("Please select a date");
    }

    if (!data.splitId || typeof data.splitId === "undefined") {
      form.setError("splitId", {
        message: "Please select a split",
      });
      form.setFocus("splitId");
      return toast.warning("Please select a split");
    }

    const alreadyExists = days?.find((row) => {
      return row.date && format(data.date, "PPP") === format(row.date, "PPP");
    });

    if (alreadyExists) {
      return toast.warning("Day already exists");
    }

    mutate(
      {
        date: data.date,
        splitId: data.splitId,
      },
      {
        onSuccess: ({ dateId }) => {
          toast.success("New day saved");
          router.push(`/workout/${dateId}/`);
        },
        onError: (error) => {
          toast.warning(error.message);
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
        <div className="mt-12">
          <H1>New Day</H1>
        </div>
        <div className="flex flex-grow flex-col gap-6 pb-6">
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
                    field.onChange(
                      splits?.find((split) => split.name === e)?.id,
                    );
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="px-4">
                      <SelectValue placeholder="Select today's split" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {splits?.map((split) => (
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
        </div>
        <Button type="submit" className="sticky bottom-6 w-full">
          {isMutationLoading ? "Loading..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}
