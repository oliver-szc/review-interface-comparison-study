export function DashboardPlaceholder() {
  return (
    <div className="w-full h-96 bg-slate-100 border border-slate-300 rounded-lg flex flex-col items-center justify-center p-6 text-center text-slate-500 shadow-inner">
      <svg className="w-16 h-16 mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <h3 className="text-lg font-semibold text-slate-700">Interactive Data Dashboard</h3>
      <p className="mt-2 text-sm max-w-sm">
        [Placeholder: The interactive dashboard interface will be embedded here for the actual study, containing visualizations of the product reviews.]
      </p>
    </div>
  );
}
