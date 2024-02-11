export function ExerciseGraph({ workoutId }: { workoutId: number }) {
  return (
    <div className="grid aspect-video w-full place-content-center rounded-lg border border-primary bg-primary-foreground">
      {workoutId}
    </div>
  );
}
