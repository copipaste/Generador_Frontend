import { User } from "@prisma/client";
import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { deleteInvitation, shareRoom } from "~/app/actions/rooms";
import UserAvatar from "./UserAvatar";

export default function ShareMenu({
  roomId,
  othersWithAccessToRoom,
}: {
  roomId: string;
  othersWithAccessToRoom: User[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const inviteUser = async () => {
    setLoading(true);
    const errorMessage = await shareRoom(roomId, email);
    setError(errorMessage);
    setLoading(false);
    if (!errorMessage) setEmail(""); // Limpiar si fue exitoso
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 transition"
      >
        Compartir
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            {/* Encabezado */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-sm font-semibold text-gray-800">
                Compartir este proyecto
              </h2>
              <IoClose
                className="h-5 w-5 cursor-pointer text-gray-500 hover:text-gray-700"
                onClick={() => setIsOpen(false)}
              />
            </div>

            {/* Cuerpo */}
            <div className="space-y-4 px-4 py-4">
              {/* Formulario de invitación */}
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Ingrese el correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring"
                />
                <button
                  onClick={inviteUser}
                  disabled={loading || !email}
                  className={`rounded-md px-4 py-2 text-sm font-medium text-white transition ${
                    loading || !email
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Enviando..." : "Invitar"}
                </button>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}

              {/* Lista de usuarios */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Acceso otorgado a:</p>
                <ul className="space-y-2">
                  {othersWithAccessToRoom.map((user, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between border-b pb-1 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <UserAvatar name={user.email ?? "Anónimo"} className="h-6 w-6" />
                        <span className="text-sm text-gray-700">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Acceso completo</span>
                        <IoClose
                          onClick={() => deleteInvitation(roomId, user.email)}
                          className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-500"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
