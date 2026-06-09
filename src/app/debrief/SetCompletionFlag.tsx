'use client';

import { useEffect } from 'react';

export function SetCompletionFlag() {
  useEffect(() => {
    // Level 1 multiple-participation protection: set flag on completion
    localStorage.setItem('study_completed', 'true');
  }, []);

  return null;
}
