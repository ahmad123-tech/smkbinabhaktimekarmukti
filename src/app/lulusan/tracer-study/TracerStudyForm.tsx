"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/ConfirmDialog";

const emptyForm = {
  status: "BEKERJA",
  // Pekerjaan
  pernahMelamar: "", jenisPekerjaan: "",
  namaPerusahaan: "", alamatInstansi: "", jabatan: "",
  deskripsiPekerjaan: "", masaKerja: "", mulaiKerja: "",
  sesuaiKeahlian: "", masaTunggu: "", gaji: "",
  lokasiKerja: "", latitude: "", longitude: "",
  // Kuliah
  namaKampus: "", alamatUniversitas: "", jurusanStudi: "", bulanTahunStudi: "",
  // Wirausaha
  namaUsaha: "",
  keterangan: "",
};

const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";
const sectionTitle = "text-sm font-bold text-gray-800 mb-3";
const fieldLabel = "block text-sm font-medium text-gray-600 mb-1";

export default function TracerStudyForm() {
  const [form, setForm] = useState(emptyForm);
  const [existing, setExisting] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [confirm, setConfirm] = useState<"save" | "cancel" | null>(null);

  async function loadData() {
    const data = await fetch("/api/tracer-study/me").then((r) => r.json()).catch(() => ({}));
    if (data && data.status) {
      setExisting(data);
      setForm({
        status: data.status || "BEKERJA",
        pernahMelamar: data.pernahMelamar || "",
        jenisPekerjaan: data.jenisPekerjaan || "",
        namaPerusahaan: data.namaPerusahaan || "",
        alamatInstansi: data.alamatInstansi || "",
        jabatan: data.jabatan || "",
        deskripsiPekerjaan: data.deskripsiPekerjaan || "",
        masaKerja: data.masaKerja || "",
        mulaiKerja: data.mulaiKerja || "",
        sesuaiKeahlian: data.sesuaiKeahlian || "",
        masaTunggu: data.masaTunggu || "",
        gaji: data.gaji || "",
        lokasiKerja: data.lokasiKerja || "",
        latitude: data.latitude || "",
        longitude: data.longitude || "",
        namaKampus: data.namaKampus || "",
        alamatUniversitas: data.alamatUniversitas || "",
        jurusanStudi: data.jurusanStudi || "",
        bulanTahunStudi: data.bulanTahunStudi || "",
        namaUsaha: data.namaUsaha || "",
        keterangan: data.keterangan || "",
      });
    }
  }

  useEffect(() => { loadData(); }, []);

  function set(key: string, val: string) { setForm((f) => ({ ...f, [key]: val })); }

  function getLocation() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { set("latitude", String(pos.coords.latitude)); set("longitude", String(pos.coords.longitude)); setLocating(false); toast.success("Lokasi didapatkan"); },
      () => { setLocating(false); toast.error("Gagal mendapatkan lokasi"); }
    );
  }

  async function doSave() {
    setConfirm(null); setLoading(true);
    const res = await fetch("/api/tracer-study", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) { toast.success(existing ? "Tracer study diperbarui" : "Tracer study disimpan"); setIsEdit(false); loadData(); }
    else {
      const err = await res.json().catch(() => ({}));
      toast.error(err?.error || `Gagal menyimpan (${res.status})`);
      console.error("TracerStudy save error:", err);
    }
  }

  function handleSubmit(e: React.FormEvent) { e.preventDefault(); setConfirm("save"); }

  const statusLabel: Record<string, string> = { BEKERJA: "Bekerja", KULIAH: "Melanjutkan Kuliah", WIRAUSAHA: "Wirausaha", BELUM_BEKERJA: "Belum Bekerja" };
  const statusColor: Record<string, string> = { BEKERJA: "bg-blue-100 text-blue-700", KULIAH: "bg-green-100 text-green-700", WIRAUSAHA: "bg-yellow-100 text-yellow-700", BELUM_BEKERJA: "bg-red-100 text-red-700" };

  // View mode
  if (existing && !isEdit) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-semibold text-gray-700">Data Tracer Study Anda</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[existing.status]}`}>{statusLabel[existing.status]}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {existing.status === "BEKERJA" && (<>
              <div><p className="text-gray-400 text-xs">Nama Instansi</p><p className="font-medium">{existing.namaPerusahaan || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Alamat Instansi</p><p className="font-medium">{existing.alamatInstansi || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Jabatan</p><p className="font-medium">{existing.jabatan || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Jenis Pekerjaan</p><p className="font-medium">{existing.jenisPekerjaan || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Masa Kerja</p><p className="font-medium">{existing.masaKerja || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Mulai Kerja</p><p className="font-medium">{existing.mulaiKerja || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Sesuai Keahlian</p><p className="font-medium">{existing.sesuaiKeahlian || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Masa Tunggu</p><p className="font-medium">{existing.masaTunggu || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Besar Gaji</p><p className="font-medium">{existing.gaji || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Lokasi Kerja</p><p className="font-medium">{existing.lokasiKerja || "-"}</p></div>
            </>)}
            {existing.status === "KULIAH" && (<>
              <div><p className="text-gray-400 text-xs">Nama Universitas</p><p className="font-medium">{existing.namaKampus || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Alamat Universitas</p><p className="font-medium">{existing.alamatUniversitas || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Jurusan/Program Studi</p><p className="font-medium">{existing.jurusanStudi || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Bulan & Tahun Awal Studi</p><p className="font-medium">{existing.bulanTahunStudi || "-"}</p></div>
            </>)}
            {existing.status === "WIRAUSAHA" && (
              <div><p className="text-gray-400 text-xs">Nama Usaha</p><p className="font-medium">{existing.namaUsaha || "-"}</p></div>
            )}
            {existing.keterangan && <div className="col-span-2"><p className="text-gray-400 text-xs">Keterangan</p><p className="font-medium">{existing.keterangan}</p></div>}
            <div className="col-span-2 text-xs text-gray-400 pt-2 border-t">Terakhir diperbarui: {new Date(existing.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
          </div>
          <button onClick={() => setIsEdit(true)} className="mt-5 w-full bg-green-700 text-white py-2.5 rounded-lg hover:bg-green-800 font-medium text-sm">✏️ Perbarui Tracer Study</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow p-6 space-y-7">

          {/* 1. Status */}
          <div>
            <p className={sectionTitle}>Status Setelah Lulus <span className="text-red-500">*</span></p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: "BEKERJA", label: "Bekerja" },
                { value: "KULIAH", label: "Melanjutkan Kuliah" },
                { value: "WIRAUSAHA", label: "Wirausaha" },
                { value: "BELUM_BEKERJA", label: "Belum Bekerja" },
              ].map((o) => (
                <label key={o.value} className={`flex items-center gap-2 border rounded-lg px-4 py-2.5 cursor-pointer text-sm transition ${form.status === o.value ? "border-green-600 bg-green-50 text-green-700 font-semibold" : "border-gray-200 hover:border-green-400"}`}>
                  <input type="radio" name="status" value={o.value} checked={form.status === o.value} onChange={() => set("status", o.value)} className="accent-green-600" />
                  {o.label}
                </label>
              ))}
            </div>
          </div>

          {/* 2. Data Pekerjaan */}
          {form.status === "BEKERJA" && (
            <div className="space-y-5">
              <p className={sectionTitle}>Data Pekerjaan</p>

              {/* a. Pernah melamar */}
              <div>
                <label className={fieldLabel}>a. Pernah melamar pekerjaan</label>
                <div className="flex gap-6">
                  {[{ v: "ya", l: "Ya, pernah" }, { v: "belum", l: "Belum pernah" }].map(({ v, l }) => (
                    <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="pernahMelamar" value={v} checked={form.pernahMelamar === v} onChange={() => set("pernahMelamar", v)} className="accent-green-600" /> {l}
                    </label>
                  ))}
                </div>
              </div>

              {/* b. Jenis Pekerjaan */}
              <div>
                <label className={fieldLabel}>b. Jenis Pekerjaan</label>
                <div className="flex gap-6">
                  {["PNS", "Swasta", "Wiraswasta"].map((j) => (
                    <label key={j} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="jenisPekerjaan" value={j} checked={form.jenisPekerjaan === j} onChange={() => set("jenisPekerjaan", j)} className="accent-green-600" /> {j}
                    </label>
                  ))}
                </div>
              </div>

              {/* Fields pekerjaan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Nama Instansi", key: "namaPerusahaan" },
                  { label: "Alamat Instansi", key: "alamatInstansi" },
                  { label: "Jabatan", key: "jabatan" },
                  { label: "Deskripsi Pekerjaan", key: "deskripsiPekerjaan" },
                  { label: "Masa Kerja", key: "masaKerja", placeholder: "Contoh: 1 tahun 2 bulan" },
                  { label: "Mulai Kerja", key: "mulaiKerja", placeholder: "Contoh: Januari 2024" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className={fieldLabel}>{label}</label>
                    <input value={(form as any)[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} className={inp} />
                  </div>
                ))}
              </div>

              {/* c. Sesuai Keahlian */}
              <div>
                <label className={fieldLabel}>c. Sesuai Keahlian</label>
                <div className="flex gap-6">
                  {["Sesuai", "Tidak"].map((v) => (
                    <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="sesuaiKeahlian" value={v} checked={form.sesuaiKeahlian === v} onChange={() => set("sesuaiKeahlian", v)} className="accent-green-600" /> {v}
                    </label>
                  ))}
                </div>
              </div>

              {/* d. Masa Tunggu */}
              <div>
                <label className={fieldLabel}>d. Masa Tunggu</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {["Kurang dari 6 bulan", "Antara 6-12 bulan", "Lebih dari 12 bulan"].map((v) => (
                    <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="masaTunggu" value={v} checked={form.masaTunggu === v} onChange={() => set("masaTunggu", v)} className="accent-green-600" /> {v}
                    </label>
                  ))}
                </div>
              </div>

              {/* e. Besar Gaji */}
              <div>
                <label className={fieldLabel}>e. Besar Gaji</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {["Kurang dari 500.000", "Antara 500.000 – 1.000.000", "Antara 1.000.000 – 1.500.000", "Antara 1.500.000 – 2.000.000", "Diatas 2.000.000"].map((v) => (
                    <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="gaji" value={v} checked={form.gaji === v} onChange={() => set("gaji", v)} className="accent-green-600" /> {v}
                    </label>
                  ))}
                </div>
              </div>

              {/* Lokasi & Koordinat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={fieldLabel}>Lokasi Kerja (Kota/Kabupaten)</label>
                  <input value={form.lokasiKerja} onChange={(e) => set("lokasiKerja", e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={fieldLabel}>Koordinat Lokasi</label>
                  <div className="flex gap-2 items-center">
                    <input value={form.latitude} onChange={(e) => set("latitude", e.target.value)} placeholder="Latitude" className={inp} />
                    <input value={form.longitude} onChange={(e) => set("longitude", e.target.value)} placeholder="Longitude" className={inp} />
                    <button type="button" onClick={getLocation} disabled={locating}
                      className="text-xs whitespace-nowrap text-green-700 hover:underline disabled:opacity-50 px-1">
                      {locating ? "..." : "📍"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Data Kuliah */}
          {form.status === "KULIAH" && (
            <div className="space-y-4">
              <p className={sectionTitle}>Data Bagi Lulusan yang Melanjutkan Studi</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "a. Nama Universitas", key: "namaKampus" },
                  { label: "b. Alamat Universitas", key: "alamatUniversitas" },
                  { label: "c. Jurusan / Program Studi", key: "jurusanStudi" },
                  { label: "d. Bulan dan Tahun Awal Studi", key: "bulanTahunStudi", placeholder: "Contoh: September 2023" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className={fieldLabel}>{label}</label>
                    <input value={(form as any)[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} className={inp} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Wirausaha */}
          {form.status === "WIRAUSAHA" && (
            <div className="space-y-4">
              <p className={sectionTitle}>Data Wirausaha</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={fieldLabel}>Nama Usaha</label>
                  <input value={form.namaUsaha} onChange={(e) => set("namaUsaha", e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={fieldLabel}>Lokasi Usaha</label>
                  <input value={form.lokasiKerja} onChange={(e) => set("lokasiKerja", e.target.value)} className={inp} />
                </div>
              </div>
            </div>
          )}

          {/* Keterangan */}
          <div>
            <label className={fieldLabel}>Keterangan Tambahan</label>
            <textarea value={form.keterangan} onChange={(e) => set("keterangan", e.target.value)}
              rows={3} className={inp} />
          </div>

          {/* Tombol */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-green-700 text-white py-2.5 rounded-lg hover:bg-green-800 font-semibold disabled:opacity-60 text-sm">
              {loading ? "Menyimpan..." : existing ? "Perbarui Tracer Study" : "Simpan Tracer Study"}
            </button>
            {existing && (
              <button type="button" onClick={() => setConfirm("cancel")}
                className="px-6 border border-gray-300 py-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-600">
                Batal
              </button>
            )}
          </div>
        </div>
      </form>

      <ConfirmDialog open={confirm === "save"} title={existing ? "Konfirmasi Perbarui" : "Konfirmasi Simpan"}
        message={existing ? "Apakah Anda yakin ingin memperbarui data tracer study?" : "Apakah Anda yakin ingin menyimpan data tracer study ini?"}
        confirmLabel="Ya, Simpan" onConfirm={doSave} onCancel={() => setConfirm(null)} />
      <ConfirmDialog open={confirm === "cancel"} title="Batalkan Perubahan?"
        message="Data yang sudah diisi akan hilang."
        confirmLabel="Ya, Batalkan" confirmColor="bg-red-600 hover:bg-red-700"
        onConfirm={() => { setConfirm(null); setIsEdit(false); }} onCancel={() => setConfirm(null)} />
    </div>
  );
}
