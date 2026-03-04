'use client';

interface InformationNeedBannerProps {
  task: string;
  onHelp?: () => void;
  onSubmit?: () => void;
}

export function InformationNeedBanner({
  task,
  onHelp = () => {},
  onSubmit = () => {},
}: InformationNeedBannerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-sky-50 border-b border-sky-200 rounded-b-xl px-4 py-2 h-20 flex items-center justify-between shadow-sm">
      <button
        type="button"
        onClick={onHelp}
        className="flex items-center gap-1.5 text-xs font-medium text-white border border-sky-800 rounded-lg px-3 py-1.5 bg-sky-800 hover:bg-sky-700 transition"
      >
        <span>?</span> Open help
      </button>
      <p className="text-xs text-slate-700 font-medium text-center max-w-2xl leading-snug px-4">
        {task}
      </p>
      <button
        type="button"
        onClick={onSubmit}
        className="flex items-center gap-1.5 text-xs font-medium text-white bg-sky-900 rounded-lg px-3 py-1.5 hover:bg-sky-800 transition"
      >
        ✓ Submit answer
      </button>
    </div>
  );
}
