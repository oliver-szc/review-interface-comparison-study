'use client';

import { useEffect } from 'react';

/**
 * A utility component that synchronizes the CSS `:user-invalid` state 
 * with the `aria-invalid` attribute globally, ensuring that screen readers 
 * only announce validation errors after the user has interacted with the field,
 * matching the visual feedback behavior.
 */
export function AriaInvalidSync() {
  useEffect(() => {
    const updateAriaState = (event: Event) => {
      const input = event.target as Element;
      if (!input.matches?.('input, textarea, select')) return;

      // Check if the browser currently considers this input "user-invalid"
      const isUserInvalid = input.matches(':user-invalid');
      
      if (isUserInvalid) {
        input.setAttribute('aria-invalid', 'true');
      } else {
        input.removeAttribute('aria-invalid');
      }
    };

    // 'blur' and 'focus' do not bubble, so we must use the capture phase (true).
    document.addEventListener('blur', updateAriaState, true);
    document.addEventListener('focus', updateAriaState, true);

    // Update on input if we've already shown the error, 
    // so the error clears immediately when fixed.
    const handleInput = (event: Event) => {
      const input = event.target as Element;
      if (!input.matches?.('input, textarea, select')) return;

      const hasAriaInvalid = input.hasAttribute('aria-invalid');
      const ariaInvalid = input.getAttribute('aria-invalid');
      if (hasAriaInvalid && ariaInvalid === 'true') {
        updateAriaState(event);
      }
    };
    
    document.addEventListener('input', handleInput);

    return () => {
      document.removeEventListener('blur', updateAriaState, true);
      document.removeEventListener('focus', updateAriaState, true);
      document.removeEventListener('input', handleInput);
    };
  }, []);

  return null; // This is purely a behavioral component
}
