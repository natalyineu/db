interface MetricsCardsProps {
  impressions: number;
  impressions_plan: number;
  clicks: number;
  reach: number;
  deltaImpressions: number;
  deltaClicks: number;
  deltaReach: number;
}

const MetricsCards = ({
  impressions,
  impressions_plan,
  clicks,
  reach,
  deltaImpressions,
  deltaClicks,
  deltaReach
}: MetricsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
      {/* Impressions Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">IMPRESSIONS</h2>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold">{impressions.toLocaleString()}</span>
          {deltaImpressions !== 0 && (
            <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
              deltaImpressions > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {deltaImpressions > 0 ? '+' : ''}{deltaImpressions.toFixed(1)}%
            </span>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          <div className="flex justify-between mb-1">
            <span>Plan:</span>
            <span className="font-medium">{impressions_plan.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Actual:</span>
            <span className="font-medium">{impressions.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Clicks Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">CLICKS</h2>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold">{clicks.toLocaleString()}</span>
          {deltaClicks !== 0 && (
            <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
              deltaClicks > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {deltaClicks > 0 ? '+' : ''}{deltaClicks.toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Reach Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">REACH</h2>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold">{reach.toLocaleString()}</span>
          {deltaReach !== 0 && (
            <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
              deltaReach > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {deltaReach > 0 ? '+' : ''}{deltaReach.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricsCards; 