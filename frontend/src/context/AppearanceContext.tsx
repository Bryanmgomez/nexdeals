import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type BgType = 'default' | 'image' | 'animated';
export type AnimId = 'space' | 'aurora' | 'cyberpunk' | 'ocean' | 'galaxy';

export interface Appearance {
  theme: 'dark' | 'light';
  bgType: BgType;
  animatedId: AnimId;
  imageData: string | null;
  fit: 'cover' | 'contain' | 'center';
  blur: number;
  opacity: number;
  bgBrightness: number;
  bgContrast: number;
  bgSaturation: number;
  layerOpacity: number;
  aurora: boolean;
  auroraColor: string;
  auroraIntensity: number;
  speedButtons: number;
  speedCards: number;
  speedBg: number;
}

const DEFAULT: Appearance = {
  theme: 'dark',
  bgType: 'default',
  animatedId: 'space',
  imageData: null,
  fit: 'cover',
  blur: 0,
  opacity: 0.6,
  bgBrightness: 100,
  bgContrast: 100,
  bgSaturation: 100,
  layerOpacity: 0,
  aurora: true,
  auroraColor: '#00d4ff',
  auroraIntensity: 3,
  speedButtons: 4,
  speedCards: 6,
  speedBg: 10,
};

interface Ctx {
  appearance: Appearance;
  setAppearance: (a: Partial<Appearance>) => void;
  reset: () => void;
}

const C = createContext<Ctx | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [appearance, setA] = useState<Appearance>(() => {
    try {
      const raw = localStorage.getItem('nex_appearance_v3');
      return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
    } catch { return DEFAULT; }
  });

  const setAppearance = (patch: Partial<Appearance>) => {
    setA(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem('nex_appearance_v3', JSON.stringify(next));
      return next;
    });
  };

  const reset = () => { setAppearance(DEFAULT); };

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', appearance.theme === 'dark');
    document.documentElement.classList.toggle('light', appearance.theme === 'light');
    document.body.style.backgroundColor = appearance.theme === 'dark' ? '#0a0e1a' : '#f3f4f6';
    document.body.style.color = appearance.theme === 'dark' ? '#e5e7eb' : '#111827';
  }, [appearance.theme]);

  // Apply aurora
  useEffect(() => {
    document.body.classList.toggle('aurora-on', appearance.aurora);
    document.body.classList.toggle('aurora-multicolor', appearance.aurora && appearance.auroraColor === 'multicolor');
    const color = appearance.auroraColor === 'multicolor' ? '#ec4899' : appearance.auroraColor;
    document.documentElement.style.setProperty('--aurora-color', color);
    document.documentElement.style.setProperty('--aurora-intensity', String(appearance.auroraIntensity));
    document.documentElement.style.setProperty('--aurora-speed-buttons', appearance.speedButtons + 's');
    document.documentElement.style.setProperty('--aurora-speed-cards', appearance.speedCards + 's');
    document.documentElement.style.setProperty('--aurora-speed-bg', appearance.speedBg + 's');
  }, [appearance.aurora, appearance.auroraColor, appearance.auroraIntensity]);

  // Apply background image
  useEffect(() => {
    if (appearance.bgType === 'image' && appearance.imageData) {
      const fit = appearance.fit === 'cover' ? 'cover' : appearance.fit === 'contain' ? 'contain' : 'auto';
      document.body.style.backgroundImage = `url(${appearance.imageData})`;
      document.body.style.backgroundSize = fit;
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.filter = `brightness(${appearance.bgBrightness}%) contrast(${appearance.bgContrast}%) saturate(${appearance.bgSaturation}%)`;
    } else {
      document.body.style.backgroundImage = '';
      document.body.style.filter = '';
    }
  }, [appearance.bgType, appearance.imageData, appearance.fit]);

  return (
    <C.Provider value={{ appearance, setAppearance, reset }}>
      {children}
      <BackgroundLayer appearance={appearance} />
    </C.Provider>
  );
}

function BackgroundLayer({ appearance }: { appearance: Appearance }) {
  if (appearance.bgType !== 'animated') return null;
  const id = appearance.animatedId;
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" style={{ opacity: appearance.opacity, filter: `blur(${appearance.blur}px)` }}>
      {id === 'space' && <SpaceBg />}
      {id === 'aurora' && <AuroraBg />}
      {id === 'cyberpunk' && <CyberpunkBg />}
      {id === 'ocean' && <OceanBg />}
      {id === 'galaxy' && <GalaxyBg />}
    </div>
  );
}

function SpaceBg() {
  return (
    <div className="w-full h-full bg-black relative">
      <div className="stars" />
      <div className="stars2" />
      <div className="stars3" />
      <style>{`
        .stars,.stars2,.stars3{position:absolute;inset:0;background:transparent;}
        .stars{background-image:radial-gradient(1px 1px at 20% 30%,#fff,transparent),radial-gradient(1px 1px at 70% 80%,#fff,transparent),radial-gradient(1.5px 1.5px at 40% 60%,#fff,transparent),radial-gradient(1px 1px at 90% 10%,#fff,transparent);animation:moveStars var(--aurora-speed-bg,10s) linear infinite;}
        .stars2{background-image:radial-gradient(1px 1px at 10% 50%,#a78bfa,transparent),radial-gradient(1.5px 1.5px at 60% 20%,#60a5fa,transparent),radial-gradient(1px 1px at 80% 70%,#fff,transparent);animation:moveStars calc(var(--aurora-speed-bg,10s)*1.5) linear infinite;opacity:.7;}
        .stars3{background-image:radial-gradient(2px 2px at 30% 40%,#f472b6,transparent),radial-gradient(1px 1px at 85% 90%,#fff,transparent);animation:moveStars calc(var(--aurora-speed-bg,10s)*2) linear infinite;opacity:.5;}
        @keyframes moveStars{from{transform:translateY(0)}to{transform:translateY(-200px)}}
      `}</style>
    </div>
  );
}

function AuroraBg() {
  return (
    <div className="w-full h-full relative" style={{ background: 'linear-gradient(180deg,#0a0e1a,#0f172a)' }}>
      <div className="aurora-light" />
      <style>{`
        .aurora-light{position:absolute;inset:-50%;background:radial-gradient(circle at 30% 40%,rgba(34,197,94,.4),transparent 40%),radial-gradient(circle at 70% 50%,rgba(59,130,246,.4),transparent 40%),radial-gradient(circle at 50% 70%,rgba(139,92,246,.35),transparent 40%);animation:auroraMove var(--aurora-speed-bg,10s) ease-in-out infinite;filter:blur(40px);}
        @keyframes auroraMove{0%,100%{transform:translate(0,0) rotate(0deg)}50%{transform:translate(-5%,5%) rotate(10deg)}}
      `}</style>
    </div>
  );
}

function CyberpunkBg() {
  return (
    <div className="w-full h-full relative" style={{ background: 'linear-gradient(180deg,#0a0014,#1a0033)' }}>
      <div className="cyber" />
      <style>{`
        .cyber{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(139,92,246,.08) 0px,transparent 2px,transparent 40px),repeating-linear-gradient(90deg,rgba(0,212,255,.06) 0px,transparent 2px,transparent 60px);animation:cyberPulse var(--aurora-speed-bg,10s) ease-in-out infinite;}
        @keyframes cyberPulse{0%,100%{opacity:.6}50%{opacity:1}}
      `}</style>
    </div>
  );
}

function OceanBg() {
  return (
    <div className="w-full h-full relative" style={{ background: 'linear-gradient(180deg,#001a33,#003366)' }}>
      <div className="ocean" />
      <style>{`
        .ocean{position:absolute;inset:0;background:radial-gradient(circle at 20% 80%,rgba(59,130,246,.4),transparent 40%),radial-gradient(circle at 80% 60%,rgba(0,212,255,.3),transparent 40%);animation:oceanMove var(--aurora-speed-bg,10s) ease-in-out infinite;filter:blur(20px);}
        @keyframes oceanMove{0%,100%{transform:translateY(0)}50%{transform:translateY(-30px)}}
      `}</style>
    </div>
  );
}

function GalaxyBg() {
  return (
    <div className="w-full h-full relative" style={{ background: 'radial-gradient(circle at 50% 50%,#1a0033,#0a0e1a)' }}>
      <div className="galaxy" />
      <style>{`
        .galaxy{position:absolute;inset:-20%;background:conic-gradient(from 0deg at 50% 50%,rgba(139,92,246,.3),rgba(236,72,153,.2),rgba(59,130,246,.3),rgba(139,92,246,.3));animation:galaxySpin calc(var(--aurora-speed-bg,10s)*3) linear infinite;filter:blur(60px);}
        @keyframes galaxySpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}

export const useAppearance = () => {
  const c = useContext(C);
  if (!c) throw new Error('no appearance');
  return c;
};