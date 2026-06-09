export function ChatbotPlaceholder() {
  return (
    <div className="w-full h-96 bg-slate-100 border border-slate-300 rounded-lg flex flex-col items-center justify-center p-6 text-center text-slate-500 shadow-inner">
      <svg className="w-16 h-16 mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      <h3 className="text-lg font-semibold text-slate-700">AI Chatbot Assistant</h3>
      <p className="mt-2 text-sm max-w-sm">
        [Placeholder: The interactive chatbot interface will be embedded here for the actual study, allowing users to query product reviews.]
      </p>
    </div>
  );
}
