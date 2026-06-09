'use client';

import { useState } from 'react';

export default function PrefaceClient({ blockIndex }: { blockIndex: number }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartTask = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/study/blocks/${blockIndex}/preface`, {
        method: 'POST',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      if (result.redirectUrl) {
        window.location.replace(result.redirectUrl);
      }
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
      alert('An error occurred.');
    }
  };

  return (
    <div className="flex justify-end pt-8">
      <button
        onClick={handleStartTask}
        disabled={isSubmitting}
        className="px-6 py-3 bg-sky-800 hover:bg-sky-900 disabled:bg-sky-800/200 text-white font-semibold rounded-lg shadow-sm transition-colors text-base"
      >
        {isSubmitting ? 'Loading...' : 'Start Task'}
      </button>
    </div>
  );
}
