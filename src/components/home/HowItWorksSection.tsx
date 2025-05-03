export default function HowItWorksSection() {
  return (
    <>
      {/* How it works section */}
      <div className="mt-20 text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">How AI-Vertise Works</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">Our seamless three-step process takes the complexity out of advertising</p>
      </div>
      
      {/* Process steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {[
          {
            title: '1. Brief',
            description: 'Tell us about your business goals, target audience, and budget in our simple form',
            icon: (
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4V11H11V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 4H13V11H20V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11 13H4V20H11V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 13H13V20H20V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )
          },
          {
            title: '2. We Run',
            description: 'Our AI technology creates assets, optimizes bidding, and launches your campaign',
            icon: (
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 12H4M12 3V4M20 12H21M12 20V21M18.364 5.63604L17.6569 6.34315M5.63604 5.63604L6.34315 6.34315M6.34315 17.6569L5.63604 18.364M17.6569 17.6569L18.364 18.364" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )
          },
          {
            title: '3. Results',
            description: 'Get detailed reports and AI-powered recommendations to improve performance',
            icon: (
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 8V16M12 11V16M8 14V16M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )
          }
        ].map((step, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all group">
            <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-6 group-hover:bg-indigo-100 transition-colors">
              {step.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
            <p className="text-gray-600">{step.description}</p>
          </div>
        ))}
      </div>
    </>
  );
} 