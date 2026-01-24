import { useCallback, useEffect, useState } from 'react';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      render: (container: string | HTMLElement, parameters: object) => number;
    };
  }
}

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

export const useRecaptcha = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if grecaptcha is already loaded
    const checkRecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(() => {
          setIsReady(true);
        });
      } else {
        // Retry after a short delay
        setTimeout(checkRecaptcha, 100);
      }
    };

    checkRecaptcha();
  }, []);

  const executeRecaptcha = useCallback(async (action: string): Promise<string | null> => {
    if (!isReady || !RECAPTCHA_SITE_KEY) {
      console.warn('reCAPTCHA not ready or site key not configured');
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution failed:', error);
      return null;
    }
  }, [isReady]);

  return { executeRecaptcha, isReady, siteKey: RECAPTCHA_SITE_KEY };
};
