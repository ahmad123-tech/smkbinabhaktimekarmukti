import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { judul, deskripsi, persyaratan, gaji, deadline, jurusanId, isActive } = body;
  const data = await prisma.lowongan.update({
    where: { id: params.id },
    data: {
      judul, deskripsi, persyaratan, gaji,
      jurusanId: jurusanId || null,
      deadline: deadline ? new Date(deadline) : null,
      isActive: isActive ?? true,
    },
  });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.lowongan.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
