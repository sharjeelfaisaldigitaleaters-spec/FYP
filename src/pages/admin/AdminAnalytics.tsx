import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const monthlyData = [
  { month: "Jan", memories: 45, users: 12, conversations: 189 },
  { month: "Feb", memories: 62, users: 19, conversations: 245 },
  { month: "Mar", memories: 78, users: 24, conversations: 312 },
  { month: "Apr", memories: 54, users: 17, conversations: 198 },
  { month: "May", memories: 91, users: 31, conversations: 402 },
  { month: "Jun", memories: 110, users: 38, conversations: 487 },
  { month: "Jul", memories: 134, users: 47, conversations: 561 },
];

const memoryTypeData = [
  { name: "Audio", value: 45, color: "#7c3aed" },
  { name: "Photos", value: 32, color: "#3b82f6" },
  { name: "Written", value: 23, color: "#10b981" },
];

const featureData = [
  { feature: "Conversations", usage: 89 },
  { feature: "Story Library", usage: 74 },
  { feature: "Family Sharing", usage: 61 },
  { feature: "Upload", usage: 95 },
  { feature: "Settings", usage: 43 },
];

const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function AdminAnalytics() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white mb-1">Analytics</h1>
        <p className="text-slate-400">Platform performance and usage insights.</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: "Total Memories", value: "6", change: "+22% vs last month" },
          { label: "Monthly Active Users", value: "3", change: "+14% vs last month" },
          { label: "Avg. Session Time", value: "18 min", change: "+8% vs last month" },
          { label: "Retention Rate", value: "78%", change: "+3% vs last month" },
        ].map((k) => (
          <div key={k.label} className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
            <p className="text-2xl font-bold text-white mb-1">{k.value}</p>
            <p className="text-sm text-slate-400 mb-2">{k.label}</p>
            <p className="text-xs text-emerald-400">{k.change}</p>
          </div>
        ))}
      </div>

      {/* Growth chart */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <h2 className="text-white font-semibold mb-6">Platform Growth (7 Months)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" stroke="#475569" tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", color: "#f8fafc" }} />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
            <Bar dataKey="memories" fill="#7c3aed" name="Memories" radius={[4, 4, 0, 0]} />
            <Bar dataKey="conversations" fill="#10b981" name="Conversations" radius={[4, 4, 0, 0]} />
            <Bar dataKey="users" fill="#3b82f6" name="New Users" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Memory type breakdown */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h2 className="text-white font-semibold mb-6">Memory Type Breakdown</h2>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width="60%" height={220}>
              <PieChart>
                <Pie data={memoryTypeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" labelLine={false} label={renderLabel}>
                  {memoryTypeData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", color: "#f8fafc" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {memoryTypeData.map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-sm text-slate-400">{d.name}</span>
                  <span className="text-sm font-medium text-slate-200 ml-auto">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature usage */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h2 className="text-white font-semibold mb-6">Feature Usage Rate</h2>
          <div className="space-y-4">
            {featureData.map((f) => (
              <div key={f.feature}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-400">{f.feature}</span>
                  <span className="text-slate-300 font-medium">{f.usage}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-500 transition-all duration-1000"
                    style={{ width: `${f.usage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
