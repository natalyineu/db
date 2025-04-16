import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { ChartData } from 'chart.js';

interface KpiData {
  id: string;
  campaign_id: string;
  date: string;
  impressions: number;
  impressions_plan: number;
  clicks: number;
  clicks_plan: number;
  reach: number;
  reach_plan: number;
  created_at: string;
}

interface ChartSectionProps {
  kpiData: KpiData[];
}

const ChartSection = ({ kpiData }: ChartSectionProps) => {
  // Process chart data when kpiData changes
  const chartData: ChartData<'line'> = useMemo(() => {
    // If there's no data, return empty chart data
    if (kpiData.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Sort data by date
    const sortedData = [...kpiData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Extract the dates for the x-axis
    const labels = sortedData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    // Create datasets for impressions, clicks, and reach
    return {
      labels,
      datasets: [
        {
          label: 'Impressions',
          data: sortedData.map(item => item.impressions),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Clicks',
          data: sortedData.map(item => item.clicks),
          borderColor: 'rgb(14, 165, 233)',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Reach',
          data: sortedData.map(item => item.reach),
          borderColor: 'rgb(249, 115, 22)',
          backgroundColor: 'rgba(249, 115, 22, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }, [kpiData]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <h2 className="text-xl font-semibold mb-6">Performance Trend</h2>
      {kpiData.length > 0 ? (
        <div className="h-64">
          <Line 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }} 
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500">No data available yet</p>
        </div>
      )}
    </div>
  );
};

export default ChartSection; 