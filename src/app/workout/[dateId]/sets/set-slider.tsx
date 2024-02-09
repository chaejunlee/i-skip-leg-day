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
import { PlusIcon } from "lucide-react";
import { type ReactNode, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Set } from "./sets";

const setInputFormSchema = z.object({
  weights: z.string(),
  reps: z.string(),
});
type SetInputFormSchema = z.infer<typeof setInputFormSchema>;

export default function SetSlider({
  workoutId,
  children,
}: {
  workoutId: number;
  children: ReactNode;
}) {
  const form = useForm<SetInputFormSchema>({
    defaultValues: setInputFormSchema.parse({
      weights: "0",
      reps: "0",
    }),
    resolver: zodResolver(setInputFormSchema),
  });

  const {
    mutate,
    isLoading: isMutationLoading,
    variables: setVariables,
  } = api.workout.setSet.useMutation();

  const [weightMetric, setWeightMetric] = useState<"kg" | "lb">("lb");

  const utils = api.useUtils();

  useEffect(() => {
    if (weightMetric === "kg") {
      form.setValue(
        "weights",
        String((parseFloat(form.watch("weights")) / 2.20462).toFixed(2)),
      );
    } else {
      form.setValue(
        "weights",
        String((parseFloat(form.watch("weights")) * 2.20462).toFixed(2)),
      );
    }
  }, [weightMetric]);

  const onSubmit = (data: SetInputFormSchema) => {
    mutate(
      {
        workoutId,
        reps: parseInt(data.reps),
        weights: parseFloat(data.weights),
      },
      {
        onSuccess: () => {
          form.reset();
          toast("Workout saved");
          utils.workout.getSets.invalidate({ workoutId }).catch(console.error);
        },
        onError: (error) => {
          toast(error.message);
        },
      },
    );
  };

  return (
    <Dialog>
      <div className="flex gap-4 overflow-x-scroll">
        {children}
        {isMutationLoading ? <Set set={setVariables} /> : null}
        <DialogTrigger asChild>
          <Button className="h-24 w-24 shrink-0">
            <PlusIcon />
          </Button>
        </DialogTrigger>
      </div>
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
            <Button type="submit">
              {isMutationLoading ? "Loading..." : "Save"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
