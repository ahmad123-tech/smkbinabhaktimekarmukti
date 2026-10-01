"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Save } from "lucide-react";

export default function PengaturanClient() {
    const [form, setForm] = useState({ alamat: "", email: "", whatsapp: "", telepon: "" });
    const [originalForm, setOriginalForm] = useState({ alamat: "", email: "", whatsapp: "", telepon: "" });
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetch("/api/pengaturan").then((r) => r.json()).then((d) => {
            const data = {
                alamat: d.alamat || "", email: d.email || "", whatsapp: d.whatsapp || "", telepon: d.telepon || ""
            };
            setForm(data);
            setOriginalForm(data);
        });
    }, []);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const res = await fetch("/api/pengaturan", {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });
        setLoading(false);
        if (res.ok) {
            toast.success("Kontak BKK berhasil diperbarui");
            setOriginalForm(form);
            setIsEditing(false);
        } else {
            toast.error("Gagal menyimpan");
        }
    }

    return (
        <div className="bg-white rounded-xl shadow p-6 max-w-2xl">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">Pengaturan Kontak BKK</h2>
                {!isEditing && (
                    <button type="button" onClick={() => setIsEditing(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center gap-2">
                        Edit Pengaturan
                    </button>
                )}
            </div>
            <p className="text-sm text-gray-500 mb-6">Informasi kontak ini akan ditampilkan di halaman utama (Landing Page) agar alumni atau mitra perusahaan mudah menghubungi BKK.</p>

            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Resmi BKK</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                        disabled={!isEditing}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500" placeholder="bkk@smkbinabhakti.sch.id" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No WhatsApp (Gunakan 62, cth: 62812...)</label>
                    <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                        disabled={!isEditing}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500" placeholder="628123456789" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telepon Kantor</label>
                    <input value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                        disabled={!isEditing}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500" placeholder="022-1234567" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Kantor BKK</label>
                    <textarea rows={3} value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                        disabled={!isEditing}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500" placeholder="Jl. Contoh..." />
                </div>

                {isEditing && (
                    <div className="flex items-center gap-3 pt-2">
                        <button type="submit" disabled={loading}
                            className="flex items-center gap-2 bg-green-700 text-white px-5 py-2 rounded-lg hover:bg-green-800 font-medium disabled:opacity-60 text-sm">
                            <Save size={16} /> {loading ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                        <button type="button" disabled={loading} onClick={() => { setForm(originalForm); setIsEditing(false); }}
                            className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 font-medium text-sm transition">
                            Batal
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
