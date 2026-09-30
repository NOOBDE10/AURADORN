import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Smartphone } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if dismissed previously
    const dismissed = (() => { try { return localStorage.getItem('aura_pwa_dismissed'); } catch { return '1'; } })();
    if (dismissed) return;

    // Check iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Wait before suggesting an install, so first-time visitors can shop without interruptions.
    let promptTimer: ReturnType<typeof setTimeout> | undefined;
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      promptTimer = setTimeout(() => setShowBanner(true), 45000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on iOS and not standalone, show after 5 seconds
    if (isIosDevice && !(window.navigator as any).standalone) {
      const timer = setTimeout(() => setShowBanner(true), 45000);
      return () => clearTimeout(timer);
    }

    return () => {
      if (promptTimer) clearTimeout(promptTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    try { localStorage.setItem('aura_pwa_dismissed', 'true'); } catch { /* ignore */ }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-24 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-md z-40 bg-[#1C1815] text-[#FAF8F5] p-4 rounded-2xl border border-[#C9A25D]/60 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#C9A25D]/20 border border-[#C9A25D]/40 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-[#C9A25D]" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-serif text-sm font-semibold text-white">
            Install the Aura Adorn app
          </h4>
          <p className="text-xs font-sans text-stone-300 mt-0.5">
            {isIOS 
              ? 'Tap the Share icon, then "Add to Home Screen" to shop faster next time.'
              : 'Add it to your home screen to shop faster next time.'}
          </p>
          <div className="flex items-center gap-2 mt-3">
            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="px-4 py-1.5 bg-[#C9A25D] hover:bg-[#D8BD86] text-[#1C1815] text-xs font-sans font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install Now</span>
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="text-xs font-sans text-stone-400 hover:text-white px-2 py-1 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-stone-400 hover:text-white p-1"
          aria-label="Close banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
