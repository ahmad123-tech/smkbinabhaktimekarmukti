import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const data = await prisma.tracerStudy.findMany({
    include: { lulusan: { include: { jurusan: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const lulusan = await prisma.lulusan.findUnique({
    where: { userId: (session.user as any).id },
  });
  if (!lulusan) return NextResponse.json({ error: "Lulusan tidak ditemukan" }, { status: 404 });

  const cleaned = {
    status: body.status,
    pernahMelamar: body.pernahMelamar || null,
    jenisPekerjaan: body.jenisPekerjaan || null,
    namaPerusahaan: body.namaPerusahaan || null,
    alamatInstansi: body.alamatInstansi || null,
    jabatan: body.jabatan || null,
    deskripsiPekerjaan: body.deskripsiPekerjaan || null,
    masaKerja: body.masaKerja || null,
    mulaiKerja: body.mulaiKerja || null,
    sesuaiKeahlian: body.sesuaiKeahlian || null,
    masaTunggu: body.masaTunggu || null,
    gaji: body.gaji || null,
    lokasiKerja: body.lokasiKerja || null,
    latitude: body.latitude ? Number(body.latitude) : null,
    longitude: body.longitude ? Number(body.longitude) : null,
    namaKampus: body.namaKampus || null,
    alamatUniversitas: body.alamatUniversitas || null,
    jurusanStudi: body.jurusanStudi || null,
    bulanTahunStudi: body.bulanTahunStudi || null,
    namaUsaha: body.namaUsaha || null,
    keterangan: body.keterangan || null,
  };

  try {
    const data = await prisma.tracerStudy.upsert({
      where: { lulusanId: lulusan.id },
      update: cleaned,
      create: { lulusanId: lulusan.id, ...cleaned },
    });
    return NextResponse.json(data);
  } catch (e: any) {
    console.error("TracerStudy upsert error:", e);
    return NextResponse.json({ error: e?.message || "Database error" }, { status: 500 });
  }
}
