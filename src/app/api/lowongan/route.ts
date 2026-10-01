import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jurusanId = searchParams.get("jurusanId");

  const data = await prisma.lowongan.findMany({
    where: {
      isActive: true,
      ...(jurusanId ? { OR: [{ jurusanId }, { jurusanId: null }] } : {}),
    },
    include: { perusahaan: true, jurusan: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { judul, deskripsi, persyaratan, gaji, deadline, jurusanId, perusahaanId } = body;

  let resolvedPerusahaanId = perusahaanId;
  if (!resolvedPerusahaanId) {
    const p = await prisma.perusahaan.findUnique({ where: { userId: (session.user as any).id } });
    if (!p) return NextResponse.json({ error: "Perusahaan tidak ditemukan" }, { status: 404 });
    resolvedPerusahaanId = p.id;
  }

  const data = await prisma.lowongan.create({
    data: {
      perusahaanId: resolvedPerusahaanId,
      judul, deskripsi, persyaratan, gaji,
      jurusanId: jurusanId || null,
      deadline: deadline ? new Date(deadline) : null,
    },
  });
  return NextResponse.json(data);
}
