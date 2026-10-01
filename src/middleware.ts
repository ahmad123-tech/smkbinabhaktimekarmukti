import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Route yang perlu dilindungi (hanya user yang sudah login)
const protectedRoutes = ["/admin", "/lulusan", "/perusahaan", "/kepala-sekolah", "/super-admin"];

// Mapping role ke dashboard URL
const roleDashboard: Record<string, string> = {
    ADMIN: "/admin",
    LULUSAN: "/lulusan",
    PERUSAHAAN: "/perusahaan",
    KEPALA_SEKOLAH: "/kepala-sekolah",
    SUPER_ADMIN: "/super-admin",
};

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = request.nextUrl;

    // ─────────────────────────────────────────────────────────────────
    // VALIDASI SERVER TOKEN
    // Setiap kali npm run dev/start dijalankan, RUNTIME_SERVER_TOKEN bernilai baru.
    // JWT yang dibuat sebelum server ini berjalan memiliki serverToken yang berbeda.
    // → JWT lama = tidak valid → redirect ke landing page untuk login ulang.
    // ─────────────────────────────────────────────────────────────────
    if (token) {
        const currentServerToken = process.env.RUNTIME_SERVER_TOKEN;
        const tokenServerToken = token.serverToken as string | undefined;

        if (!tokenServerToken || tokenServerToken !== currentServerToken) {
            // JWT dari server sebelumnya → paksa ke landing page
            // Hapus cookie sesi dengan menambahkan header Set-Cookie
            const response = NextResponse.redirect(new URL("/login", request.url));
            response.cookies.delete("next-auth.session-token");
            response.cookies.delete("__Secure-next-auth.session-token");
            return response;
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // Jika user sudah login (valid) dan mengakses /login → ke dashboard
    // Halaman "/" (landing page) SELALU bisa diakses
    // ─────────────────────────────────────────────────────────────────
    if (token && pathname === "/login") {
        const role = token.role as string;
        const dashboard = roleDashboard[role] || "/";
        return NextResponse.redirect(new URL(dashboard, request.url));
    }

    // Jika user belum login dan mencoba akses route yang dilindungi → /login
    // ─────────────────────────────────────────────────────────────────
    if (!token) {
        const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
        if (isProtected) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)|api/).*)",
    ],
};
