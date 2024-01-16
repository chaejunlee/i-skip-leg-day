import Link from "next/link";
import { getServerAuthSession } from "@/server/auth";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    return <JoinNow />;
  }

  return (
    <main className="flex min-h-screen flex-col">
      <h1 className="px-4 py-4 text-2xl">Workout Log</h1>
      <div className="flex-grow px-4">
        <NewWorkoutSession />
      </div>
    </main>
  );
}

function NewWorkoutSession() {
  return (
    <Button asChild variant="outline">
      <Link
        href="/workout"
        className="block w-full rounded border py-2 text-center"
      >
        New Workout
      </Link>
    </Button>
  );
}

function JoinNow() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mx-auto text-center text-2xl font-semibold">
        Join iSkipLegDay™️ Today!
      </h1>
      <p className="mx-auto pt-4">A REAL MAN don't need a LEG 🦵 DAY.</p>
      <p className="mx-auto">What are you doing over there?</p>
      <div className="pt-6">
        <Button asChild variant="outline">
          <Link href="/api/auth/signin" className="bg-red-500 text-white">
            Join now
          </Link>
        </Button>
      </div>
    </main>
  );
}
