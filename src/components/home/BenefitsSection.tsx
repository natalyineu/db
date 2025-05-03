export default function BenefitsSection() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8 md:p-12 mb-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose AI-Vertise</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">All the benefits of a professional marketing team, without the complexity</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'No Technical Skills Required',
            description: 'Just answer simple questions about your business'
          },
          {
            title: 'AI-Powered Creation',
            description: 'Automatically generate high-converting ad creative'
          },
          {
            title: 'Continuous Optimization',
            description: 'Our AI constantly improves your campaigns'
          },
          {
            title: 'Transparent Reporting',
            description: 'Clear insights on performance and ROI'
          }
        ].map((benefit, index) => (
          <div key={index} className="p-6 rounded-xl border border-gray-100 bg-gray-50 hover:bg-indigo-50 transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
            <p className="text-gray-600">{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 