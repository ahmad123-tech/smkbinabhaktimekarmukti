"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import StatCard from "@/components/StatCard";
import { Users, Briefcase, GraduationCap, TrendingUp, Download } from "lucide-react";
import * as XLSX from "xlsx";

const COLORS = ["#16a34a", "#10b981", "#f59e0b", "#ef4444"];

export default function KepsekDashboardClient() {
  const [data, setData] = useState<any>(null);
  const [tracerList, setTracerList] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
    fetch("/api/tracer-study").then((r) => r.json()).then(setTracerList);
  }, []);

  if (!data) return <div className="text-gray-500">Memuat data...</div>;

  const pieData = [
    { name: "Bekerja", value: data.bekerja },
    { name: "Kuliah", value: data.kuliah },
    { name: "Wirausaha", value: data.wirausaha },
    { name: "Belum Bekerja", value: data.belumBekerja },
  ];

  const persen = data.totalTracerStudy > 0
    ? Math.round((data.bekerja / data.totalTracerStudy) * 100)
    : 0;

  function downloadLaporanKeterserapan() {
    const statusLabel: Record<string, string> = {
      BEKERJA: "Bekerja", KULIAH: "Kuliah", WIRAUSAHA: "Wirausaha", BELUM_BEKERJA: "Belum Bekerja",
    };

    // Sheet 1: Ringkasan
    const ringkasan = [
      ["LAPORAN KETERSERAPAN LULUSAN"],
      ["SMK Bina Bhakti Mekarmukti"],
      ["Tanggal Cetak", new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })],
      [],
      ["RINGKASAN STATISTIK"],
      ["Total Lulusan Terdaftar", data.totalLulusan],
      ["Total Mengisi Tracer Study", data.totalTracerStudy],
      ["Lulusan Bekerja", data.bekerja],
      ["Melanjutkan Kuliah", data.kuliah],
      ["Wirausaha", data.wirausaha],
      ["Belum Bekerja", data.belumBekerja],
      ["Tingkat Keterserapan", `${persen}%`],
      [],
      ["KETERSERAPAN PER JURUSAN"],
      ["Jurusan", "Total Lulusan", "Bekerja", "Kuliah", "Wirausaha", "Tingkat Keterserapan"],
      ...data.perJurusan.map((j: any) => [
        j.jurusan, j.total, j.bekerja, j.kuliah, j.wirausaha,
        j.total > 0 ? `${Math.round((j.bekerja / j.total) * 100)}%` : "0%",
      ]),
    ];

    // Sheet 2: Detail Tracer Study
    const detail = [
      ["No", "Nama Lulusan", "NIS", "Jurusan", "Tahun Lulus", "Status", "Tempat Kerja/Kampus/Usaha", "Jabatan", "Gaji (Rp)", "Lokasi Kerja", "Keterangan"],
      ...tracerList.map((item: any, i: number) => [
        i + 1,
        item.lulusan?.nama || "",
        item.lulusan?.nis || "",
        item.lulusan?.jurusan?.nama || "",
        item.lulusan?.tahunLulus || "",
        statusLabel[item.status] || item.status,
        item.namaPerusahaan || item.namaKampus || item.namaUsaha || "",
        item.jabatan || "",
        item.gaji || "",
        item.lokasiKerja || "",
        item.keterangan || "",
      ]),
    ];

    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.aoa_to_sheet(ringkasan);
    ws1["!cols"] = [{ wch: 35 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws1, "Ringkasan");

    const ws2 = XLSX.utils.aoa_to_sheet(detail);
    ws2["!cols"] = [
      { wch: 5 }, { wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 12 },
      { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 25 },
    ];
    XLSX.utils.book_append_sheet(wb, ws2, "Detail Tracer Study");

    XLSX.writeFile(wb, `laporan_keterserapan_smk_bina_bhakti_${new Date().getFullYear()}.xlsx`);
  }

  function downloadLaporanLulusan() {
    fetch("/api/lulusan").then((r) => r.json()).then((lulusan) => {
      const rows = lulusan.map((l: any, i: number) => ({
        "No": i + 1,
        "NIS": l.nis,
        "Nama": l.nama,
        "Jurusan": l.jurusan?.nama || "",
        "Tahun Lulus": l.tahunLulus,
        "No HP": l.noHp || "",
        "Alamat": l.alamat || "",
        "Status Tracer": l.tracerStudy ? { BEKERJA: "Bekerja", KULIAH: "Kuliah", WIRAUSAHA: "Wirausaha", BELUM_BEKERJA: "Belum Bekerja" }[l.tracerStudy.status as string] || "" : "Belum Isi",
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      ws["!cols"] = [{ wch: 5 }, { wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 15 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data Lulusan");
      XLSX.writeFile(wb, `data_lulusan_smk_bina_bhakti.xlsx`);
    });
  }

  return (
    <div className="space-y-8">
      {/* Tombol Unduh Laporan */}
      <div className="flex flex-wrap gap-3">
        <button onClick={downloadLaporanKeterserapan}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 text-sm font-medium shadow">
          <Download size={16} /> Unduh Laporan Keterserapan
        </button>
        <button onClick={downloadLaporanLulusan}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-medium shadow">
          <Download size={16} /> Unduh Data Lulusan
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Lulusan" value={data.totalLulusan} color="bg-green-700" icon={<Users size={22} />} />
        <StatCard label="Terserap Kerja" value={data.bekerja} color="bg-emerald-600" icon={<Briefcase size={22} />} />
        <StatCard label="Melanjutkan Kuliah" value={data.kuliah} color="bg-teal-600" icon={<GraduationCap size={22} />} />
        <StatCard label="Tingkat Keterserapan" value={`${persen}%`} color="bg-yellow-500" icon={<TrendingUp size={22} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Status Keterserapan Lulusan</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Legend />
              <Tooltip formatter={(value: any) => [`${value} lulusan`]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Keterserapan per Jurusan</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.perJurusan}>
              <XAxis dataKey="jurusan" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bekerja" name="Bekerja" fill="#16a34a" />
              <Bar dataKey="kuliah" name="Kuliah" fill="#10b981" />
              <Bar dataKey="wirausaha" name="Wirausaha" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
