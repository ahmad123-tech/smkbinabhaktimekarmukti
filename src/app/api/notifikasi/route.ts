import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const pesanTemplate = (nama: string) =>
  `Assalamu'alaikum, Yth. ${nama}.\n\nKami dari BKK SMK Bina Bhakti Mekarmukti menginformasikan bahwa Anda belum mengisi data Tracer Study.\n\nMohon segera mengisi data Tracer Study Anda melalui sistem kami di:\nhttp://localhost:3000/lulusan/tracer-study\n\nData Tracer Study sangat penting untuk memantau perkembangan lulusan dan meningkatkan kualitas pendidikan di SMK Bina Bhakti.\n\nTerima kasih atas perhatian dan kerjasamanya.\n\nHormat kami,\nBKK SMK Bina Bhakti Mekarmukti`;

export async function POST(req: Request) {
  const { lulusanIds } = await req.json();

  const lulusanList = await prisma.lulusan.findMany({
    where: { id: { in: lulusanIds } },
    include: { tracerStudy: true },
  });

  const belumIsi = lulusanList.filter((l) => !l.tracerStudy);

  if (belumIsi.length === 0) {
    return NextResponse.json({ error: "Semua lulusan yang dipilih sudah mengisi tracer study" }, { status: 400 });
  }

  const results = belumIsi.map((l) => ({
    nama: l.nama,
    noHp: l.noHp,
    url: l.noHp
      ? `https://wa.me/62${l.noHp.replace(/^0/, "")}?text=${encodeURIComponent(pesanTemplate(l.nama))}`
      : null,
  }));

  return NextResponse.json({ results });
}
