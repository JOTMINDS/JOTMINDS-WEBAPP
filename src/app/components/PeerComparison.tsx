import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Users } from 'lucide-react';

interface PeerComparisonData {
  trait: string;
  yourScore: number;
  average: number;
}

interface PeerComparisonProps {
  data: PeerComparisonData[];
  title?: string;
}

export function PeerComparison({ data, title = "How You Compare to Other Students" }: PeerComparisonProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      </div>
      
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid key="grid" strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              key="x-axis"
              dataKey="trait"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
            />
            <YAxis
              key="y-axis"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
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
            <Legend
              key="legend"
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px'
              }}
            />
            <Bar
              key="bar-your-score"
              dataKey="yourScore"
              name="Your Score"
              fill="hsl(var(--primary))"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              key="bar-average"
              dataKey="average"
              name="Average"
              fill="#60a5fa"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Contextual insight */}
      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>What this means:</strong> This comparison shows how your scores relate to typical student averages. 
          Higher scores indicate stronger tendencies in that area.
        </p>
      </div>
    </div>
  );
}

// Helper to generate peer comparison data from scores
export function generatePeerComparisonData(
  userScores: Record<string, number>,
  averages: Record<string, number>
): PeerComparisonData[] {
  return Object.keys(userScores).map(trait => ({
    trait: trait.charAt(0).toUpperCase() + trait.slice(1),
    yourScore: userScores[trait],
    average: averages[trait]
  }));
}

// Default averages for different assessment types (based on research)
export const defaultAverages = {
  kolb: {
    CE: 9,
    RO: 9,
    AC: 9,
    AE: 9
  },
  sternberg: {
    analytical: 12,
    creative: 12,
    practical: 12
  },
  dualProcess: {
    Intuitive: 18,
    Reflective: 18
  }
};
