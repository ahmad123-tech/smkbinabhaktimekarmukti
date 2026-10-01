"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, X } from "lucide-react";

export default function PerusahaanDashboardClient() {
  const [data, setData] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});

  async function load() {
    const d = await fetch("/api/perusahaan/me").then((r) => r.json());
    setData(d);
    setForm({
      nama: d.nama || "", bidang: d.bidang || "", alamat: d.alamat || "",
      kota: d.kota || "", telepon: d.telepon || "", website: d.website || "",
      deskripsi: d.deskripsi || "", latitude: d.latitude || "", longitude: d.longitude || "",
    });
  }

  useEffect(() => { load(); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/perusahaan/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    toast.success("Profil diperbarui");
    setEditMode(false);
    load();
  }

  if (!data) return <div className="text-gray-500">Memuat data...</div>;


  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="font-semibold text-gray-700">Profil Perusahaan</h2>
          <button onClick={() => setEditMode(!editMode)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm">
            {editMode ? <><X size={14} /> Batal</> : <><Pencil size={14} /> Edit</>}
          </button>
        </div>

        {editMode ? (
          <form onSubmit={handleSave} className="space-y-3">
            {[
              { label: "Nama Perusahaan", key: "nama" }, { label: "Bidang Usaha", key: "bidang" },
              { label: "Alamat", key: "alamat" }, { label: "Kota", key: "kota" },
              { label: "Telepon", key: "telepon" }, { label: "Website", key: "website" },
              { label: "Latitude", key: "latitude" }, { label: "Longitude", key: "longitude" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 text-sm font-medium">Simpan</button>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Nama", data.nama], ["Bidang", data.bidang], ["Kota", data.kota],
              ["Telepon", data.telepon], ["Website", data.website],
              ["Total Lowongan", data.lowongan?.length || 0],
            ].map(([label, value]) => (
              <div key={label as string}>
                <span className="text-gray-500">{label}</span>
                <p className="font-medium">{value || "-"}</p>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
}
