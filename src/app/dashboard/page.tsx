"use server";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import UserMenu from "~/components/dashboard/UserMenu";
import CreateRoom from "~/components/dashboard/CreateRoom";
import RoomsView from "~/components/dashboard/RoomsView";

export default async function Page() {
  const session = await auth();

  const user = await db.user.findUniqueOrThrow({
    where: {
      id: session?.user.id,
    },
    include: {
      ownedRooms: true,
      roomInvites: {
        include: {
          room: true,
        },
      },
    },
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex w-20 flex-col items-center bg-white border-r border-gray-200 shadow-sm py-4">
        <div className="mb-4">
          {/* Puedes usar un logo o ícono aquí */}
          <div className="h-10 w-10 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            F
          </div>
        </div>
        <nav className="space-y-6 mt-8 text-gray-500">
          <button className="hover:text-sky-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          {/* Otros iconos de navegación aquí */}
        </nav>
        <div className="mt-auto mb-4">
          <UserMenu email={user.email} />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">Proyectos</h1>
          <UserMenu email={user.email} />
        </header>

        {/* Content */}
        <section className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <CreateRoom />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <RoomsView
                ownedRooms={user.ownedRooms}
                roomInvites={user.roomInvites.map((x) => x.room)}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
