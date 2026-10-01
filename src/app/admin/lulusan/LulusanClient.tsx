"use client";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus, X, Upload, Download } from "lucide-react";
import * as XLSX from "xlsx";
import ConfirmDialog from "@/components/ConfirmDialog";

const emptyForm = { nis: "", nama: "", jurusanId: "", tahunLulus: "", noHp: "", alamat: "", email: "", password: "" };

export default function LulusanClient({ role = "ADMIN" }: { role?: string }) {
  const [list, setList] = useState<any[]>([]);
  const [jurusan, setJurusan] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [filterJurusan, setFilterJurusan] = useState("");
  const [filterTahun, setFilterTahun] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirm, setConfirm] = useState<{ type: "save" | "cancel" | "delete" | "upload" | "bulkDelete"; id?: string } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  async function load() {
    const [l, j] = await Promise.all([
      fetch("/api/lulusan").then((r) => r.json()),
      fetch("/api/jurusan").then((r) => r.json()),
    ]);
    setList(Array.isArray(l) ? l : []);
    setJurusan(Array.isArray(j) ? j : []);
    setSelected(new Set());
  }

  useEffect(() => { load(); }, []);

  // ── Checkbox ──────────────────────────────────────────────────
  const filtered = list.filter((l) => {
    const matchSearch = l.nama.toLowerCase().includes(search.toLowerCase()) || l.nis.includes(search);
    const matchJurusan = filterJurusan ? l.jurusanId === filterJurusan : true;
    const matchTahun = filterTahun ? String(l.tahunLulus) === filterTahun : true;
    return matchSearch && matchJurusan && matchTahun;
  });

  const uniqueTahun = Array.from(new Set(list.map((l) => String(l.tahunLulus)))).sort((a, b) => Number(b) - Number(a));

  function toggleOne(id: string) {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleAll() {
    if (selected.size === filtered.length && filtered.every((l) => selected.has(l.id))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((l) => l.id)));
    }
  }

  // ── Download ──────────────────────────────────────────────────
  function downloadExcel() {
    const targets = selected.size > 0 ? filtered.filter((l) => selected.has(l.id)) : filtered;
    const rows = targets.map((item, i) => ({
      "No": i + 1,
      "NIS": item.nis,
      "Nama Lengkap": item.nama,
      "Jurusan": item.jurusan?.nama || "",
      "Tahun Lulus": item.tahunLulus,
      "No HP": item.noHp || "",
      "Alamat": item.alamat || "",
      "Status Tracer Study": item.tracerStudy?.status || "Belum Isi",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 5 }, { wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 18 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Lulusan");
    XLSX.writeFile(wb, "data_lulusan.xlsx");
    toast.success(`${targets.length} data diunduh`);
  }

  // ── Bulk Delete ────────────────────────────────────────────────
  async function doBulkDelete() {
    let sukses = 0, gagal = 0;
    for (const id of Array.from(selected)) {
      const res = await fetch(`/api/lulusan/${id}`, { method: "DELETE" });
      if (res.ok) sukses++; else gagal++;
    }
    if (sukses > 0) toast.success(`${sukses} lulusan berhasil dihapus`);
    if (gagal > 0) toast.error(`${gagal} lulusan gagal dihapus`);
    setConfirm(null);
    await load();
  }

  // ── Save ───────────────────────────────────────────────────────
  async function doSave() {
    if (editId) {
      await fetch(`/api/lulusan/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      toast.success("Data diperbarui");
    } else {
      const res = await fetch("/api/lulusan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { toast.error("Gagal menambahkan lulusan"); return; }
      toast.success("Lulusan ditambahkan");
    }
    setShowModal(false); setForm(emptyForm); setEditId(null); setConfirm(null); load();
  }

  async function doDelete(id: string) {
    await fetch(`/api/lulusan/${id}`, { method: "DELETE" });
    toast.success("Dihapus"); setConfirm(null); load();
  }

  function handleSubmit(e: React.FormEvent) { e.preventDefault(); setConfirm({ type: "save" }); }
  function handleDelete(id: string) { setConfirm({ type: "delete", id }); }
  function openEdit(item: any) {
    setForm({ nis: item.nis, nama: item.nama, jurusanId: item.jurusanId, tahunLulus: item.tahunLulus, noHp: item.noHp || "", alamat: item.alamat || "", email: "", password: "" });
    setEditId(item.id); setShowModal(true);
  }

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([
      ["nis", "nama", "email", "password", "jurusan", "tahunLulus", "noHp", "alamat"],
      ["1234567890", "Contoh Nama", "contoh@email.com", "password123", "Teknik Komputer dan Jaringan", "2024", "081234567890", "Jl. Contoh No.1"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lulusan");
    XLSX.writeFile(wb, "template_lulusan.xlsx");
  }

  async function doImport() {
    if (!selectedFile) return;
    setConfirm(null); setImporting(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);
        let sukses = 0, gagal = 0;
        for (const row of rows) {
          const jurusanItem = jurusan.find((j) => j.nama.toLowerCase().trim() === String(row.jurusan || "").toLowerCase().trim());
          if (!jurusanItem) { gagal++; continue; }
          const res = await fetch("/api/lulusan", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nis: String(row.nis), nama: String(row.nama), email: String(row.email), password: String(row.password), jurusanId: jurusanItem.id, tahunLulus: Number(row.tahunLulus), noHp: String(row.noHp || ""), alamat: String(row.alamat || "") }),
          });
          if (res.ok) sukses++; else gagal++;
        }
        toast.success(`Import selesai: ${sukses} berhasil, ${gagal} gagal`);
        setShowImport(false); setSelectedFile(null);
        if (fileRef.current) fileRef.current.value = "";
        load();
      } catch { toast.error("File tidak valid"); }
      finally { setImporting(false); }
    };
    reader.readAsArrayBuffer(selectedFile);
  }

  const allChecked = filtered.length > 0 && filtered.every((l) => selected.has(l.id));
  const someChecked = filtered.some((l) => selected.has(l.id)) && !allChecked;

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4">
        {role === "ADMIN" && (
          <button onClick={() => { setForm(emptyForm); setEditId(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 text-sm">
            <Plus size={16} /> Tambah Lulusan
          </button>
        )}
        {/* Tombol import excel dipindahkan ke dalam popup tambah lulusan */}
        <button onClick={downloadExcel}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          <Download size={16} /> {selected.size > 0 ? `Download (${selected.size})` : "Download Excel"}
        </button>

        {selected.size > 0 && role === "ADMIN" && (
          <button onClick={() => setConfirm({ type: "bulkDelete" })}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm">
            <Trash2 size={16} /> Hapus ({selected.size})
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <select value={filterJurusan} onChange={(e) => { setFilterJurusan(e.target.value); setSelected(new Set()); }}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">Semua Jurusan</option>
            {jurusan.map((j: any) => <option key={j.id} value={j.id}>{j.nama}</option>)}
          </select>
          <select value={filterTahun} onChange={(e) => { setFilterTahun(e.target.value); setSelected(new Set()); }}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">Semua Tahun</option>
            {uniqueTahun.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="text" placeholder="Cari nama atau NIS..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-56" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {role === "ADMIN" && (
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={allChecked} ref={(el) => { if (el) el.indeterminate = someChecked; }}
                    onChange={toggleAll} className="w-4 h-4 accent-green-700 cursor-pointer" />
                </th>
              )}
              {["No", "NIS", "Nama", "Jurusan", "Tahun Lulus", "No HP", "Status Tracer", "Aksi"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => (
              <tr key={item.id} className={`border-t hover:bg-gray-50 ${selected.has(item.id) ? "bg-green-50" : ""}`}>
                {role === "ADMIN" && (
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleOne(item.id)}
                      className="w-4 h-4 accent-green-700 cursor-pointer" />
                  </td>
                )}
                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                <td className="px-4 py-3">{item.nis}</td>
                <td className="px-4 py-3 font-medium">{item.nama}</td>
                <td className="px-4 py-3">{item.jurusan?.nama}</td>
                <td className="px-4 py-3">{item.tahunLulus}</td>
                <td className="px-4 py-3">{item.noHp || "-"}</td>
                <td className="px-4 py-3">
                  {item.tracerStudy ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">{item.tracerStudy.status}</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs">Belum Isi</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {role === "ADMIN" && (<>
                      <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800"><Pencil size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </>)}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={role === "ADMIN" ? 9 : 8} className="px-4 py-8 text-center text-gray-400">Belum ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="font-bold text-lg">{editId ? "Edit Lulusan" : "Tambah Lulusan"}</h2>
              <div className="flex items-center gap-3">
                {!editId && (
                  <button onClick={() => { setShowModal(false); setShowImport(true); }}
                    className="flex items-center gap-1 text-sm bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg hover:bg-yellow-200 font-medium">
                    <Upload size={14} /> Import Excel
                  </button>
                )}
                <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-500 hover:text-gray-700" /></button>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <form id="lulusan-form" onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIS</label>
                    <input value={form.nis} onChange={(e) => setForm({ ...form, nis: e.target.value })} required
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Lulus</label>
                    <input type="number" value={form.tahunLulus} onChange={(e) => setForm({ ...form, tahunLulus: e.target.value })} required
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jurusan</label>
                  <select value={form.jurusanId} onChange={(e) => setForm({ ...form, jurusanId: e.target.value })} required
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="">Pilih Jurusan</option>
                    {jurusan.map((j: any) => <option key={j.id} value={j.id}>{j.nama}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No HP</label>
                    <input value={form.noHp} onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                    <input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
                {!editId && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Login</label>
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                  </div>
                )}
              </form>
            </div>
            <div className="px-6 py-4 border-t flex gap-2">
              <button form="lulusan-form" type="submit" className="flex-1 bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 font-medium">Simpan</button>
              <button type="button" onClick={() => setConfirm({ type: "cancel" })} className="flex-1 border py-2 rounded-lg hover:bg-gray-50">Batal</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={confirm?.type === "upload"} title="Konfirmasi Import Excel"
        message={`Apakah Anda yakin ingin mengimport data dari file "${selectedFile?.name}"?`}
        confirmLabel="Ya, Import" onConfirm={doImport} onCancel={() => setConfirm(null)} />
      <ConfirmDialog open={confirm?.type === "save"}
        title={editId ? "Konfirmasi Perubahan" : "Konfirmasi Tambah Data"}
        message={editId ? "Apakah Anda yakin ingin menyimpan perubahan data lulusan ini?" : "Apakah Anda yakin ingin menambahkan lulusan baru ini?"}
        confirmLabel="Ya, Simpan" onConfirm={doSave} onCancel={() => setConfirm(null)} />
      <ConfirmDialog open={confirm?.type === "cancel"} title="Batalkan Perubahan?"
        message="Data yang sudah diisi akan hilang. Apakah Anda yakin ingin membatalkan?"
        confirmLabel="Ya, Batalkan" confirmColor="bg-red-600 hover:bg-red-700"
        onConfirm={() => { setConfirm(null); setShowModal(false); setForm(emptyForm); setEditId(null); }}
        onCancel={() => setConfirm(null)} />
      <ConfirmDialog open={confirm?.type === "delete"} title="Hapus Lulusan?"
        message="Data lulusan ini akan dihapus permanen dan tidak dapat dikembalikan."
        confirmLabel="Ya, Hapus" confirmColor="bg-red-600 hover:bg-red-700"
        onConfirm={() => doDelete(confirm!.id!)} onCancel={() => setConfirm(null)} />
      <ConfirmDialog open={confirm?.type === "bulkDelete"} title={`Hapus ${selected.size} Lulusan?`}
        message={`Anda akan menghapus ${selected.size} data lulusan yang dipilih secara permanen. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Semua" confirmColor="bg-red-600 hover:bg-red-700"
        onConfirm={doBulkDelete} onCancel={() => setConfirm(null)} />

      {/* Modal Import Excel */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="font-bold text-lg">Import Data Lulusan</h2>
              <button onClick={() => setShowImport(false)}><X size={20} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                <p className="font-medium mb-1">Format kolom Excel:</p>
                <p>nis | nama | email | password | jurusan | tahunLulus | noHp | alamat</p>
                <p className="mt-1 text-xs">Nama jurusan harus sama persis dengan data jurusan di sistem.</p>
              </div>
              <button onClick={downloadTemplate} className="text-sm text-green-700 hover:underline">📥 Download Template Excel</button>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih File Excel (.xlsx)</label>
                <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} disabled={importing}
                  className="w-full border rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-green-700 file:text-white file:text-sm cursor-pointer" />
              </div>
              {selectedFile && <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-800">File: <span className="font-medium">{selectedFile.name}</span></div>}
              {importing && <p className="text-sm text-gray-500 text-center">Sedang mengimport data...</p>}
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
