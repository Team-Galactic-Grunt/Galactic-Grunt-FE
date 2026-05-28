import { createContext, useContext, useRef, useEffect } from 'react';
import { battleBgm } from '../assets/bgm';

const BgmContext = createContext(null);

// 모듈 로드 시점에 미리 로딩
const cache = new Map();
[battleBgm].forEach((src) => {
  const audio = new Audio(src);
  audio.preload = 'auto';
  audio.loop = true;
  cache.set(src, audio);
});

export function BgmProvider({ children }) {
  const audioRef = useRef(null);

  // 첫 키 입력 시 모든 오디오를 강제 버퍼링
  useEffect(() => {
    const unlock = () => {
      cache.forEach((audio) => {
        audio.play().then(() => {
          audio.pause();
          audio.currentTime = 0;
        }).catch(() => {});
      });
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('keydown', unlock);
    return () => window.removeEventListener('keydown', unlock);
  }, []);

  const play = (src, startTime = 0) => {
    const next = cache.get(src) ?? new Audio(src);
    if (audioRef.current === next) return;
    audioRef.current?.pause();
    audioRef.current = next;
    audioRef.current.loop = true;
    audioRef.current.currentTime = startTime;
    audioRef.current.play().catch(() => {});
  };

  const stop = () => {
    audioRef.current?.pause();
    audioRef.current = null;
  };

  return (
    <BgmContext.Provider value={{ play, stop }}>{children}</BgmContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useBgm = () => {
  const context = useContext(BgmContext);
  if (!context) throw new Error('useBgm must be used within BgmProvider');
  return context;
};
