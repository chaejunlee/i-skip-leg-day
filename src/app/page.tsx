import Link from "next/link";
import { getServerAuthSession } from "@/server/auth";

export default async function Home() {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    return <JoinNow />;
  }
  return (
    <main className="flex min-h-screen flex-col bg-gray-800 text-white">
      <div className="px-4 py-4 text-2xl">Workout of The Day</div>
      <div className="flex-grow px-4">
        <NewWorkoutSession />
      </div>
    </main>
  );
}

function NewWorkoutSession() {
  return <button className="w-full rounded border py-2">New Workout</button>;
}

function JoinNow() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center bg-gray-800 text-white">
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
