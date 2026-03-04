import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react";

interface SoundContextType {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playSound: (type: "click" | "success" | "error" | "levelup" | "badge") => void;
}

const SoundContext = createContext<SoundContextType>({
  soundEnabled: true,
  setSoundEnabled: () => {},
  playSound: () => {},
});

// Simple tone generator using Web Audio API
const playTone = (frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.15) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not supported
  }
};

const SOUNDS = {
  click: () => playTone(600, 0.1, "sine", 0.1),
  success: () => {
    playTone(523, 0.15, "sine", 0.12);
    setTimeout(() => playTone(659, 0.15, "sine", 0.12), 100);
    setTimeout(() => playTone(784, 0.2, "sine", 0.12), 200);
  },
  error: () => playTone(200, 0.3, "sawtooth", 0.08),
  levelup: () => {
    playTone(523, 0.12, "sine", 0.12);
    setTimeout(() => playTone(659, 0.12, "sine", 0.12), 80);
    setTimeout(() => playTone(784, 0.12, "sine", 0.12), 160);
    setTimeout(() => playTone(1047, 0.3, "sine", 0.15), 240);
  },
  badge: () => {
    playTone(784, 0.15, "sine", 0.12);
    setTimeout(() => playTone(988, 0.15, "sine", 0.12), 120);
    setTimeout(() => playTone(1175, 0.25, "sine", 0.12), 240);
  },
};

export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const [soundEnabled, setSoundEnabledState] = useState(() => {
    const saved = localStorage.getItem("app-sound-enabled");
    return saved === null ? true : saved === "true";
  });

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    localStorage.setItem("app-sound-enabled", String(enabled));
  }, []);

  const playSound = useCallback((type: keyof typeof SOUNDS) => {
    if (!soundEnabled) return;
    SOUNDS[type]?.();
  }, [soundEnabled]);

  return (
    <SoundContext.Provider value={{ soundEnabled, setSoundEnabled, playSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
