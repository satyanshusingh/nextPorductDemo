import { getPieSlices } from '../chartData.js';

const chartColors = [
  '#4f46e5',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#f97316',
  '#ec4899',
  '#8b5cf6',
  '#64748b',
];

export default function ChartView({ groups, emptyMessage = 'No data available to chart.' }) {
  const hasData = groups.some(group => group.items.some(item => item.value > 0));

  if (!hasData) {
    return <p className="chart-empty">{emptyMessage}</p>;
  }

  return (
    <div className="data-chart-view">
      {groups.map(group => {
        const slices = getPieSlices(group.items);
        if (!slices.length) return null;

        const total = slices.reduce((sum, item) => sum + item.value, 0);
        const pie = `conic-gradient(${slices.map((slice, index) =>
          `${chartColors[index % chartColors.length]} ${slice.start}% ${slice.end}%`
        ).join(', ')})`;

        return (
          <section className="data-chart-group" key={group.title}>
            <h3>{group.title}</h3>
            <div className="data-chart-content">
              <div
                className="data-chart-pie"
                role="img"
                aria-label={`${group.title}: ${slices.map(item => `${item.label} ${item.value}`).join(', ')}`}
                style={{ background: pie }}
              >
                <div className="data-chart-pie-center">
                  <strong>{total}</strong>
                  <span>Total</span>
                </div>
              </div>
              <div className="data-chart-rows" aria-label={`${group.title} breakdown`}>
                {slices.map((item, index) => {
                  const color = chartColors[index % chartColors.length];
                  return (
                    <div className="data-chart-row" key={item.label}>
                      <div className="data-chart-row-heading">
                        <span className="data-chart-swatch" style={{ backgroundColor: color }} />
                        <span className="data-chart-label" title={item.label}>{item.label}</span>
                      </div>
                      <div className="data-chart-row-value">
                        <span>{Math.round(item.percentage)}%</span>
                        <strong>{item.value}</strong>
                      </div>
                      <div className="data-chart-track">
                        <span style={{ width: `${item.percentage}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
