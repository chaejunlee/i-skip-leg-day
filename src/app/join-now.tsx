import { Button } from "@/components/ui/button";
import Link from "next/link";

export function JoinNow() {
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
