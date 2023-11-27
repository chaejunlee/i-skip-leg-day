import Link from "next/link";
import { getServerAuthSession } from "@/server/auth";

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
    <Link
      href="/workout"
      className="block w-full rounded border py-2 text-center"
    >
      New Workout
    </Link>
  );
}

function JoinNow() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mx-auto text-center text-2xl font-semibold">
        Join iSkipLegDay™️ Today!
      </h1>
      <p className="mx-auto pt-4">REAL MAN don't need a LEG 🦵 DAY.</p>
      <p className="mx-auto">What are you doing over there?</p>
      <div className="pt-6">
        <Link
          href="/api/auth/signin"
          className="inline-block rounded bg-red-500 px-4 py-2 text-white"
        >
          Join now
        </Link>
      </div>
    </main>
  );
}
