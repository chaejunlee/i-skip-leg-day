export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="container flex min-h-screen flex-col">{children}</main>
  );
}
