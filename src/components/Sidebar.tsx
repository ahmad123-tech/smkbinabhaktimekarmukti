"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Briefcase, Building2, Bell, Map, ChevronRight, ShieldCheck, BookOpen, Settings, Menu, X } from "lucide-react";

type NavItem = { label: string; href: string; icon: React.ReactNode };

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Kelola Akun", href: "/admin/users", icon: <ShieldCheck size={18} /> },
  { label: "Kelola Jurusan", href: "/admin/jurusan", icon: <BookOpen size={18} /> },
  { label: "Data Lulusan", href: "/admin/lulusan", icon: <Users size={18} /> },
  { label: "Tracer Study", href: "/admin/tracer-study", icon: <FileText size={18} /> },
  { label: "Perusahaan", href: "/admin/perusahaan", icon: <Building2 size={18} /> },
  { label: "Lowongan Kerja", href: "/admin/lowongan", icon: <Briefcase size={18} /> },
  { label: "Kirim Notifikasi", href: "/admin/notifikasi", icon: <Bell size={18} /> },
];

const lulusanNav: NavItem[] = [
  { label: "Dashboard", href: "/lulusan", icon: <LayoutDashboard size={18} /> },
  { label: "Tracer Study", href: "/lulusan/tracer-study", icon: <FileText size={18} /> },
  { label: "Lowongan Kerja", href: "/lulusan/lowongan", icon: <Briefcase size={18} /> },
];

const perusahaanNav: NavItem[] = [
  { label: "Dashboard", href: "/perusahaan", icon: <LayoutDashboard size={18} /> },
  { label: "Lowongan Saya", href: "/perusahaan/lowongan", icon: <Briefcase size={18} /> },
];

const kepsekNav: NavItem[] = [
  { label: "Dashboard", href: "/kepala-sekolah", icon: <LayoutDashboard size={18} /> },
  { label: "Peta Persebaran", href: "/kepala-sekolah/peta", icon: <Map size={18} /> },
];

const navMap: Record<string, NavItem[]> = {
  admin: adminNav,
  lulusan: lulusanNav,
  perusahaan: perusahaanNav,
  "kepala-sekolah": kepsekNav,
};

const roleLabel: Record<string, string> = {
  admin: "Admin / BKK",
  lulusan: "Lulusan",
  perusahaan: "Mitra DUDI",
  "kepala-sekolah": "Kepala Sekolah",
};

const theme: Record<string, { bg: string; header: string; headerBorder: string; logoRing: string; labelColor: string; activeItem: string; hoverItem: string; textColor: string }> = {
  default: {
    bg: "bg-green-800", header: "bg-emerald-950", headerBorder: "border-emerald-900",
    logoRing: "border-emerald-400", labelColor: "text-emerald-300",
    activeItem: "bg-green-600 text-white", hoverItem: "text-green-200 hover:bg-green-700 hover:text-white",
    textColor: "text-green-200",
  },
};

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const nav = navMap[role] || [];
  const t = theme[role] || theme.default;

  // Tutup sidebar mobile saat pindah rute
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Tombol Hamburger Mobile Floating */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-[60] bg-green-600 text-white p-4 rounded-full shadow-[0_4px_20px_rgba(22,163,74,0.4)] hover:scale-105 active:scale-95 transition-transform">
        <Menu size={24} />
      </button>

      {/* Overlay Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[70] md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Wrapper Aside */}
      <aside className={`fixed inset-y-0 left-0 z-[80] w-64 h-screen transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} overflow-y-auto flex flex-col flex-shrink-0 shadow-2xl md:shadow-none ${t.bg} text-white`}>

        {/* Tombol Tutup Mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 p-1.5 rounded-full z-50">
          <X size={20} />
        </button>
        <div className={`p-5 border-b ${t.headerBorder} flex items-center gap-3 ${t.header}`}>
          <img src="/logo_smk.png" alt="Logo SMK" className={`w-12 h-12 object-contain rounded-full border-2 ${t.logoRing}`} />
          <div>
            <h2 className="font-bold text-sm leading-tight text-white">SMK Bina Bhakti</h2>
            <p className={`text-xs mt-0.5 ${t.labelColor}`}>{roleLabel[role]}</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${active ? t.activeItem : t.hoverItem}`}>
                {item.icon}
                <span>{item.label}</span>
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
