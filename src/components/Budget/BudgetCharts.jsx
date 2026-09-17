import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import Card, { CardHeader } from '../shared/Card'
import { formatMoney } from '../../utils/budget'

function CategoryPie({ title, subtitle, data }) {
  const rows = (data || []).filter((row) => row.amount > 0)
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">Пока нет расходов в этом срезе</p>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={rows} dataKey="amount" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={3}>
                {rows.map((row) => (
                  <Cell key={row.category} fill={row.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [formatMoney(value), name]}
                contentStyle={{
                  borderRadius: 16,
                  border: 'none',
                  boxShadow: '0 12px 40px rgba(15,23,42,0.12)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {rows.map((row) => (
          <span key={row.category} className="chip bg-slate-100 text-[11px] dark:bg-white/[0.06]">
            <span className="h-2 w-2 rounded-full" style={{ background: row.color }} />
            {row.icon} {row.name}
          </span>
        ))}
      </div>
    </Card>
  )
}

export default function BudgetCharts({ his, hers }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <CategoryPie title="Его расходы" subtitle="По категориям, кто платил — он" data={his} />
      <CategoryPie title="Её расходы" subtitle="По категориям, кто платил — она" data={hers} />
    </div>
  )
}
