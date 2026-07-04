import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const data = [
  { name: "Mon", present: 86, absent: 6, late: 5, halfDay: 3 },
  { name: "Tue", present: 88, absent: 5, late: 4, halfDay: 3 },
  { name: "Wed", present: 92, absent: 3, late: 3, halfDay: 2 },
  { name: "Thu", present: 89, absent: 4, late: 5, halfDay: 2 },
  { name: "Fri", present: 94, absent: 2, late: 2, halfDay: 2 },
]

interface AttendanceChartProps {
  height?: number
}

export function AttendanceChart({ height = 300 }: AttendanceChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: 12 }} />
          <Line type="monotone" dataKey="present" stroke="#34d399" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="late" stroke="#f97316" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="halfDay" stroke="#818cf8" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
