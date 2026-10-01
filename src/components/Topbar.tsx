"use client";
import { signOut, useSession } from "next-auth/react";
import { LogOut, User } from "lucide-react";

export default function Topbar({ title }: { title: string }) {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-2 md:pt-0">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight pr-12 md:pr-0">{title}</h1>
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 text-xs md:text-sm text-gray-600 shadow-sm max-w-[200px] md:max-w-none overflow-hidden text-ellipsis whitespace-nowrap">
          <User size={15} className="text-[#0D704D] flex-shrink-0" />
          <span className="truncate">{session?.user?.name || session?.user?.email}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </div>
  );
}
