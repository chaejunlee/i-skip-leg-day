"use client";

import { type ChangeEvent, useState } from "react";

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

function getSplitsOption(): SplitOption {
  const previousSplitOption = localStorage.getItem(
    "workout-split-option",
  ) as SplitOption | null;

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

type BodyPart = (typeof BODYPART)[number];

const SPLITS_BODY_PART_MAP = {
  "➡️ Push": ["Chest", "Shoulders", "Triceps"],
  "⬅️ Pull": ["Back", "Biceps"],
  "⏺️ Other": ["Abs"],
  "⬆️ Upper": ["Chest", "Shoulders", "Triceps", "Back", "Biceps"],
};

export function WorkoutForm() {
  const [date, setDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [split, setSplit] = useState<SplitOption>(getSplitsOption());
  const [bodyPart, setBodyPart] = useState<BodyPart>("Chest");

  const splits = SPLITS_MAP[config.split];
  const bodyParts = SPLITS_BODY_PART_MAP[split];

  function handleSplitOptionSelect(e: ChangeEvent<HTMLSelectElement>) {
    setSplit(e.target.value as SplitOption);
    localStorage.setItem("workout-split-option", e.target.value);
  }

  return (
    <form className="flex flex-col gap-4">
      <div className="flex flex-col">
        <label htmlFor="workout-date">
          <span>Date</span>
        </label>
        <input
          id="workout-date"
          value={date}
          type="date"
          className="mt-1 h-12 rounded border p-2 text-base"
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="workout-split">
          <span>Split</span>
        </label>
        <select
          id="workout-split"
          className="mt-1 h-12 rounded border p-2 text-base"
          value={split}
          onChange={handleSplitOptionSelect}
        >
          {splits.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <p>Body Part</p>
        <div className="mt-1 flex h-44 flex-col divide-y divide-solid overflow-y-scroll rounded border">
          {bodyParts.map((type) => (
            <label className="flex gap-3 px-3 py-3" key={type} htmlFor={type}>
              <input
                type="radio"
                id={type}
                name="body-part"
                className="w-4"
                checked={bodyPart === type}
                value={type}
                onChange={(e) => {
                  setBodyPart(e.target.value as BodyPart);
                }}
              />
              {type}
            </label>
          ))}
          <div className="py-3 pl-10">
            <input
              className="w-full bg-transparent text-base"
              placeholder="Add more ..."
            />
          </div>
        </div>
      </div>
      <button className="rounded border p-2">Save</button>
    </form>
  );
}
