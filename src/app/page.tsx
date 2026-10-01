import { redirect } from "next/navigation";

export default function Home() {
  // Selalu arahkan ke halaman login sesuai permintaan
  redirect("/login");
}

