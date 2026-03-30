import React from 'react';
import { IPA_SYMBOLS } from '../constants';
import { cn } from '../lib/utils';

interface IPAKeyboardProps {
  onSymbolClick: (symbol: string) => void;
  className?: string;
}

export const IPAKeyboard: React.FC<IPAKeyboardProps> = ({ onSymbolClick, className }) => {
  const allSymbols = [
    ...IPA_SYMBOLS.vowels,
    ...IPA_SYMBOLS.nasals,
    ...IPA_SYMBOLS.semivowels,
    ...IPA_SYMBOLS.consonants,
    ...IPA_SYMBOLS.diacritics
  ];

  return (
    <div className={cn("bg-zinc-50 p-4 rounded-2xl border border-zinc-200 shadow-sm", className)}>
      <div className="flex flex-wrap gap-2 justify-center">
        {allSymbols.map((symbol) => (
          <button
            key={symbol}
            onClick={() => onSymbolClick(symbol)}
            className="w-10 h-10 flex items-center justify-center bg-white hover:bg-zinc-100 text-zinc-900 rounded-xl border border-zinc-200 transition-colors font-serif text-lg shadow-sm"
          >
            {symbol}
          </button>
        ))}
      </div>
    </div>
  );
};
