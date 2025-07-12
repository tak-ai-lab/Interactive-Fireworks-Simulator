
import React from 'react';
import { useRef } from 'react';
import FireworksCanvas from './components/FireworksCanvas';
import Controls from './components/Controls';
import type { CanvasHandles, FireworkType } from './types';

export default function App(): React.ReactNode {
  const canvasRef = useRef<CanvasHandles>(null);

  const handleLaunch = (type: FireworkType): void => {
    canvasRef.current?.launch(type);
  };

  const handleLaunchStarMine = (): void => {
    canvasRef.current?.launchStarMine();
  };

  return (
    <main className="relative h-screen w-screen bg-black">
      <FireworksCanvas ref={canvasRef} />
      <Controls onLaunch={handleLaunch} onStarMine={handleLaunchStarMine} />
      <div className="absolute top-4 left-4 text-white/80 text-xs sm:text-sm bg-black/30 p-2 rounded-lg">
        <h1 className="font-bold text-lg sm:text-xl text-white">デジタル花火シミュレーター</h1>
        <p>下のボタンで花火を打ち上げよう！</p>
      </div>
    </main>
  );
}
