import React, { useState } from 'react';
import { Delete, History, RotateCcw } from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

interface CalculatorAppProps {
  soundEnabled: boolean;
}

export const CalculatorApp: React.FC<CalculatorAppProps> = ({ soundEnabled }) => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewOperand, setWaitingForNewOperand] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleDigit = (digit: string) => {
    soundEffects.click(soundEnabled);
    soundEffects.haptic(10);

    if (waitingForNewOperand) {
      setDisplay(digit);
      setWaitingForNewOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const handleDecimal = () => {
    soundEffects.click(soundEnabled);
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleClear = () => {
    soundEffects.click(soundEnabled);
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setWaitingForNewOperand(false);
  };

  const handleToggleSign = () => {
    soundEffects.click(soundEnabled);
    const val = parseFloat(display);
    setDisplay((-val).toString());
  };

  const handlePercent = () => {
    soundEffects.click(soundEnabled);
    const val = parseFloat(display);
    setDisplay((val / 100).toString());
  };

  const handleOperator = (nextOp: string) => {
    soundEffects.click(soundEnabled);
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operation) {
      const current = prevValue || 0;
      let result = current;

      if (operation === '+') result = current + inputValue;
      else if (operation === '−') result = current - inputValue;
      else if (operation === '×') result = current * inputValue;
      else if (operation === '÷') result = inputValue !== 0 ? current / inputValue : 0;

      setPrevValue(result);
      setDisplay(result.toString());
      setHistory((prev) => [`${current} ${operation} ${inputValue} = ${result}`, ...prev.slice(0, 9)]);
    }

    setWaitingForNewOperand(true);
    setOperation(nextOp);
  };

  const handleEquals = () => {
    soundEffects.click(soundEnabled);
    const inputValue = parseFloat(display);

    if (prevValue !== null && operation) {
      const current = prevValue;
      let result = current;

      if (operation === '+') result = current + inputValue;
      else if (operation === '−') result = current - inputValue;
      else if (operation === '×') result = current * inputValue;
      else if (operation === '÷') result = inputValue !== 0 ? current / inputValue : 0;

      setDisplay(result.toString());
      setHistory((prev) => [`${current} ${operation} ${inputValue} = ${result}`, ...prev.slice(0, 9)]);
      setPrevValue(null);
      setOperation(null);
      setWaitingForNewOperand(true);
    }
  };

  return (
    <div className="h-full flex flex-col justify-end p-5 pt-14 bg-black text-white select-none">
      {/* Top history toggle */}
      <div className="flex justify-between items-center mb-2 px-2">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-neutral-400 hover:text-white p-2 rounded-full"
          title="تاریخچه محاسبات"
        >
          <History className="w-5 h-5" />
        </button>
        {operation && (
          <span className="text-amber-500 font-mono text-sm">
            {prevValue} {operation}
          </span>
        )}
      </div>

      {showHistory ? (
        <div className="flex-1 overflow-y-auto p-3 bg-neutral-900/60 rounded-3xl mb-4 border border-neutral-800 space-y-2 text-xs">
          <p className="text-neutral-400 font-semibold mb-2">تاریخچه محاسبات اخیر:</p>
          {history.length === 0 ? (
            <p className="text-neutral-500 text-center py-6">محاسبه‌ای انجام نشده است.</p>
          ) : (
            history.map((h, i) => (
              <div key={i} className="p-2 bg-neutral-800 rounded-xl font-mono text-right text-neutral-200">
                {h}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Large Display Output */
        <div className="flex-1 flex items-end justify-end px-3 pb-6">
          <span className="text-6xl font-light font-mono tracking-tight text-white truncate text-right">
            {parseFloat(display).toLocaleString('fa-IR', { maximumFractionDigits: 6 })}
          </span>
        </div>
      )}

      {/* Calculator Buttons Grid */}
      <div className="grid grid-cols-4 gap-3 max-w-[320px] mx-auto w-full pb-4">
        {/* Row 1 */}
        <button
          onClick={handleClear}
          className="aspect-square rounded-full bg-neutral-400 text-black text-xl font-medium active:bg-neutral-300 transition-colors"
        >
          {display !== '0' ? 'C' : 'AC'}
        </button>
        <button
          onClick={handleToggleSign}
          className="aspect-square rounded-full bg-neutral-400 text-black text-xl font-medium active:bg-neutral-300 transition-colors"
        >
          ±
        </button>
        <button
          onClick={handlePercent}
          className="aspect-square rounded-full bg-neutral-400 text-black text-xl font-medium active:bg-neutral-300 transition-colors"
        >
          %
        </button>
        <button
          onClick={() => handleOperator('÷')}
          className={`aspect-square rounded-full text-2xl font-medium transition-colors ${
            operation === '÷' ? 'bg-white text-orange-500' : 'bg-orange-500 text-white active:bg-orange-400'
          }`}
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          onClick={() => handleDigit('7')}
          className="aspect-square rounded-full bg-neutral-800 text-white text-2xl font-medium active:bg-neutral-700 transition-colors"
        >
          7
        </button>
        <button
          onClick={() => handleDigit('8')}
          className="aspect-square rounded-full bg-neutral-800 text-white text-2xl font-medium active:bg-neutral-700 transition-colors"
        >
          8
        </button>
        <button
          onClick={() => handleDigit('9')}
          className="aspect-square rounded-full bg-neutral-800 text-white text-2xl font-medium active:bg-neutral-700 transition-colors"
        >
          9
        </button>
        <button
          onClick={() => handleOperator('×')}
          className={`aspect-square rounded-full text-2xl font-medium transition-colors ${
            operation === '×' ? 'bg-white text-orange-500' : 'bg-orange-500 text-white active:bg-orange-400'
          }`}
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          onClick={() => handleDigit('4')}
          className="aspect-square rounded-full bg-neutral-800 text-white text-2xl font-medium active:bg-neutral-700 transition-colors"
        >
          4
        </button>
        <button
          onClick={() => handleDigit('5')}
          className="aspect-square rounded-full bg-neutral-800 text-white text-2xl font-medium active:bg-neutral-700 transition-colors"
        >
          5
        </button>
        <button
          onClick={() => handleDigit('6')}
          className="aspect-square rounded-full bg-neutral-800 text-white text-2xl font-medium active:bg-neutral-700 transition-colors"
        >
          6
        </button>
        <button
          onClick={() => handleOperator('−')}
          className={`aspect-square rounded-full text-2xl font-medium transition-colors ${
            operation === '−' ? 'bg-white text-orange-500' : 'bg-orange-500 text-white active:bg-orange-400'
          }`}
        >
          −
        </button>

        {/* Row 4 */}
        <button
          onClick={() => handleDigit('1')}
          className="aspect-square rounded-full bg-neutral-800 text-white text-2xl font-medium active:bg-neutral-700 transition-colors"
        >
          1
        </button>
        <button
          onClick={() => handleDigit('2')}
          className="aspect-square rounded-full bg-neutral-800 text-white text-2xl font-medium active:bg-neutral-700 transition-colors"
        >
          2
        </button>
        <button
          onClick={() => handleDigit('3')}
          className="aspect-square rounded-full bg-neutral-800 text-white text-2xl font-medium active:bg-neutral-700 transition-colors"
        >
          3
        </button>
        <button
          onClick={() => handleOperator('+')}
          className={`aspect-square rounded-full text-2xl font-medium transition-colors ${
            operation === '+' ? 'bg-white text-orange-500' : 'bg-orange-500 text-white active:bg-orange-400'
          }`}
        >
          +
        </button>

        {/* Row 5 */}
        <button
          onClick={() => handleDigit('0')}
          className="col-span-2 rounded-full bg-neutral-800 text-white text-2xl font-medium px-6 text-left flex items-center active:bg-neutral-700 transition-colors"
        >
          0
        </button>
        <button
          onClick={handleDecimal}
          className="aspect-square rounded-full bg-neutral-800 text-white text-2xl font-medium active:bg-neutral-700 transition-colors"
        >
          .
        </button>
        <button
          onClick={handleEquals}
          className="aspect-square rounded-full bg-orange-500 text-white text-2xl font-medium active:bg-orange-400 transition-colors"
        >
          =
        </button>
      </div>
    </div>
  );
};
