"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MessageCircle, Send, CheckSquare, Square } from "lucide-react";

export default function NotifikasiClient({ role = "ADMIN" }: { role?: string }) {
  const [lulusan, setLulusan] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [waLinks, setWaLinks] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/lulusan").then((r) => r.json()).then((data) => {
      setLulusan(data.filter((l: any) => !l.tracerStudy));
    });
  }, []);

  function toggleSelect(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function toggleAll() {
    setSelected(selected.length === lulusan.length ? [] : lulusan.map((l) => l.id));
  }

  async function handleKirim() {
    if (selected.length === 0) { toast.error("Pilih minimal satu lulusan"); return; }
    setLoading(true);
    const res = await fetch("/api/notifikasi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lulusanIds: selected }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error(data.error || "Gagal memproses"); return; }
    setWaLinks(data.results);
    toast.success("Link WhatsApp siap dibuka");
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        <p className="font-semibold mb-1">📋 Informasi</p>
        <p>Halaman ini menampilkan lulusan yang <strong>belum mengisi Tracer Study</strong>. Pilih lulusan lalu klik kirim untuk membuka link WhatsApp dengan pesan yang sudah disiapkan.</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-700">
            Lulusan Belum Isi Tracer Study
            <span className="ml-2 text-sm font-normal text-gray-400">({lulusan.length} lulusan)</span>
          </h2>
          {role === "ADMIN" && (
            <button onClick={toggleAll} className="flex items-center gap-1 text-sm text-green-700 hover:underline">
              {selected.length === lulusan.length && lulusan.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
              {selected.length === lulusan.length && lulusan.length > 0 ? "Batal Pilih Semua" : "Pilih Semua"}
            </button>
          )}
        </div>

        {lulusan.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>🎉 Semua lulusan sudah mengisi Tracer Study!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 w-10"></th>
                  {["Nama", "NIS", "Jurusan", "Tahun Lulus", "No HP"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lulusan.map((item) => (
                  <tr key={item.id}
                    className={`border-t cursor-pointer hover:bg-gray-50 ${selected.includes(item.id) ? "bg-green-50" : ""}`}
                    onClick={() => toggleSelect(item.id)}>
                    <td className="px-4 py-3">
                      {selected.includes(item.id)
                        ? <CheckSquare size={16} className="text-green-700" />
                        : <Square size={16} className="text-gray-400" />}
                    </td>
                    <td className="px-4 py-3 font-medium">{item.nama}</td>
                    <td className="px-4 py-3">{item.nis}</td>
                    <td className="px-4 py-3">{item.jurusan?.nama}</td>
                    <td className="px-4 py-3">{item.tahunLulus}</td>
                    <td className="px-4 py-3">
                      {item.noHp || <span className="text-red-400 text-xs">Tidak ada</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {lulusan.length > 0 && role === "ADMIN" && (
          <div className="mt-5 flex items-center gap-3 border-t pt-4">
            <span className="text-sm text-gray-500">{selected.length} lulusan dipilih</span>
            <button
              onClick={handleKirim}
              disabled={loading || selected.length === 0}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition"
            >
              <MessageCircle size={16} />
              {loading ? "Memproses..." : "Kirim via WhatsApp"}
            </button>
          </div>
        )}
      </div>

      {waLinks.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <MessageCircle size={18} className="text-green-500" />
            Link WhatsApp ({waLinks.length} lulusan)
          </h2>
          <div className="space-y-3">
            {waLinks.map((item, i) => (
              <div key={i} className="flex items-center justify-between border rounded-lg px-4 py-3">
                <div>
                  <p className="font-medium text-sm">{item.nama}</p>
                  <p className="text-xs text-gray-400">{item.noHp || "Nomor tidak tersedia"}</p>
                </div>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                    <Send size={12} /> Buka WhatsApp
                  </a>
                ) : (
                  <span className="text-xs text-red-400 bg-red-50 px-3 py-1.5 rounded-lg">No HP tidak ada</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">* Klik "Buka WhatsApp" untuk membuka chat dengan pesan permohonan tracer study yang sudah disiapkan otomatis.</p>
        </div>
      )}
    </div>
  );
}
