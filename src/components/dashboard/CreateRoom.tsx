//! esto es el boton crear proyecto 

"use client";

import { useState } from "react";
import { HiPlusSm } from "react-icons/hi";
import { createRoom, updateRoomTitle } from "~/app/actions/rooms";
import { useRouter } from "next/navigation";

export default function CreateRoom() {
  const [isOpen, setIsOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!roomName.trim()) return;

    setLoading(true);
    try {
      const roomId = await createRoom();
      await updateRoomTitle(roomName.trim(), roomId);
      router.push("/dashboard/" + roomId); // redirigir después de nombrar
    } catch (err) {
      console.error("Error al crear el proyecto:", err);
    } finally {
      setLoading(false);
      setIsOpen(false);
      setRoomName("");
    }
  };

  return (
    <>
      {/* Botón para abrir modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="group flex w-fit items-center gap-4 rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-md transition hover:bg-blue-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 transition-all group-hover:bg-white">
          <HiPlusSm className="h-6 w-6 text-white group-hover:text-blue-500" />
        </div>
        <div className="flex flex-col text-left text-sm">
          <p className="font-semibold text-gray-800 group-hover:text-white">
            Nuevo proyecto
          </p>
          <p className="text-xs text-gray-500 group-hover:text-white">
            Crea un nuevo diseño desde cero
          </p>
        </div>
      </button>

      {/* Modal para ingresar nombre */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">
              Escribe el nombre del nuevo proyecto
            </h2>
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Nombre del proyecto"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={loading || !roomName.trim()}
                className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Creando..." : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
