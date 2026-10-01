/** @type {import('next').NextConfig} */

// Generate token unik setiap kali server dijalankan (npm run dev / npm start).
// Token ini disematkan ke dalam setiap JWT saat login.
// Ketika server di-restart, token berubah → semua JWT lama otomatis tidak valid
// → user HARUS login ulang dari landing page.
const runtimeServerToken = Math.random().toString(36).substring(2, 18) + Date.now().toString(36);

const nextConfig = {
  images: { unoptimized: true },
  env: {
    // Tersedia di server-side (auth.ts) dan Edge middleware
    RUNTIME_SERVER_TOKEN: runtimeServerToken,
  },
}

module.exports = nextConfig
