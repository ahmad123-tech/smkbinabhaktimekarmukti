"use client";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Upload, Eye, EyeOff } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import * as XLSX from "xlsx";

const roles = ["ADMIN", "KEPALA_SEKOLAH", "PERUSAHAAN"];
const roleLabel: Record<string, string> = {
  ADMIN: "Admin / BKK",
  KEPALA_SEKOLAH: "Kepala Sekolah", LULUSAN: "Lulusan", PERUSAHAAN: "Mitra DUDI",
};
const roleColor: Record<string, string> = {
  ADMIN: "bg-green-100 text-green-700",
  KEPALA_SEKOLAH: "bg-indigo-100 text-indigo-700", LULUSAN: "bg-blue-100 text-blue-700",
  PERUSAHAAN: "bg-yellow-100 text-yellow-700",
};

const emptyForm = { email: "", password: "", role: "ADMIN" };

export default function UsersClient() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirm, setConfirm] = useState<{ type: "save" | "cancel" | "delete" | "upload"; id?: string } | null>(null);
  const [search, setSearch] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const data = await fetch("/api/users").then((r) => r.json());
    setList(data);
  }

  useEffect(() => { load(); }, []);

  async function doImport() {
    if (!selectedFile) return;
    setConfirm(null);
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);
        let sukses = 0, gagal = 0;
        for (const row of rows) {
          if (!row.email || !row.password || !row.role) { gagal++; continue; }
          const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: String(row.email), password: String(row.password), role: String(row.role).toUpperCase() }),
          });
          if (res.ok) sukses++; else gagal++;
        }
        toast.success(`Import selesai: ${sukses} berhasil, ${gagal} gagal`);
        setShowImport(false);
        setSelectedFile(null);
        if (fileRef.current) fileRef.current.value = "";
        load();
      } catch { toast.error("File tidak valid"); }
      finally { setImporting(false); }
    };
    reader.readAsArrayBuffer(selectedFile);
  }

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([
      ["email", "password", "role"],
      ["admin@example.com", "password123", "ADMIN"],
      ["kepsek@example.com", "password123", "KEPALA_SEKOLAH"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Akun");
    XLSX.writeFile(wb, "template_akun.xlsx");
  }

  async function doSave() {
    if (editId) {
      await fetch(`/api/users/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      toast.success("Akun diperbarui");
    } else {
      const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { toast.error("Gagal membuat akun"); return; }
      toast.success("Akun ditambahkan");
    }
    setShowModal(false); setForm(emptyForm); setEditId(null); setConfirm(null); setShowPassword(false); load();
  }

  async function doDelete(id: string) {
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    toast.success("Akun dihapus"); setConfirm(null); load();
  }

  function handleSubmit(e: React.FormEvent) { e.preventDefault(); setConfirm({ type: "save" }); }

  function openEdit(item: any) {
    setForm({ email: item.email, password: "", role: item.role });
    setEditId(item.id);
    setShowPassword(false);
    setShowModal(true);
  }

  const filtered = list.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    roleLabel[u.role]?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => { setForm(emptyForm); setEditId(null); setShowPassword(false); setShowModal(true); }}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 text-sm">
          <Plus size={16} /> Tambah Akun
        </button>
        <button onClick={() => setShowImport(true)}
          className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 text-sm">
          <Upload size={16} /> Import Excel
        </button>
        <input type="text" placeholder="Cari email atau role..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-56" />
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {["No", "Email", "Role", "Nama", "Dibuat", "Aksi"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{item.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor[item.role]}`}>
                    {roleLabel[item.role] || item.role}
                  </span>
                </td>
                <td className="px-4 py-3">{item.lulusan?.nama || item.perusahaan?.nama || "-"}</td>
                <td className="px-4 py-3">{new Date(item.createdAt).toLocaleDateString("id-ID")}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800"><Pencil size={16} /></button>
                    <button onClick={() => setConfirm({ type: "delete", id: item.id })} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada data</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="font-bold text-lg">{editId ? "Edit Akun" : "Tambah Akun"}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <div className="px-6 py-4">
              <form id="user-form" onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {editId && <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span>}
                  </label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required={!editId}
                      className="w-full border rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {!editId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                      {roles.map((r) => <option key={r} value={r}>{roleLabel[r]}</option>)}
                    </select>
                  </div>
                )}
              </form>
            </div>
            <div className="px-6 py-4 border-t flex gap-2">
              <button form="user-form" type="submit" className="flex-1 bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 font-medium">Simpan</button>
              <button onClick={() => setConfirm({ type: "cancel" })} className="flex-1 border py-2 rounded-lg hover:bg-gray-50">Batal</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={confirm?.type === "upload"} title="Konfirmasi Import Excel"
        message={`Apakah Anda yakin ingin mengimport akun dari file "${selectedFile?.name}"?`}
        confirmLabel="Ya, Import" onConfirm={doImport} onCancel={() => setConfirm(null)} />
      <ConfirmDialog open={confirm?.type === "save"} title={editId ? "Konfirmasi Perubahan" : "Konfirmasi Tambah Akun"}
        message={editId ? "Apakah Anda yakin ingin menyimpan perubahan akun ini?" : "Apakah Anda yakin ingin menambahkan akun baru ini?"}
        confirmLabel="Ya, Simpan" onConfirm={doSave} onCancel={() => setConfirm(null)} />
      <ConfirmDialog open={confirm?.type === "cancel"} title="Batalkan?" message="Data yang sudah diisi akan hilang."
        confirmLabel="Ya, Batalkan" confirmColor="bg-red-600 hover:bg-red-700"
        onConfirm={() => { setConfirm(null); setShowModal(false); setForm(emptyForm); setEditId(null); }}
        onCancel={() => setConfirm(null)} />
      <ConfirmDialog open={confirm?.type === "delete"} title="Hapus Akun?" message="Akun ini akan dihapus permanen."
        confirmLabel="Ya, Hapus" confirmColor="bg-red-600 hover:bg-red-700"
        onConfirm={() => doDelete(confirm!.id!)} onCancel={() => setConfirm(null)} />
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="font-bold text-lg">Import Data Akun</h2>
              <button onClick={() => setShowImport(false)}><X size={20} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                <p className="font-medium mb-1">Format kolom Excel:</p>
                <p>email | password | role</p>
                <p className="mt-1 text-xs">Role yang valid: ADMIN, KEPALA_SEKOLAH</p>
              </div>
              <button onClick={downloadTemplate} className="text-sm text-purple-700 hover:underline">📥 Download Template Excel</button>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih File Excel (.xlsx)</label>
                <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} disabled={importing}
                  className="w-full border rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-green-700 file:text-white file:text-sm cursor-pointer" />
              </div>
              {selectedFile && <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-800">File: <span className="font-medium">{selectedFile.name}</span></div>}
              {importing && <p className="text-sm text-gray-500 text-center">Sedang mengimport...</p>}
            </div>
            <div className="px-6 py-4 border-t flex gap-2">
              <button onClick={() => { if (selectedFile) setConfirm({ type: "upload" }); else toast.error("Pilih file terlebih dahulu"); }}
                disabled={importing || !selectedFile}
                className="flex-1 flex items-center justify-center gap-2 bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 text-sm font-medium disabled:opacity-50">
                <Upload size={15} /> Upload & Import
              </button>
              <button onClick={() => { setShowImport(false); setSelectedFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="flex-1 border py-2 rounded-lg hover:bg-gray-50 text-sm">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
