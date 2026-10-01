"use client";
import { useEffect, useState } from "react";
import { Briefcase, MapPin, DollarSign, Calendar, Phone } from "lucide-react";

export default function LowonganLulusanClient({ userJurusanId }: { userJurusanId?: string }) {
  const [lowongan, setLowongan] = useState<any[]>([]);
  const [kontakModal, setKontakModal] = useState<any | null>(null);

  async function load() {
    const l = await fetch("/api/lowongan").then((r) => r.json());
    let filtered = l;
    if (userJurusanId) {
      filtered = l.filter((job: any) => !job.jurusanId || job.jurusanId === userJurusanId);
    }
    setLowongan(filtered);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      {lowongan.length === 0 && (
        <div className="text-center py-12 text-gray-400">Belum ada lowongan tersedia</div>
      )}
      {lowongan.map((item) => (
        <div key={item.id} className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-800">{item.judul}</h2>
              <p className="text-blue-700 font-medium">{item.perusahaan?.nama}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                {item.perusahaan?.kota && (
                  <span className="flex items-center gap-1"><MapPin size={14} />{item.perusahaan.kota}</span>
                )}
                {item.gaji && (
                  <span className="flex items-center gap-1"><DollarSign size={14} />{item.gaji}</span>
                )}
                {item.deadline && (
                  <span className="flex items-center gap-1"><Calendar size={14} />Deadline: {new Date(item.deadline).toLocaleDateString("id-ID")}</span>
                )}
                {item.jurusan && (
                  <span className="flex items-center gap-1"><Briefcase size={14} />{item.jurusan.nama}</span>
                )}
              </div>
              <p className="mt-3 text-sm text-gray-600">{item.deskripsi}</p>
              {item.persyaratan && (
                <p className="mt-2 text-sm text-gray-500"><span className="font-medium">Persyaratan:</span> {item.persyaratan}</p>
              )}
            </div>
            <div className="ml-4">
              <button
                onClick={() => setKontakModal(item.perusahaan)}
                className="flex items-center gap-1 bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800"
              >
                <Phone size={14} /> Hubungi Perusahaan
              </button>
            </div>
          </div>
        </div>
      ))}

      {kontakModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="font-bold text-lg">Kontak Perusahaan</h2>
              <button onClick={() => setKontakModal(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm">
              <p className="font-semibold text-gray-800 text-base">{kontakModal.nama}</p>
              {kontakModal.telepon && (
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-green-700" />
                  <a href={`tel:${kontakModal.telepon}`} className="text-green-700 hover:underline">{kontakModal.telepon}</a>
                  <a href={`https://wa.me/62${kontakModal.telepon.replace(/^0/, "")}`} target="_blank" rel="noopener noreferrer"
                    className="ml-auto bg-green-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-600">WhatsApp</a>
                </div>
              )}
              {kontakModal.website && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Website:</span>
                  <a href={kontakModal.website.startsWith("http") ? kontakModal.website : `https://${kontakModal.website}`}
                    target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{kontakModal.website}</a>
                </div>
              )}
              {kontakModal.alamat && <p className="text-gray-500"><span className="font-medium">Alamat:</span> {kontakModal.alamat}</p>}
              {kontakModal.kota && <p className="text-gray-500"><span className="font-medium">Kota:</span> {kontakModal.kota}</p>}
            </div>
            <div className="px-6 py-4 border-t">
              <button onClick={() => setKontakModal(null)} className="w-full border py-2 rounded-lg hover:bg-gray-50 text-sm">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
