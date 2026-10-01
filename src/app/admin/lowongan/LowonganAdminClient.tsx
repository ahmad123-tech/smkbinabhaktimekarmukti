"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

const emptyForm = { judul: "", deskripsi: "", persyaratan: "", gaji: "", deadline: "", jurusanId: "", perusahaanId: "" };

export default function LowonganAdminClient({ role = "ADMIN" }: { role?: string }) {
  const [list, setList] = useState<any[]>([]);
  const [jurusan, setJurusan] = useState<any[]>([]);
  const [perusahaan, setPerusahaan] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirm, setConfirm] = useState<{ type: "save" | "delete"; id?: string } | null>(null);

  async function load() {
    const [l, j, p] = await Promise.all([
      fetch("/api/lowongan").then((r) => r.json()),
      fetch("/api/jurusan").then((r) => r.json()),
      fetch("/api/perusahaan").then((r) => r.json()),
    ]);
    setList(l); setJurusan(j); setPerusahaan(p);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setConfirm({ type: "save" });
  }

  async function doSave() {
    if (editId) {
      await fetch(`/api/lowongan/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      toast.success("Lowongan diperbarui");
    } else {
      await fetch("/api/lowongan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      toast.success("Lowongan ditambahkan");
    }
    setShowModal(false); setForm(emptyForm); setEditId(null); setConfirm(null); load();
  }

  async function doDelete(id: string) {
    await fetch(`/api/lowongan/${id}`, { method: "DELETE" });
    toast.success("Dihapus"); setConfirm(null); load();
  }

  function openEdit(item: any) {
    setForm({ judul: item.judul, deskripsi: item.deskripsi, persyaratan: item.persyaratan || "", gaji: item.gaji || "", deadline: item.deadline ? item.deadline.split("T")[0] : "", jurusanId: item.jurusanId || "", perusahaanId: item.perusahaanId });
    setEditId(item.id); setShowModal(true);
  }

  return (
    <div>
      {role === "ADMIN" && (
        <button onClick={() => { setForm(emptyForm); setEditId(null); setShowModal(true); }} className="mb-4 flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800">
          <Plus size={16} /> Tambah Lowongan
        </button>
      )}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {["Judul", "Perusahaan", "Jurusan", "Gaji", "Deadline", "Status", "Aksi"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{item.judul}</td>
                <td className="px-4 py-3">{item.perusahaan?.nama}</td>
                <td className="px-4 py-3">{item.jurusan?.nama || "Semua Jurusan"}</td>
                <td className="px-4 py-3">{item.gaji || "-"}</td>
                <td className="px-4 py-3">{item.deadline ? new Date(item.deadline).toLocaleDateString("id-ID") : "-"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {item.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  {role === "ADMIN" && (
                    <>
                      <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800"><Pencil size={16} /></button>
                      <button onClick={() => setConfirm({ type: "delete", id: item.id })} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Belum ada data</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">{editId ? "Edit Lowongan" : "Tambah Lowongan"}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Perusahaan</label>
                <select value={form.perusahaanId} onChange={(e) => setForm({ ...form, perusahaanId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Pilih Perusahaan</option>
                  {perusahaan.map((p: any) => <option key={p.id} value={p.id}>{p.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jurusan (kosongkan untuk semua)</label>
                <select value={form.jurusanId} onChange={(e) => setForm({ ...form, jurusanId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Semua Jurusan</option>
                  {jurusan.map((j: any) => <option key={j.id} value={j.id}>{j.nama}</option>)}
                </select>
              </div>
              {[
                { label: "Judul Lowongan", key: "judul" }, { label: "Gaji", key: "gaji" },
                { label: "Deadline", key: "deadline", type: "date" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type={type || "text"} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              {["deskripsi", "persyaratan"].map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{key}</label>
                  <textarea value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 font-medium">Simpan</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border py-2 rounded-lg hover:bg-gray-50">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog open={confirm?.type === "save"} title={editId ? "Konfirmasi Perubahan" : "Konfirmasi Tambah Lowongan"}
        message={editId ? "Apakah Anda yakin ingin menyimpan perubahan lowongan ini?" : "Apakah Anda yakin ingin menambahkan lowongan baru?"}
        confirmLabel="Ya, Simpan" onConfirm={doSave} onCancel={() => setConfirm(null)} />
      <ConfirmDialog open={confirm?.type === "delete"} title="Hapus Lowongan?" message="Lowongan ini akan dihapus permanen."
        confirmLabel="Ya, Hapus" confirmColor="bg-red-600 hover:bg-red-700"
        onConfirm={() => doDelete(confirm!.id!)} onCancel={() => setConfirm(null)} />
    </div>
  );
}
