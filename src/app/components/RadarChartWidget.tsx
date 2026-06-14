import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

interface RadarChartData {
  dimension: string;
  value: number;
  fullMark: number;
}

interface RadarChartWidgetProps {
  data: RadarChartData[];
  title?: string;
  description?: string;
}

export function RadarChartWidget({ data, title, description }: RadarChartWidgetProps) {
  return (
    <div className="space-y-4">
      {title && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid key="polar-grid" stroke="hsl(var(--border))" />
            <PolarAngleAxis
              key="polar-angle"
              dataKey="dimension"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
            />
            <PolarRadiusAxis
              key="polar-radius"
              angle={90}
              domain={[0, 'dataMax']}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            <Radar
              key="radar-score"
              name="Score"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.6}
            />
            <Tooltip
              key="tooltip"
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Helper function to prepare radar chart data from assessment scores
export function prepareRadarData(scores: Record<string, number>, maxScore: number = 100): RadarChartData[] {
  return Object.entries(scores).map(([key, value]) => ({
    dimension: key.charAt(0).toUpperCase() + key.slice(1),
    value: value,
    fullMark: maxScore
  }));
}

// Specific helper for Kolb Learning Styles
export function prepareKolbRadarData(scores: { CE: number; RO: number; AC: number; AE: number }): RadarChartData[] {
  return [
    { dimension: 'Concrete Experience', value: scores.CE, fullMark: 15 },
    { dimension: 'Reflective Observation', value: scores.RO, fullMark: 15 },
    { dimension: 'Abstract Conceptualization', value: scores.AC, fullMark: 15 },
    { dimension: 'Active Experimentation', value: scores.AE, fullMark: 15 },
  ];
}

// Specific helper for Sternberg Thinking Styles
export function prepareSternbergRadarData(scores: { analytical: number; creative: number; practical: number }): RadarChartData[] {
  return [
    { dimension: 'Analytical', value: scores.analytical, fullMark: 20 },
    { dimension: 'Creative', value: scores.creative, fullMark: 20 },
    { dimension: 'Practical', value: scores.practical, fullMark: 20 },
  ];
}

// Specific helper for Dual-Process (Intuitive vs Reflective)
export function prepareDualProcessRadarData(scores: { system1: number; system2: number }): RadarChartData[] {
  return [
    { dimension: 'Intuitive', value: scores.system1, fullMark: 30 },
    { dimension: 'Reflective', value: scores.system2, fullMark: 30 },
  ];
}
