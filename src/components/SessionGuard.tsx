"use client";
import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * SessionGuard
 *
 * Masalah: Chrome mempertahankan cookie sesi meskipun browser ditutup total.
 * Solusi: Gunakan sessionStorage sebagai "penanda sesi browser aktif".
 *
 * - sessionStorage BENAR-BENAR terhapus ketika semua jendela browser ditutup.
 * - Cookie bisa tetap ada meskipun browser ditutup (perilaku Chrome).
 *
 * Logika:
 * - Jika cookie session ADA tapi sessionStorage TIDAK ada
 *   → berarti browser baru dibuka ulang dengan cookie lama → paksa logout → landing page
 * - Jika cookie session ADA dan sessionStorage ADA
 *   → sesi aktif normal, lanjutkan
 * - Marker sessionStorage diset oleh login page setelah login berhasil
 */
export default function SessionGuard() {
    const { data: session, status } = useSession();
    const handled = useRef(false);
    const router = useRouter();

    useEffect(() => {
        // Tunggu status session selesai loading
        if (status === "loading") return;
        // Jangan proses lebih dari sekali
        if (handled.current) return;
        handled.current = true;

        const hasBrowserSession = sessionStorage.getItem("hasBrowserSession");

        if (session && !hasBrowserSession) {
            // Cookie session ada TAPI penanda sessionStorage tidak ada
            // → Browser baru saja dibuka ulang dengan cookie lama
            // → Paksa logout dan redirect ke landing page
            signOut({ callbackUrl: "/login" });
        }
        // Jika session aktif dan marker ada → normal, tidak perlu tindakan
    }, [status, session, router]);

    return null;
}
