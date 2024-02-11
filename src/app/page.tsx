import H1 from "@/components/typography/H1";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { days, splits } from "@/server/db/schema";
import { format } from "date-fns";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import LinkCard from "./_components/link-card";
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
    <main className="container flex min-h-screen flex-col gap-6 pt-12">
      <H1>Workout Log</H1>
      <div className="flex grow flex-col gap-6">
        {list.map(({ day, split }) => {
          const dateId = day.id;
          if (!dateId) return null;
          return (
            <LinkCard key={dateId} href={`workout/${String(dateId)}/sets/`}>
              <CardHeader>
                <div className="pb-1">
                  <Badge>{split.name}</Badge>
                </div>
                <CardTitle>{format(day.date!, "PPP")}</CardTitle>
              </CardHeader>
            </LinkCard>
          );
        })}
      </div>
      <div className="sticky bottom-6 w-full pt-4">
        <Button className="w-full" asChild>
          <Link href="/workout/">Add New Day</Link>
        </Button>
      </div>
    </main>
  );
}
