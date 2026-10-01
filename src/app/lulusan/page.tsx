import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ProfileLulusanClient from "./ProfileLulusanClient";

export default async function LulusanDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "LULUSAN") redirect("/login");

  const lulusan = await prisma.lulusan.findUnique({
    where: { userId: (session.user as any).id },
    include: { jurusan: true, tracerStudy: true },
  });

  // Akun LULUSAN ada tapi data lulusan belum dibuat oleh admin
  if (!lulusan) {
    return (
      <div className="flex min-h-screen">
        <Sidebar role="lulusan" />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-10 max-w-md text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Data Lulusan Belum Dikonfigurasi</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Akun Anda sudah aktif, namun data lulusan (NIS, jurusan, tahun lulus) belum diisi oleh Admin.
              Silakan hubungi Admin BKK untuk melengkapi data Anda.
            </p>
            <p className="mt-4 text-xs text-gray-400">Login sebagai: <span className="font-medium">{session.user?.email}</span></p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="lulusan" />
      <main className="flex-1 p-8">
        <Topbar title={`Selamat Datang, ${lulusan?.nama}`} />
        <p className="text-gray-500 mb-8 -mt-4">Jurusan: {lulusan?.jurusan?.nama} | Tahun Lulus: {lulusan?.tahunLulus}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-gray-700 mb-3">Status Tracer Study</h2>
            {lulusan?.tracerStudy ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-medium">{lulusan.tracerStudy.status}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tempat</span><span className="font-medium">{lulusan.tracerStudy.namaPerusahaan || lulusan.tracerStudy.namaKampus || lulusan.tracerStudy.namaUsaha || "-"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Jabatan</span><span className="font-medium">{lulusan.tracerStudy.jabatan || "-"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Lokasi</span><span className="font-medium">{lulusan.tracerStudy.lokasiKerja || "-"}</span></div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-3">Anda belum mengisi tracer study</p>
                <a href="/lulusan/tracer-study" className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800">Isi Sekarang</a>
              </div>
            )}
          </div>
          <ProfileLulusanClient lulusan={lulusan} userEmail={session.user?.email || ""} />
        </div>
      </main>
    </div>
  );
}

