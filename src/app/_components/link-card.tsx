import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function LinkCard({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:bg-muted/50">{children}</Card>
    </Link>
  );
}
