import { useCallback, useEffect, useState } from 'react';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
    RECAPTCHA_READY: boolean;
  }
}

// Site Key is a publishable key, safe to include in frontend code
const RECAPTCHA_SITE_KEY = '6Lec4lQsAAAAALc2PnDdGGbTbBazhczfwVMfUR0v';

export const useRecaptcha = () => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Don't load if no site key configured
    if (!RECAPTCHA_SITE_KEY) {
      console.warn('reCAPTCHA site key not configured');
      return;
    }

    // Check if already loaded
    if (window.grecaptcha && window.RECAPTCHA_READY) {
      setIsReady(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="recaptcha/api.js"]');
    if (existingScript) {
      // Wait for it to load
      const checkReady = setInterval(() => {
        if (window.grecaptcha && window.grecaptcha.ready) {
          window.grecaptcha.ready(() => {
            window.RECAPTCHA_READY = true;
            setIsReady(true);
            clearInterval(checkReady);
          });
        }
      }, 100);
      return () => clearInterval(checkReady);
    }

    // Load reCAPTCHA script dynamically
    setIsLoading(true);
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // Wait for grecaptcha to be ready
      const checkReady = setInterval(() => {
        if (window.grecaptcha && window.grecaptcha.ready) {
          window.grecaptcha.ready(() => {
            window.RECAPTCHA_READY = true;
            setIsReady(true);
            setIsLoading(false);
            clearInterval(checkReady);
          });
        }
      }, 100);
    };

    script.onerror = () => {
      console.error('Failed to load reCAPTCHA script');
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup not needed as reCAPTCHA should persist
    };
  }, []);

  const executeRecaptcha = useCallback(async (action: string): Promise<string | null> => {
    if (!RECAPTCHA_SITE_KEY) {
      console.warn('reCAPTCHA site key not configured');
      return null;
    }

    if (!isReady || !window.grecaptcha) {
      console.warn('reCAPTCHA not ready yet');
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
      console.log('reCAPTCHA token generated successfully');
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution failed:', error);
      return null;
    }
  }, [isReady]);

  return { 
    executeRecaptcha, 
    isReady, 
    isLoading,
    siteKey: RECAPTCHA_SITE_KEY,
    hasSiteKey: !!RECAPTCHA_SITE_KEY 
  };
};
