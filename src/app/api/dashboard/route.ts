import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [totalLulusan, totalPerusahaan, totalLowongan, tracerStudies, jurusanList] = await Promise.all([
    prisma.lulusan.count(),
    prisma.perusahaan.count(),
    prisma.lowongan.count({ where: { isActive: true } }),
    prisma.tracerStudy.findMany({ include: { lulusan: { include: { jurusan: true } } } }),
    prisma.jurusan.findMany({ include: { lulusan: { include: { tracerStudy: true } } } }),
  ]);

  const bekerja = tracerStudies.filter((t) => t.status === "BEKERJA").length;
  const kuliah = tracerStudies.filter((t) => t.status === "KULIAH").length;
  const wirausaha = tracerStudies.filter((t) => t.status === "WIRAUSAHA").length;
  const belumBekerja = tracerStudies.filter((t) => t.status === "BELUM_BEKERJA").length;

  const perJurusan = jurusanList.map((j) => ({
    jurusan: j.nama,
    total: j.lulusan.length,
    bekerja: j.lulusan.filter((l) => l.tracerStudy?.status === "BEKERJA").length,
    kuliah: j.lulusan.filter((l) => l.tracerStudy?.status === "KULIAH").length,
    wirausaha: j.lulusan.filter((l) => l.tracerStudy?.status === "WIRAUSAHA").length,
  }));

  const markers = tracerStudies
    .filter((t) => t.latitude && t.longitude)
    .map((t) => ({
      id: t.id,
      lat: t.latitude!,
      lng: t.longitude!,
      title: t.lulusan.nama,
      tahunLulus: t.lulusan.tahunLulus,
      jurusan: t.lulusan.jurusan?.nama || "-",
      status: t.status,
    }));

  return NextResponse.json({
    totalLulusan,
    totalPerusahaan,
    totalLowongan,
    totalTracerStudy: tracerStudies.length,
    bekerja,
    kuliah,
    wirausaha,
    belumBekerja,
    perJurusan,
    markers,
  });
}
