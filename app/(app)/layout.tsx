import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar fixa — desktop */}
      <Sidebar />

      {/* Coluna principal */}
      <div className="lg:pl-60 flex flex-col min-h-screen">
        {/* TopBar fixa no topo */}
        <TopBar />

        {/* Conteúdo com scroll independente */}
        <main className="flex-1 overflow-y-auto pt-16">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
