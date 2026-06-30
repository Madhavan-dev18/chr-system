'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface VitalsChartProps {
  data: Array<{
    recordedAt: string | Date;
    bpSystolic?: number | null;
    bpDiastolic?: number | null;
    heartRate?: number | null;
  }>;
}

export function VitalsChart({ data }: VitalsChartProps) {
  // Sort data chronologically and format for Recharts
  const chartData = [...data]
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .map((v: any) => ({
      date: new Date(v.recordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      Systolic: v.bpSystolic,
      Diastolic: v.bpDiastolic,
      HeartRate: v.heartRate,
    }));

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center rounded-3xl" style={{ background: '#EEF0F5', boxShadow: 'inset 6px 6px 12px #C8CAD4, inset -6px -6px 12px #FFFFFF' }}>
        <p className="text-[#9898B8] font-medium">No vitals data available to chart.</p>
      </div>
    );
  }

  return (
    <div className="h-80 w-full p-4 rounded-3xl" style={{ background: '#EEF0F5', boxShadow: 'inset 6px 6px 12px #C8CAD4, inset -6px -6px 12px #FFFFFF' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#C8CAD4" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9898B8', fontSize: 12, fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9898B8', fontSize: 12, fontWeight: 600 }}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF',
              background: '#EEF0F5'
            }}
            itemStyle={{ fontWeight: 'bold' }}
            labelStyle={{ color: '#5A5A7A', fontWeight: 'bold', marginBottom: '8px' }}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
          
          <Line 
            type="monotone" 
            dataKey="Systolic" 
            stroke="#E84545" 
            strokeWidth={3} 
            dot={{ fill: '#E84545', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }} 
          />
          <Line 
            type="monotone" 
            dataKey="Diastolic" 
            stroke="#4A90D9" 
            strokeWidth={3} 
            dot={{ fill: '#4A90D9', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }} 
          />
          <Line 
            type="monotone" 
            dataKey="HeartRate" 
            stroke="#F39C12" 
            strokeWidth={3} 
            dot={{ fill: '#F39C12', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
