export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col">
      <h1 className="px-4 py-4 text-2xl">Add New Workout</h1>
      {children}
    </main>
  );
}
