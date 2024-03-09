"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const setInputFormSchema = z.object({
  weights: z.string(),
  reps: z.string(),
  metric: z.enum(["kg", "lb"]),
});
type SetInputFormSchema = z.infer<typeof setInputFormSchema>;

export function convertMetric(value: string, metric: "kg" | "lb") {
  if (metric === "kg") {
    return (parseFloat(value) / 2.20462).toFixed(2);
  } else {
    return (parseFloat(value) * 2.20462).toFixed(2);
  }
}

export default function AddSet({
  workoutId,
  mutate,
}: {
  workoutId: number;
  mutate: ({
    workoutId,
    reps,
    weights,
    metric,
  }: {
    workoutId: number;
    reps: number;
    weights: number;
    metric: "lb" | "kg";
  }) => void;
}) {
  const form = useForm<SetInputFormSchema>({
    defaultValues: setInputFormSchema.parse({
      weights: "0",
      reps: "0",
      metric: "lb",
    }),
    resolver: zodResolver(setInputFormSchema),
  });

  const [weightMetric, setWeightMetric] = useState<"kg" | "lb">("lb");

  const utils = api.useUtils();

  useEffect(() => {
    form.setValue(
      "weights",
      convertMetric(form.watch("weights"), weightMetric),
    );
  }, [weightMetric]);

  const onSubmit = (data: SetInputFormSchema) => {
    mutate({
      workoutId,
      reps: parseInt(data.reps),
      weights: parseFloat(data.weights),
      metric: data.metric,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">Add Set</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Set</DialogTitle>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              onSubmit(data);
            })}
            className="mt-6 flex flex-grow flex-col gap-6"
          >
            <FormField
              control={form.control}
              name="weights"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>Weight</FormLabel>
                    <div className="flex gap-4">
                      <Input
                        type="number"
                        {...field}
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            field.onChange(Number(0));
                          } else {
                            field.onChange(
                              parseFloat(e.target.value).toFixed(2),
                            );
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        type="button"
                        className="ml-auto w-14"
                        onClick={() => {
                          setWeightMetric((prev) =>
                            prev === "kg" ? "lb" : "kg",
                          );
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
              name="reps"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>Reps</FormLabel>
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
            <Button type="submit">Save</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
