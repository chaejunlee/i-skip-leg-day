import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { days, splits } from "@/server/db/schema";
import { format } from "date-fns";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { JoinNow } from "./join-now";

export default async function Home() {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    return <JoinNow />;
  }

  const list = await db
    .select()
    .from(days)
    .innerJoin(splits, eq(splits.id, days.splitId))
    .where(eq(days.userId, session.user.id))
    .orderBy(desc(days.date));

  return (
    <main className="container flex min-h-screen flex-col">
      <h1 className="py-4 text-2xl">Workout Log</h1>
      <div className="flex flex-col gap-6">
        {list.map(({ day, split }) => {
          const dateId = day.id;
          if (!dateId) return null;
          return (
            <Link key={dateId} href={`workout/${String(dateId)}/sets/`}>
              <Card className="transition-colors hover:bg-muted">
                <CardHeader>
                  <div>
                    <Badge>{split.name}</Badge>
                  </div>
                  <CardTitle>{format(day.date!, "PPP")}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
      <div className="flex-grow pt-4">
        <Button asChild>
          <Link href="/workout/">Add New Day</Link>
        </Button>
      </div>
    </main>
  );
}
