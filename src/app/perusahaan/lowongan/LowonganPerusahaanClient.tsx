"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

const emptyForm = { judul: "", deskripsi: "", persyaratan: "", gaji: "", deadline: "", jurusanId: "" };

export default function LowonganPerusahaanClient() {
  const [data, setData] = useState<any>(null);
  const [jurusan, setJurusan] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirm, setConfirm] = useState<{ type: "save" | "delete"; id?: string } | null>(null);

  async function load() {
    const [d, j] = await Promise.all([
      fetch("/api/perusahaan/me").then((r) => r.json()),
      fetch("/api/jurusan").then((r) => r.json()),
    ]);
    setData(d); setJurusan(j);
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
    setForm({ judul: item.judul, deskripsi: item.deskripsi, persyaratan: item.persyaratan || "", gaji: item.gaji || "", deadline: item.deadline ? item.deadline.split("T")[0] : "", jurusanId: item.jurusanId || "" });
    setEditId(item.id); setShowModal(true);
  }

  if (!data) return <div className="text-gray-500">Memuat data...</div>;

  return (
    <div>
      <button onClick={() => { setForm(emptyForm); setEditId(null); setShowModal(true); }} className="mb-4 flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800">
        <Plus size={16} /> Tambah Lowongan
      </button>

      <div className="space-y-4">
        {data.lowongan?.map((item: any) => (
          <div key={item.id} className="bg-white rounded-xl shadow p-5">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-gray-800">{item.judul}</h2>
                <p className="text-sm text-gray-500 mt-1">{item.jurusan?.nama || "Semua Jurusan"} • {item.gaji || "Gaji tidak dicantumkan"}</p>
                <p className="text-sm text-gray-600 mt-2">{item.deskripsi}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800"><Pencil size={16} /></button>
                <button onClick={() => setConfirm({ type: "delete", id: item.id })} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
              </div>
            </div>

          </div>
        ))}
        {(!data.lowongan || data.lowongan.length === 0) && (
          <div className="text-center py-12 text-gray-400">Belum ada lowongan</div>
        )}
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
