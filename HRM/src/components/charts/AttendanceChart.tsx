import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { name: "Mon", present: 86 },
  { name: "Tue", present: 88 },
  { name: "Wed", present: 92 },
  { name: "Thu", present: 89 },
  { name: "Fri", present: 94 },
]

interface AttendanceChartProps {
  height?: number
}

export function AttendanceChart({ height = 300 }: AttendanceChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="name" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
          <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: "rgba(148,163,184,0.08)" }} />
          <Bar dataKey="present" fill="#2563eb" radius={[12, 12, 0, 0]} barSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
