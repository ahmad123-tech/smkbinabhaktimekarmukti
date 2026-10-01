"use client";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Download, Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import toast from "react-hot-toast";

const statusLabel: Record<string, string> = {
  BEKERJA: "Bekerja", KULIAH: "Kuliah", WIRAUSAHA: "Wirausaha", BELUM_BEKERJA: "Belum Bekerja",
};
const statusColor: Record<string, string> = {
  BEKERJA: "bg-blue-100 text-blue-700", KULIAH: "bg-green-100 text-green-700",
  WIRAUSAHA: "bg-yellow-100 text-yellow-700", BELUM_BEKERJA: "bg-red-100 text-red-700",
};

export default function TracerStudyAdminClient() {
  const [list, setList] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [filterJurusan, setFilterJurusan] = useState("");
  const [filterTahun, setFilterTahun] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<{ type: "bulkDelete" } | null>(null);

  async function load() {
    const data = await fetch("/api/tracer-study").then((r) => r.json());
    setList(Array.isArray(data) ? data : []);
    setSelected(new Set());
  }

  useEffect(() => { load(); }, []);

  const filtered = list.filter((t) => {
    const matchStatus = filter ? t.status === filter : true;
    const matchJurusan = filterJurusan ? t.lulusan?.jurusanId === filterJurusan : true;
    const matchTahun = filterTahun ? String(t.lulusan?.tahunLulus) === filterTahun : true;
    return matchStatus && matchJurusan && matchTahun;
  });

  const uniqueJurusan = Array.from(new Map(list.filter(t => t.lulusan?.jurusan).map(t => [t.lulusan.jurusan.id, t.lulusan.jurusan.nama])).entries());
  const uniqueTahun = Array.from(new Set(list.filter(t => t.lulusan?.tahunLulus).map((t) => String(t.lulusan.tahunLulus)))).sort((a, b) => Number(b) - Number(a));

  // ── Checkbox ──────────────────────────────────────────────────
  function toggleOne(id: string) {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleAll() {
    if (filtered.every((t) => selected.has(t.id))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((t) => t.id)));
    }
  }

  // ── Download ──────────────────────────────────────────────────
  function downloadExcel() {
    const targets = selected.size > 0 ? filtered.filter((t) => selected.has(t.id)) : filtered;
    const rows = targets.map((item, i) => ({
      "No": i + 1,
      "Nama Lulusan": item.lulusan?.nama || "",
      "NIS": item.lulusan?.nis || "",
      "Jurusan": item.lulusan?.jurusan?.nama || "",
      "Tahun Lulus": item.lulusan?.tahunLulus || "",
      "Status": statusLabel[item.status] || item.status,
      "Nama Perusahaan/Kampus/Usaha": item.namaPerusahaan || item.namaKampus || item.namaUsaha || "",
      "Jabatan": item.jabatan || "",
      "Gaji (Rp)": item.gaji || "",
      "Lokasi Kerja": item.lokasiKerja || "",
      "Keterangan": item.keterangan || "",
      "Tanggal Isi": new Date(item.createdAt).toLocaleDateString("id-ID"),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 5 }, { wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 12 },
      { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 25 }, { wch: 15 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tracer Study");
    const filterLabel = filter ? `_${statusLabel[filter].replace(" ", "_")}` : "";
    XLSX.writeFile(wb, `tracer_study_smk_bina_bhakti${filterLabel}.xlsx`);
    toast.success(`${targets.length} data diunduh`);
  }

  // ── Bulk Delete ────────────────────────────────────────────────
  async function doBulkDelete() {
    let sukses = 0, gagal = 0;
    for (const id of Array.from(selected)) {
      const res = await fetch(`/api/tracer-study/${id}`, { method: "DELETE" });
      if (res.ok) sukses++; else gagal++;
    }
    if (sukses > 0) toast.success(`${sukses} data tracer study dihapus`);
    if (gagal > 0) toast.error(`${gagal} data gagal dihapus`);
    setConfirm(null);
    await load();
  }

  const allChecked = filtered.length > 0 && filtered.every((t) => selected.has(t.id));
  const someChecked = filtered.some((t) => selected.has(t.id)) && !allChecked;

  return (
    <div>
      {/* Filter + Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2 flex-1">
          {["", "BEKERJA", "KULIAH", "WIRAUSAHA", "BELUM_BEKERJA"].map((s) => (
            <button key={s} onClick={() => { setFilter(s); setSelected(new Set()); }}
              className={`px-3 py-1 rounded-full text-sm border transition ${filter === s ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
              {s === "" ? `Semua (${list.length})` : `${statusLabel[s]} (${list.filter((t) => t.status === s).length})`}
            </button>
          ))}
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select value={filterJurusan} onChange={(e) => { setFilterJurusan(e.target.value); setSelected(new Set()); }}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">Semua Jurusan</option>
            {uniqueJurusan.map(([id, nama]) => <option key={id} value={id}>{nama}</option>)}
          </select>
          <select value={filterTahun} onChange={(e) => { setFilterTahun(e.target.value); setSelected(new Set()); }}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">Semua Tahun</option>
            {uniqueTahun.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex gap-2 ml-auto">
          <button onClick={downloadExcel}
            className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 text-sm">
            <Download size={15} /> {selected.size > 0 ? `Download (${selected.size})` : "Download Excel"}
          </button>
          {selected.size > 0 && (
            <button onClick={() => setConfirm({ type: "bulkDelete" })}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm">
              <Trash2 size={15} /> Hapus ({selected.size})
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allChecked} ref={(el) => { if (el) el.indeterminate = someChecked; }}
                  onChange={toggleAll} className="w-4 h-4 accent-green-700 cursor-pointer" />
              </th>
              {["No", "Nama Lulusan", "Jurusan", "Status", "Tempat Kerja/Kampus", "Jabatan", "Gaji", "Lokasi"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => (
              <tr key={item.id} className={`border-t hover:bg-gray-50 ${selected.has(item.id) ? "bg-green-50" : ""}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleOne(item.id)}
                    className="w-4 h-4 accent-green-700 cursor-pointer" />
                </td>
                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{item.lulusan?.nama}</td>
                <td className="px-4 py-3">{item.lulusan?.jurusan?.nama}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[item.status]}`}>
                    {statusLabel[item.status]}
                  </span>
                </td>
                <td className="px-4 py-3">{item.namaPerusahaan || item.namaKampus || item.namaUsaha || "-"}</td>
                <td className="px-4 py-3">{item.jabatan || "-"}</td>
                <td className="px-4 py-3">{item.gaji ? `Rp ${item.gaji.toLocaleString("id-ID")}` : "-"}</td>
                <td className="px-4 py-3">{item.lokasiKerja || "-"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Belum ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog open={confirm?.type === "bulkDelete"} title={`Hapus ${selected.size} Data Tracer Study?`}
        message={`Anda akan menghapus ${selected.size} data tracer study yang dipilih secara permanen. Lulusan yang datanya terhapus dapat mengisi tracer study kembali.`}
        confirmLabel="Ya, Hapus Semua" confirmColor="bg-red-600 hover:bg-red-700"
        onConfirm={doBulkDelete} onCancel={() => setConfirm(null)} />
    </div>
  );
}
