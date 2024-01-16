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
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const SPLITS_MAP = {
  "push-pull": ["➡️ Push", "⬅️ Pull", "⏺️ Other"],
  upper: ["⬆️ Upper"],
} as const;

type Split = keyof typeof SPLITS_MAP;
type SplitOption = (typeof SPLITS_MAP)[Split][number];

const config: {
  split: Split;
} = {
  split: "push-pull",
} as const;

function getPreviousSplitOption() {
  return getLocalStorage("workout-split-option");
}

export function getLocalStorage(key: string) {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(key);
}

export function setLocalStorage(key: string, value: string) {
  if (typeof localStorage === "undefined") return null;
  return localStorage.setItem(key, value);
}

function getSplitsOption(): SplitOption {
  const previousSplitOption = getPreviousSplitOption();

  const splits = SPLITS_MAP[config.split];

  for (const type of splits) {
    if (type === previousSplitOption) {
      return type;
    }
  }

  return splits[0];
}

const BODYPART = [
  "Chest",
  "Shoulders",
  "Triceps",
  "Back",
  "Biceps",
  "Abs",
] as const;

const SPLITS_BODY_PART_MAP = {
  "➡️ Push": ["Chest", "Shoulders", "Triceps"],
  "⬅️ Pull": ["Back", "Biceps"],
  "⏺️ Other": ["Abs"],
  "⬆️ Upper": ["Chest", "Shoulders", "Triceps", "Back", "Biceps"],
} as const;

const schema = z.object({
  date: z.date().default(() => new Date()),
  split: z.enum(["➡️ Push", "⬅️ Pull", "⏺️ Other", "⬆️ Upper"]),
  bodyPart: z.enum(BODYPART).nullable(),
});

type FormSchema = z.infer<typeof schema>;

export function WorkoutForm() {
  const form = useForm<FormSchema>({
    defaultValues: schema.parse({
      date: new Date(),
      split: getSplitsOption(),
      bodyPart: null,
    }),
    resolver: zodResolver(schema),
  });
  const split = form.watch("split");

  const splits = SPLITS_MAP[config.split];
  const bodyParts = SPLITS_BODY_PART_MAP[split];

  function onSubmit(data: FormSchema) {
    console.log(data);
    toast("You submitted the following values:", {
      description: (
        <pre className="mt-2 rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          onSubmit(data);
        })}
        className="flex flex-grow flex-col gap-4"
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
          name="split"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel htmlFor="workout-split">Split</FormLabel>
              <Select
                onValueChange={(e) => {
                  field.onChange(e);
                  form.setValue("bodyPart", null);
                }}
              >
                <FormControl>
                  <SelectTrigger className="px-4">
                    <SelectValue placeholder="Select today's split" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {splits.map((type) => (
                    <SelectItem className="w-full" key={type} value={type}>
                      {type}
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
          name="bodyPart"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Body Part</FormLabel>
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
                      {field.value
                        ? bodyParts.find((body) => body === field.value)
                        : "Select body part"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search body part..." />
                    <CommandEmpty>No body part found.</CommandEmpty>
                    <CommandGroup>
                      {bodyParts.map((bodyPart) => (
                        <CommandItem
                          value={bodyPart}
                          key={bodyPart}
                          onSelect={() => {
                            form.setValue("bodyPart", bodyPart);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              bodyPart === field.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {bodyPart}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
