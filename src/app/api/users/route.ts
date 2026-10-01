import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { lulusan: true, perusahaan: true },
  });
  return NextResponse.json(users.map((u) => ({ ...u, password: undefined })));
}

export async function POST(req: Request) {
  const { email, password, role } = await req.json();
  const dataPayload: any = {
    email,
    password: await bcrypt.hash(password, 10),
    role,
  };

  if (role === "PERUSAHAAN") {
    dataPayload.perusahaan = {
      create: {
        nama: "Mitra DUDI Baru",
        bidang: "",
      },
    };
  }

  const user = await prisma.user.create({
    data: dataPayload,
  });
  return NextResponse.json({ ...user, password: undefined });
}
