export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-white" />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
