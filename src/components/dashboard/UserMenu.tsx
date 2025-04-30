"use client";

import { useEffect, useRef, useState } from "react";
import UserAvatar from "../sidebars/UserAvatar";
import { BiChevronDown } from "react-icons/bi";
import { GoSignOut } from "react-icons/go";
import { signout } from "~/app/actions/auth";

export default function UserMenu({ email }: { email: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="flex items-center gap-2 rounded-md px-3 py-1 text-sm hover:bg-gray-100 transition"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <UserAvatar name={email ?? "Usuario"} />
        <span className="font-medium text-gray-800">{email ?? "Invitado"}</span>
        <BiChevronDown className="h-4 w-4 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg z-50">
          <button
            onClick={signout}
            className="flex w-full items-center justify-between rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
          >
            <span>Cerrar sesión</span>
            <GoSignOut className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      )}
    </div>
  );
}
