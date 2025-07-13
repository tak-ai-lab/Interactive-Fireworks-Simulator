import React from 'react';
import { FireworkType } from '../types';

interface ControlsProps {
  onLaunch: (type: FireworkType) => void;
  onStarMine: () => void;
}

const ControlButton: React.FC<{ onClick: () => void; children: React.ReactNode, className?: string }> = ({ onClick, children, className }) => (
  <button
    onClick={onClick}
    className={`bg-gray-800/60 hover:bg-gray-700/80 focus:ring-gray-500 px-3 py-2 sm:px-4 text-sm sm:text-base font-semibold text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-200 ease-in-out transform hover:scale-105 ${className}`}
  >
    {children}
  </button>
);


export default function Controls({ onLaunch, onStarMine }: ControlsProps): React.ReactNode {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] z-10">
      <div className="max-w-xl mx-auto bg-gray-900/50 backdrop-blur-md p-3 sm:p-4 rounded-xl shadow-2xl">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <ControlButton onClick={() => onLaunch(FireworkType.KIKU)}>
            菊
          </ControlButton>
          <ControlButton onClick={() => onLaunch(FireworkType.BOTAN)}>
            牡丹
          </ControlButton>
          <ControlButton onClick={() => onLaunch(FireworkType.HEART)}>
            ❤️
          </ControlButton>
          <ControlButton onClick={() => onLaunch(FireworkType.SMILEY)}>
            😊
          </ControlButton>
          <ControlButton onClick={onStarMine} className="col-span-2 sm:col-span-1 font-bold">
            スターマイン
          </ControlButton>
        </div>
      </div>
    </div>
  );
}