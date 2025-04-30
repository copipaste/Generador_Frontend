"use client";

import { Room } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ConfirmationModal from "./ConfirmationModal";
import { deleteRoom, updateRoomTitle } from "~/app/actions/rooms";

// Paleta de colores moderna
const MODERN_COLORS = [
  "#3B82F6", "#6366F1", "#10B981", "#F59E0B",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"
];

export default function RoomsView({
  ownedRooms,
  roomInvites,
}: {
  ownedRooms: Room[];
  roomInvites: Room[];
}) {
  const [viewMode, setViewMode] = useState<"owns" | "shared">("owns");
  const [selected, setSelected] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const router = useRouter();
  const outerRef = useRef<HTMLDivElement>(null);

  const filteredRooms = useMemo(() => (
    viewMode === "owns" ? ownedRooms : roomInvites
  ), [viewMode, ownedRooms, roomInvites]);

  const roomColors = useMemo(() => (
    filteredRooms.map((room, index) => ({
      id: room.id,
      color: MODERN_COLORS[index % MODERN_COLORS.length],
    }))
  ), [filteredRooms]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (outerRef.current && !outerRef.current.contains(e.target as Node)) {
        setSelected(null);
        setEditingId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditSubmit = async (id: string) => {
    if (editedTitle.trim() !== "") {
      await updateRoomTitle(editedTitle, id);
    }
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (selected) {
      await deleteRoom(selected);
      setShowConfirmationModal(false);
      setSelected(null);
    }
  };

  return (
    <div ref={outerRef} className="flex flex-col gap-6">
      {/* Botones de vista */}
      <div className="flex gap-3">
        <ViewModeButton
          onSelect={() => setViewMode("owns")}
          active={viewMode === "owns"}
          text="Mis Proyectos"
        />
        <ViewModeButton
          onSelect={() => setViewMode("shared")}
          active={viewMode === "shared"}
          text="Compartidos"
        />
      </div>

      {/* Lista de rooms */}
      <ul className="flex flex-col w-full divide-y divide-gray-200 rounded-md border border-gray-200 bg-white shadow-sm">
        {filteredRooms.map((room) => {
          const color = roomColors.find((c) => c.id === room.id)?.color ?? "#3B82F6";
          const isEditing = editingId === room.id;

          return (
            <li
              key={room.id}
              className="group flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
              onClick={() => {
                if (!isEditing) router.push("/dashboard/" + room.id);
              }}
            >
              {/* Color + título */}
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                <div className="flex flex-col">
                  {isEditing ? (
                    <input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onBlur={() => handleEditSubmit(room.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEditSubmit(room.id);
                      }}
                      autoFocus
                      className="rounded border px-2 py-1 text-sm text-gray-800 shadow-sm focus:ring focus:ring-blue-300"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-800">
                      {room.title}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    Creado el {room.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              {viewMode === "owns" && (
                <div
                  className="flex gap-3 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="hover:text-blue-600"
                    onClick={() => {
                      setEditingId(room.id);
                      setEditedTitle(room.title);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="hover:text-red-600"
                    onClick={() => {
                      setSelected(room.id);
                      setShowConfirmationModal(true);
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Confirmación de eliminación */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleDelete}
        message="¿Seguro que deseas eliminar este proyecto?"
      />
    </div>
  );
}

function ViewModeButton({
  onSelect,
  active,
  text,
}: {
  onSelect: () => void;
  active: boolean;
  text: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={`rounded-full px-4 py-1 text-sm font-medium transition-all ${
        active
          ? "bg-blue-600 text-white shadow"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      {text}
    </button>
  );
}
