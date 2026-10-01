"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import StatCard from "@/components/StatCard";
import { Users, Building2, Briefcase, FileText } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function SuperAdminDashboardClient() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <div className="text-gray-500">Memuat data...</div>;

  const pieData = [
    { name: "Bekerja", value: data.bekerja },
    { name: "Kuliah", value: data.kuliah },
    { name: "Wirausaha", value: data.wirausaha },
    { name: "Belum Bekerja", value: data.belumBekerja },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Lulusan" value={data.totalLulusan} color="bg-green-700" icon={<Users size={22} />} />
        <StatCard label="Tracer Study" value={data.totalTracerStudy} color="bg-emerald-600" icon={<FileText size={22} />} />
        <StatCard label="Perusahaan" value={data.totalPerusahaan} color="bg-yellow-500" icon={<Building2 size={22} />} />
        <StatCard label="Lowongan Aktif" value={data.totalLowongan} color="bg-teal-600" icon={<Briefcase size={22} />} />
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
              <XAxis dataKey="jurusan" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bekerja" name="Bekerja" fill="#3b82f6" />
              <Bar dataKey="kuliah" name="Kuliah" fill="#10b981" />
              <Bar dataKey="wirausaha" name="Wirausaha" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
